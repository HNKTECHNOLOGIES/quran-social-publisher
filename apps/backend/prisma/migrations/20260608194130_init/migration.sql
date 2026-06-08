-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'ADMIN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verses" (
    "id" TEXT NOT NULL,
    "surah" INTEGER NOT NULL,
    "verse_number" INTEGER NOT NULL,
    "verse_key" TEXT NOT NULL,
    "arabic_text" TEXT NOT NULL,
    "french_translation" TEXT NOT NULL,
    "english_translation" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tafsirs" (
    "id" TEXT NOT NULL,
    "verse_id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tafsirs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "verse_id" TEXT,
    "arabic_content" TEXT,
    "french_content" TEXT,
    "english_content" TEXT,
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "scheduled_at" TIMESTAMP(3),
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facebook_accounts" (
    "id" TEXT NOT NULL,
    "page_id" TEXT NOT NULL,
    "page_name" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facebook_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "verses_verse_key_key" ON "verses"("verse_key");

-- CreateIndex
CREATE UNIQUE INDEX "verses_surah_verse_number_key" ON "verses"("surah", "verse_number");

-- CreateIndex
CREATE UNIQUE INDEX "tafsirs_verse_id_source_key" ON "tafsirs"("verse_id", "source");

-- CreateIndex
CREATE INDEX "posts_status_idx" ON "posts"("status");

-- CreateIndex
CREATE INDEX "posts_scheduled_at_idx" ON "posts"("scheduled_at");

-- CreateIndex
CREATE UNIQUE INDEX "facebook_accounts_page_id_key" ON "facebook_accounts"("page_id");

-- AddForeignKey
ALTER TABLE "tafsirs" ADD CONSTRAINT "tafsirs_verse_id_fkey" FOREIGN KEY ("verse_id") REFERENCES "verses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_verse_id_fkey" FOREIGN KEY ("verse_id") REFERENCES "verses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
