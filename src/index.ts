import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import jwt from '@fastify/jwt'
import { z } from 'zod'
import nodemailer from 'nodemailer'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma.js'

const app = Fastify({ logger: true })

await app.register(cors, { origin: process.env.CORS_ORIGIN || true })
await app.register(swagger, {
  openapi: {
    info: { title: 'VCARS API', version: '0.1.0' },
  },
})
await app.register(swaggerUi, { routePrefix: '/docs' })

// --- Auth (JWT)
await app.register(jwt, {
  secret: process.env.JWT_SECRET || 'dev-secret',
})

app.decorate('auth', async (req: any, reply: any) => {
  try {
    await req.jwtVerify()
  } catch {
    return reply.code(401).send({ ok: false, error: 'No autorizado' })
  }
})

type JwtUser = {
  sub: string
  username: string
  role: 'ADMIN' | 'TECH' | 'CLIENT'
}

function signToken(payload: JwtUser) {
  // 7 días
  return (app as any).jwt.sign(payload, { expiresIn: '7d' })
}

async function seedDemoUsersIfNeeded() {
  if (String(process.env.SEED_DEMO_USERS || '').toLowerCase() !== 'true') return

  const count = await prisma.user.count()
  if (count > 0) return

  const pass = await bcrypt.hash('1234', 10)

  await prisma.user.createMany({
    data: [
      { username: 'admin', passwordHash: pass, role: 'ADMIN' },
      { username: 'tecnico', passwordHash: pass, role: 'TECH' },
      { username: 'cliente', passwordHash: pass, role: 'CLIENT' },
    ],
  })
}

await seedDemoUsersIfNeeded()

app.post(
  '/auth/login',
  {
    schema: {
      body: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string' },
          password: { type: 'string' },
        },
      },
    },
  },
  async (req, reply) => {
    let body: { username: string; password: string }
    try {
      body = z
        .object({
          username: z.string().min(1),
          password: z.string().min(1),
        })
        .parse(req.body)
    } catch {
      return reply.code(400).send({ ok: false, error: 'Body inválido (username y password)' })
    }

    const username = body.username.trim().toLowerCase()
  const user = await prisma.user.findUnique({ where: { username } })
  if (!user) return { ok: false, error: 'Usuario o contraseña incorrectos' }

  const ok = await bcrypt.compare(body.password, user.passwordHash)
  if (!ok) return { ok: false, error: 'Usuario o contraseña incorrectos' }

  const token = signToken({ sub: user.id, username: user.username, role: user.role as any })
    return {
      ok: true,
      token,
      user: { id: user.id, username: user.username, role: user.role },
    }
  },
)

app.get('/auth/me', { preHandler: (app as any).auth }, async (req: any) => {
  return { ok: true, user: req.user }
})

app.get('/', async () => ({
  ok: true,
  name: 'vcars-api',
  docs: '/docs',
  healthz: '/healthz',
}))

app.get('/healthz', async () => ({ ok: true }))

// --- Customers
app.post('/customers', async (req) => {
  const body = z
    .object({
      name: z.string().min(1),
      email: z.string().email().optional().or(z.literal('')),
      phone: z.string().optional().or(z.literal('')),
    })
    .parse(req.body)

  const customer = await prisma.customer.create({
    data: {
      name: body.name,
      email: body.email || null,
      phone: body.phone || null,
    },
  })

  return { ok: true, customer }
})

app.get('/customers', async () => {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  return { ok: true, customers }
})

// --- Vehicles
app.post('/vehicles', async (req) => {
  const body = z
    .object({
      plate: z.string().min(3),
      brand: z.string().optional().or(z.literal('')),
      model: z.string().optional().or(z.literal('')),
      color: z.string().optional().or(z.literal('')),
      year: z.string().optional().or(z.literal('')),
      customer: z
        .object({
          id: z.string().uuid().optional(),
          name: z.string().min(1).optional(),
          email: z.string().email().optional().or(z.literal('')),
          phone: z.string().optional().or(z.literal('')),
        })
        .optional(),
    })
    .parse(req.body)

  const plate = body.plate.trim().toUpperCase()

  const customerId = await (async () => {
    if (body.customer?.id) return body.customer.id
    if (body.customer?.name) {
      const c = await prisma.customer.create({
        data: {
          name: body.customer.name,
          email: body.customer.email || null,
          phone: body.customer.phone || null,
        },
      })
      return c.id
    }
    throw new Error('customer is required (id or name)')
  })()

  const vehicle = await prisma.vehicle.create({
    data: {
      plate,
      brand: body.brand || null,
      model: body.model || null,
      color: body.color || null,
      year: body.year || null,
      customerId,
    },
    include: { customer: true },
  })

  return { ok: true, vehicle }
})

app.get('/vehicles', async (req) => {
  const q = z
    .object({
      plate: z.string().optional(),
      take: z.coerce.number().int().min(1).max(100).optional(),
    })
    .parse((req as any).query || {})

  const where = q.plate ? { plate: q.plate.trim().toUpperCase() } : undefined
  const vehicles = await prisma.vehicle.findMany({
    where,
    include: { customer: true },
    orderBy: { updatedAt: 'desc' },
    take: q.take || 50,
  })

  return { ok: true, vehicles }
})

app.get('/vehicles/:plate', async (req) => {
  const params = z.object({ plate: z.string().min(1) }).parse((req as any).params)
  const plate = params.plate.trim().toUpperCase()

  const vehicle = await prisma.vehicle.findUnique({
    where: { plate },
    include: { customer: true, entries: { orderBy: { createdAt: 'desc' }, take: 20 } },
  })

  if (!vehicle) return { ok: false, error: 'Vehicle not found' }
  return { ok: true, vehicle }
})

// Workshop entry (Ingreso)
app.post('/vehicles/:vehicleId/entries', async (req) => {
  const params = z.object({ vehicleId: z.string().uuid() }).parse((req as any).params)
  const body = z
    .object({
      receivedBy: z.string().optional().or(z.literal('')),
      notes: z.string().optional().or(z.literal('')),
      mileageKm: z.coerce.number().int().min(0).optional(),
      fuelLevel: z.string().optional().or(z.literal('')),
    })
    .parse(req.body)

  const entry = await prisma.entry.create({
    data: {
      vehicleId: params.vehicleId,
      receivedBy: body.receivedBy || null,
      notes: body.notes || null,
      mileageKm: typeof body.mileageKm === 'number' ? body.mileageKm : null,
      fuelLevel: body.fuelLevel || null,
    },
  })

  return { ok: true, entry }
})

// TODO: quotes + notifications

const port = Number(process.env.PORT || 4000)
app.listen({ port, host: '0.0.0.0' })
