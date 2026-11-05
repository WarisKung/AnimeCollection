# Deploy Anime Completed Library — GitHub + Vercel + Supabase

โปรเจกต์นี้เป็น Next.js App Router ที่มี Server Actions, API Routes และ Supabase Auth จึง **ไม่รองรับ GitHub Pages แบบ Static โดยตรง**

## 1. ก่อน Deploy

- ใช้ Node.js 20.9+ (เครื่องพัฒนาใช้ Node.js 22)
- สร้าง GitHub repository แบบ **Private** เป็นค่าเริ่มต้น (แนะนำ)
- ใน Supabase ตรวจสอบว่าตารางและ RLS จาก `supabase/migrations/202611040001_init.sql` ทำงานแล้ว
- รัน `supabase/migrations/202611040002_features.sql` ผ่าน Supabase SQL Editor เพื่อเพิ่ม `anime_format`, `watch_url`, `duration_minutes` และสร้าง Storage bucket `avatars`
- หากรัน migration 002 แล้ว **ไม่ต้อง** รัน `202611040003_clear_thai_titles.sql` ซ้ำเพื่อความจำเป็น (002 ทำการล้างฟิลด์ `title_th` แล้ว)
- SQL migration 002 ล้างค่า `title_th` เดิมทั้งหมดตาม requirement ของโปรเจกต์ ควรตรวจสอบ/สำรองฐานข้อมูลก่อนรัน

## 2. เชื่อมต่อ GitHub

โปรเจกต์มี Git ในเครื่องแล้ว แต่ต้องสร้าง repo บน GitHub ก่อน ห้าม Commit `.env.local` หรือคีย์ลับ

```powershell
cd "D:\AnimeWatched\animewatched"
git status
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

แทน `YOUR_GITHUB_USERNAME` และ `YOUR_REPOSITORY` ด้วยค่าจริงจาก GitHub หลังสร้าง repo แล้ว อย่าพิมพ์ placeholder ตามตัวอักษร

## 3. Deploy ด้วย Vercel

1. เปิด https://vercel.com/new
2. เชื่อมบัญชี GitHub และ Import repository
3. Framework Preset: `Next.js`
4. Root Directory: `./` (เมื่อ repo root คือ `D:\AnimeWatched\animewatched` )
5. Build Command: `npm run build` (ใช้ default ของ Next.js/Vercel ได้)
6. เพิ่ม Environment Variables ใน Project Settings → Environment Variables:

| Name | Value |
| ---- | ----- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL จริง |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Publishable/Anon Key จริงที่ใช้อยู่ใน `.env.local` |
| `NEXT_PUBLIC_SITE_URL` | URL Production ที่ Vercel สร้างให้ เช่น `https://YOUR-PROJECT.vercel.app` |

ตั้งค่า Environment Variables สำหรับ Production และ Preview เท่าที่ใช้งาน และ **อย่า** คัดลอก Service Role Key หรือ Database Password ใส่ในตัวแปร `NEXT_PUBLIC_*`

7. กด Deploy. เมื่อเชื่อม GitHub แล้ว Vercel จะ Deploy ใหม่หลัง Push โค้ดตาม branch production

**หมายเหตุ:** การกำหนด `NEXT_PUBLIC_SITE_URL` ของโปรเจกต์นี้ใช้เพื่อการตั้งค่าการ Deploy และความพร้อมสำหรับการอ้างอิง URL; โค้ดปัจจุบันใช้ URL จาก request สำหรับ callback

## 4. ตั้งค่า Supabase Auth ให้รองรับโดเมนจริง

เปิด https://supabase.com/dashboard → Project → Authentication → URL Configuration

- Site URL: `https://YOUR-PROJECT.vercel.app` (ใช้โดเมน Production จริง)
- Redirect URLs:
  - `https://YOUR-PROJECT.vercel.app/**`
  - `http://localhost:3000/**` สำหรับการพัฒนา
  - กรณีต้องใช้ Vercel Preview ให้ตั้ง pattern ที่ตรงกับ Project/Team ของคุณ ตาม Supabase docs

เว็บมีเส้นทาง callback `/auth/callback` ซึ่งใช้กับ code exchange. ระบบที่ใช้งานอยู่ตอนนี้ล็อกอินด้วยอีเมล/รหัสผ่าน

## 5. ทดสอบหลัง Deploy

1. เปิด Production URL ผ่านมือถือหรือเครื่องอื่น
2. ล็อกอินบัญชีเจ้าของ
3. เพิ่ม/แก้ไขอนิเมะ ตรวจสอบฟิลด์ใหม่
4. ทดสอบการค้นหา AniList, Carousel, Statistics และหน้า Share (เมื่อเปิด Public)
5. อัปโหลดรูปโปรไฟล์ (ตรวจ `avatars` bucket)
6. ตรวจ Row Level Security โดยใช้บัญชีอื่น: ห้ามมองเห็นหรือแก้ข้อมูลส่วนตัวของเจ้าของ
7. ห้ามทดสอบปุ่ม `ลบอนิเมะทั้งหมด` กับข้อมูลจริงโดยไม่มีสำรองข้อมูล

## คำสั่งทดสอบบนเครื่อง

```powershell
cd "D:\AnimeWatched\animewatched"
npm ci
npx tsc --noEmit
npm run lint
npm run build
```

## Troubleshooting

- `Could not find anime_format column` → Migration 002 ยังไม่ได้รันใน Supabase Project ที่เว็บไซต์ใช้
- `Bucket not found` → Migration 002 ยังไม่ได้สร้าง bucket `avatars` หรือเชื่อมคนละ Supabase Project
- Login กลับไป localhost/redirect ผิดโดเมน → ตรวจ Supabase Auth → URL Configuration
- Vercel Build ล้มเหลวเพราะ Environment Variables → ตรวจว่าตั้งทั้ง URL และ Anon Key ตาม Project จริงแล้ว
- หากไม่เห็น Repository บนหน้า Vercel Import → ตรวจสิทธิ์ Vercel GitHub Integration ให้เข้าถึง repo นั้น

ลิงก์เอกสารทางการ:
- https://vercel.com/docs/git
- https://supabase.com/docs/guides/auth/redirect-urls
