-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "member_number" TEXT NOT NULL,
    "current_belt" TEXT NOT NULL DEFAULT 'Sabuk Putih (10 Geup)',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coach" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "dan_rank" TEXT NOT NULL,
    "specialty" TEXT NOT NULL DEFAULT 'Kyorugi & Poomsae',
    "experience" TEXT NOT NULL DEFAULT '10+ Tahun',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coach_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeltRank" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "next_belt_id" TEXT,

    CONSTRAINT "BeltRank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeltHistory" (
    "id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "from_belt" TEXT NOT NULL,
    "to_belt" TEXT NOT NULL,
    "promoted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BeltHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UktExam" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "examiner_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'UPCOMING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UktExam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UktParticipant" (
    "id" TEXT NOT NULL,
    "ukt_exam_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "target_belt" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "poomsae_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "kyorugi_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "basic_tech_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "physical_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "theory_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "final_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "permission_letter" TEXT,
    "photo_url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UktParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "cert_number" TEXT NOT NULL,
    "old_belt" TEXT NOT NULL,
    "new_belt" TEXT NOT NULL,
    "issue_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "qr_code_url" TEXT NOT NULL,
    "is_valid" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gallery" (
    "id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Gallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "purpose" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Member_user_id_key" ON "Member"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Member_member_number_key" ON "Member"("member_number");

-- CreateIndex
CREATE UNIQUE INDEX "Coach_user_id_key" ON "Coach"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "BeltRank_name_key" ON "BeltRank"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_cert_number_key" ON "Certificate"("cert_number");

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coach" ADD CONSTRAINT "Coach_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeltHistory" ADD CONSTRAINT "BeltHistory_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UktExam" ADD CONSTRAINT "UktExam_examiner_id_fkey" FOREIGN KEY ("examiner_id") REFERENCES "Coach"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UktParticipant" ADD CONSTRAINT "UktParticipant_ukt_exam_id_fkey" FOREIGN KEY ("ukt_exam_id") REFERENCES "UktExam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UktParticipant" ADD CONSTRAINT "UktParticipant_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
