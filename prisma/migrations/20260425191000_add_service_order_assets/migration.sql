-- CreateTable
CREATE TABLE "ServiceOrderAsset" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "stepKey" TEXT NOT NULL,
    "fieldKey" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "publicUrl" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "byteSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceOrderAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceOrderAsset_vehicleId_stepKey_fieldKey_key" ON "ServiceOrderAsset"("vehicleId", "stepKey", "fieldKey");

-- CreateIndex
CREATE INDEX "ServiceOrderAsset_vehicleId_stepKey_idx" ON "ServiceOrderAsset"("vehicleId", "stepKey");

-- AddForeignKey
ALTER TABLE "ServiceOrderAsset" ADD CONSTRAINT "ServiceOrderAsset_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
