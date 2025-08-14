/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `ApplicationFormGroup` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ApplicationFormGroup_name_key" ON "ApplicationFormGroup"("name");
