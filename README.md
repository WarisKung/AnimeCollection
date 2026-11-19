# Anime Completed Library

เว็บภาษาไทยสำหรับบันทึกอนิเมะที่ดูจบแล้ว ให้คะแนน จัดคลังส่วนตัว และดูสถิติการรับชมในที่เดียว

[**เปิดเว็บไซต์บน Vercel**](https://anime-collection-three.vercel.app) · [ซอร์สโค้ดบน GitHub](https://github.com/WarisKung/AnimeCollection) · [ติดตั้งบนเครื่อง](#local-setup) · [Deploy เวอร์ชันของคุณ](#deploy)

## ฟีเจอร์

- ค้นหาข้อมูลอนิเมะจาก AniList แล้วเพิ่มลงคลัง พร้อมบันทึกวันที่ดูจบ คะแนน และลิงก์รับชม
- จัดคลังด้วยการค้นหา กรอง และเรียงลำดับ เลือกมุมมองแบบกริดหรือรายการได้
- ดูสถิติจำนวนเรื่อง จำนวนตอน เวลารับชมโดยประมาณ คะแนนเฉลี่ย และแนวอนิเมะในคลัง
- สมัครสมาชิกและเข้าสู่ระบบด้วยอีเมล จัดการชื่อที่แสดงและรูปโปรไฟล์
- เปิดแชร์คลังและหน้าสถิติผ่านลิงก์แบบอ่านอย่างเดียว

## เทคโนโลยี

| ส่วน                    | เทคโนโลยี                                             |
| ----------------------- | ----------------------------------------------------- |
| เว็บแอป                 | Next.js (App Router), React, TypeScript, Tailwind CSS |
| ฐานข้อมูลและบัญชีผู้ใช้ | Supabase PostgreSQL, Auth, Storage                    |
| แหล่งข้อมูลอนิเมะ       | AniList GraphQL API                                   |
| โฮสติ้ง                 | Vercel                                                |

\<a id="local-setup">\</a>

## ติดตั้งบนเครื่อง

เตรียม Git, Node.js 22.13 ขึ้นไปในสาย 22.x หรือ Node.js 24.x, npm และ Supabase Project ของคุณเอง

### 1. Clone และติดตั้ง dependencies

```powershell
git clone https://github.com/WarisKung/AnimeCollection.git
cd AnimeCollection
npm ci
Copy-Item .env.example .env.local
```

### 2. ตั้งค่า Supabase

สร้าง Supabase Project ใหม่ แล้วเปิด **SQL Editor** เพื่อรันไฟล์ใน [`supabase/migrations/`](./supabase/migrations/) ทีละไฟล์ตามลำดับชื่อ เริ่มจาก `202611040001_init.sql` จนถึง `202611090005_delete_account.sql` สคริปต์เหล่านี้ตั้งค่าตาราง สิทธิ์ Row Level Security (RLS) ฟังก์ชันแชร์คลัง และ Storage bucket สำหรับรูปโปรไฟล์

กรอกค่าจาก Supabase Project ของคุณใน `.env.local`

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

ใช้ Publishable Key หรือ Anon Key สำหรับ `NEXT_PUBLIC_SUPABASE_ANON_KEY` และเก็บ `.env.local` ไว้ในเครื่อง ห้ามใส่ Secret Key หรือ Service Role Key ในตัวแปร `NEXT_PUBLIC_*` ส่วน `NEXT_PUBLIC_SITE_URL` อยู่ในไฟล์ตัวอย่าง โค้ดสร้าง URL ยืนยันอีเมลจากโดเมนที่เปิดใช้งานอยู่

ถ้าทดสอบการสมัครแบบยืนยันอีเมล ให้ตั้ง **Site URL** เป็น `http://localhost:3000` และเพิ่ม `http://localhost:3000/auth/callback` ใน **Redirect URLs** ที่ **Authentication → URL Configuration** ของ Supabase

### 3. เปิดเว็บ

```powershell
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000) แล้วเข้าสู่ระบบเพื่อเริ่มเพิ่มอนิเมะลงคลัง

\<a id="deploy">\</a>

## Deploy เวอร์ชันของคุณบน Vercel

1. Fork repository ไปยังบัญชี GitHub ของคุณ แล้ว Import โปรเจกต์ใน [Vercel](https://vercel.com/new) ด้วย Framework Preset **Next.js**
2. เตรียม Supabase และรัน migrations ตามขั้นตอนติดตั้งบนเครื่อง จากนั้นตั้งค่า `NEXT_PUBLIC_SUPABASE_URL` และ `NEXT_PUBLIC_SUPABASE_ANON_KEY` ใน **Environment Variables** ให้ตรงกับ Supabase Project ของคุณ แล้วกด Deploy
3. ใน Supabase ตั้ง **Site URL** เป็นโดเมน Vercel ที่ได้ และเพิ่ม URL ที่ลงท้ายด้วย `/auth/callback` ใน **Redirect URLs** เช่น `https://your-project.vercel.app/auth/callback`
4. ทดสอบสมัครหรือเข้าสู่ระบบ เพิ่มอนิเมะ และเปิดลิงก์แชร์จากหน้าต่างที่ยังไม่ได้เข้าสู่ระบบ

ดูรายละเอียดเพิ่มเติมใน [DEPLOYMENT.md](./DEPLOYMENT.md), [เอกสาร Redirect URLs ของ Supabase](https://supabase.com/docs/guides/auth/redirect-urls) และ [เอกสาร Environment Variables ของ Vercel](https://vercel.com/docs/environment-variables)

## จุดเริ่มต้นสำหรับแก้โค้ด

| สิ่งที่ต้องการแก้         | ตำแหน่ง                                          |
| ------------------------- | ------------------------------------------------ |
| หน้าเว็บและเส้นทาง        | [`src/app/`](./src/app/)                         |
| ธีมและสไตล์หลัก           | [`src/app/globals.css`](./src/app/globals.css)   |
| ฟอร์ม คลัง และหน้าสถิติ   | [`src/components/`](./src/components/)           |
| การค้นหาข้อมูลจาก AniList | [`src/lib/jikan.ts`](./src/lib/jikan.ts)         |
| Schema, RLS และ Storage   | [`supabase/migrations/`](./supabase/migrations/) |

```powershell
npm run lint
npm run build
```
