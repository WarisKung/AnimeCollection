# Anime Completed Library

เว็บบันทึกอนิเมะที่ดูจบแล้ว สร้างด้วย Next.js App Router + TypeScript + Tailwind CSS + Supabase

## Features

- บันทึกและแก้ไขอนิเมะ พร้อมค้นหาข้อมูลจาก AniList
- Carousel, การค้นหาและตัวกรอง, Grid/List, Statistics
- Supabase Auth, Row Level Security, การตั้งค่าโปรไฟล์และอัปโหลดรูป
- หน้าแชร์คลังแบบ Read-only ผ่านลิงก์

## Run locally

```powershell
npm ci
Copy-Item .env.example .env.local
# กรอกค่า Supabase Project URL และ Anon Key ใน .env.local
npm run dev
```

ดู `supabase/migrations/` สำหรับโครงสร้างฐานข้อมูลและ Storage Policies

## Deploy

**GitHub + Vercel + Supabase:** อ่านคำแนะนำและข้อควรระวังใน [DEPLOYMENT.md](./DEPLOYMENT.md)

**สำคัญ:** `.env.local` ต้องไม่ถูก Commit / Push ไป GitHub และต้องตรวจ RLS กับ Bucket Policies ก่อนเปิดเว็บไซต์สาธารณะ
