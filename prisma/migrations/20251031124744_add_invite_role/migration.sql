-- AlterTable
ALTER TABLE "BoardInvitation" ADD COLUMN     "role" "RoleType" NOT NULL DEFAULT 'viewer';

-- AlterTable
ALTER TABLE "BoardMember" ALTER COLUMN "role" SET DEFAULT 'viewer';
