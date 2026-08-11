-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN     "recipientName" TEXT,
ALTER COLUMN "receiverId" DROP NOT NULL;

