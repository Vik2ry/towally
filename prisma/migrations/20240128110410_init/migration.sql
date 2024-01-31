-- CreateEnum
CREATE TYPE "Country" AS ENUM ('NIGERIA');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "country" "Country" NOT NULL,
    "zipcode" INTEGER NOT NULL,
    "profession" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "link" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
