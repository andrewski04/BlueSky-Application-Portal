-- AlterTable
ALTER TABLE "ApplicationResponse" ADD COLUMN     "formGroupId" TEXT;

-- AddForeignKey
ALTER TABLE "ApplicationResponse" ADD CONSTRAINT "ApplicationResponse_formGroupId_fkey" FOREIGN KEY ("formGroupId") REFERENCES "ApplicationFormGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
