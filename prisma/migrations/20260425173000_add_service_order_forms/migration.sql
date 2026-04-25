-- CreateTable
CREATE TABLE "ServiceOrderForm" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "formsJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceOrderForm_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceOrderForm_vehicleId_key" ON "ServiceOrderForm"("vehicleId");

-- AddForeignKey
ALTER TABLE "ServiceOrderForm" ADD CONSTRAINT "ServiceOrderForm_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
