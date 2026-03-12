import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { z } from 'zod'
import nodemailer from 'nodemailer'

const app = Fastify({ logger: true })

await app.register(cors, { origin: process.env.CORS_ORIGIN || true })
await app.register(swagger, {
  openapi: {
    info: { title: 'VCARS API', version: '0.1.0' },
  },
})
await app.register(swaggerUi, { routePrefix: '/docs' })

app.get('/healthz', async () => ({ ok: true }))

// TODO: plug Prisma client + real routes.
app.get('/_placeholder', async () => ({
  note: 'MVP scaffold created. Next step: add Prisma client and routes.'
}))

const port = Number(process.env.PORT || 4000)
app.listen({ port, host: '0.0.0.0' })
