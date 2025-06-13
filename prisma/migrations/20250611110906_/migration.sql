-- CreateTable
CREATE TABLE "AdminConfig" (
    "id" TEXT NOT NULL DEFAULT 'admin',
    "pin" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminConfig_pkey" PRIMARY KEY ("id")
);
