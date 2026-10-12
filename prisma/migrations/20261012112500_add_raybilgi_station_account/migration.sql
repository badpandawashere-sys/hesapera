-- CreateTable
CREATE TABLE "RayBilgiStationAccount" (
    "id" TEXT NOT NULL,
    "stationCode" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "stationName" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "passwordChangedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RayBilgiStationAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RayBilgiStationAccount_stationCode_key" ON "RayBilgiStationAccount"("stationCode");

-- CreateIndex
CREATE UNIQUE INDEX "RayBilgiStationAccount_username_key" ON "RayBilgiStationAccount"("username");

-- CreateIndex
CREATE INDEX "RayBilgiStationAccount_username_idx" ON "RayBilgiStationAccount"("username");
