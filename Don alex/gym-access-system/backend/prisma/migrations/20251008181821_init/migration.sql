/*
  Warnings:

  - The primary key for the `Acceso` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Acceso` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Administrador` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `rol` on the `Administrador` table. All the data in the column will be lost.
  - You are about to drop the column `usuario` on the `Administrador` table. All the data in the column will be lost.
  - The `id` column on the `Administrador` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Membresia` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Membresia` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Plan` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Plan` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Usuario` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `cedula` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `foto` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `huellaTemplate` on the `Usuario` table. All the data in the column will be lost.
  - The `id` column on the `Usuario` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[email]` on the table `Administrador` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dispositivo` to the `Acceso` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `usuarioId` on the `Acceso` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `email` to the `Administrador` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Administrador` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Membresia` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `usuarioId` on the `Membresia` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `planId` on the `Membresia` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updatedAt` to the `Plan` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Acceso" DROP CONSTRAINT "Acceso_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Membresia" DROP CONSTRAINT "Membresia_planId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Membresia" DROP CONSTRAINT "Membresia_usuarioId_fkey";

-- DropIndex
DROP INDEX "public"."Administrador_usuario_key";

-- DropIndex
DROP INDEX "public"."Usuario_cedula_key";

-- AlterTable
ALTER TABLE "Acceso" DROP CONSTRAINT "Acceso_pkey",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dispositivo" TEXT NOT NULL,
ADD COLUMN     "verificado" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "usuarioId",
ADD COLUMN     "usuarioId" INTEGER NOT NULL,
ALTER COLUMN "fechaHora" DROP DEFAULT,
ADD CONSTRAINT "Acceso_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Administrador" DROP CONSTRAINT "Administrador_pkey",
DROP COLUMN "rol",
DROP COLUMN "usuario",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Administrador_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Membresia" DROP CONSTRAINT "Membresia_pkey",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "usuarioId",
ADD COLUMN     "usuarioId" INTEGER NOT NULL,
DROP COLUMN "planId",
ADD COLUMN     "planId" INTEGER NOT NULL,
ALTER COLUMN "estado" SET DEFAULT 'ACTIVA',
ADD CONSTRAINT "Membresia_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Plan" DROP CONSTRAINT "Plan_pkey",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Plan_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Usuario" DROP CONSTRAINT "Usuario_pkey",
DROP COLUMN "cedula",
DROP COLUMN "foto",
DROP COLUMN "huellaTemplate",
ADD COLUMN     "dispositivoId" INTEGER,
ADD COLUMN     "huellaRegistrada" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "telefono" DROP NOT NULL,
ADD CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Administrador_email_key" ON "Administrador"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Membresia_usuarioId_key" ON "Membresia"("usuarioId");

-- AddForeignKey
ALTER TABLE "Acceso" ADD CONSTRAINT "Acceso_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membresia" ADD CONSTRAINT "Membresia_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membresia" ADD CONSTRAINT "Membresia_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
