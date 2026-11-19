# Deploy Anime Completed Library

คู่มือสำหรับติดตั้งและ Deploy โปรเจกต์ด้วย **GitHub, Vercel และ Supabase** จากเครื่อง Windows, macOS หรือ Linux รันคำสั่งทั้งหมดจากโฟลเดอร์ของ repository ที่มีไฟล์ `package.json`

## 1. เตรียมโปรเจกต์

- ติดตั้ง Git และ Node.js 24.x พร้อม npm
- เตรียมบัญชี GitHub, Vercel และ Supabase
- หากต้องการ Deploy แยกจากโปรเจกต์ต้นฉบับ ให้ Fork [AnimeCollection](https://github.com/WarisKung/AnimeCollection) ไปยังบัญชี GitHub ของคุณ แล้ว Clone โดยใช้ URL จากปุ่ม **Code** ของ Fork

ตัวอย่างสำหรับ Clone โปรเจกต์ต้นฉบับมาทดลองรัน

```sh
git clone https://github.com/WarisKung/AnimeCollection.git
cd AnimeCollection
npm ci
```

## 2. ตั้งค่าฐานข้อมูล Supabase

สร้าง Supabase Project ของคุณเอง เปิด **SQL Editor** แล้วรันไฟล์ SQL ทีละไฟล์ตามลำดับนี้สำหรับฐานข้อมูลใหม่

| ลำดับ | ไฟล์ | หน้าที่ |
| --- | --- | --- |
| 1 | [`202611040001_init.sql`](./supabase/migrations/202611040001_init.sql) | สร้างตาราง ตั้งค่า Row Level Security (RLS) และฟังก์ชันแชร์คลัง |
| 2 | [`202611040002_features.sql`](./supabase/migrations/202611040002_features.sql) | เพิ่มข้อมูลอนิเมะ สร้าง bucket `avatars` และล้างค่า `title_th` เดิม |
| 3 | [`202611040003_clear_thai_titles.sql`](./supabase/migrations/202611040003_clear_thai_titles.sql) | ล้างค่า `title_th` เดิม |
| 4 | [`202611040004_avatar_bucket.sql`](./supabase/migrations/202611040004_avatar_bucket.sql) | ตั้งค่า bucket `avatars` และสิทธิ์อัปโหลดรูป |
| 5 | [`202611090005_delete_account.sql`](./supabase/migrations/202611090005_delete_account.sql) | เพิ่มสิทธิ์อ่านรายการไฟล์ของเจ้าของและฟังก์ชันลบบัญชี |

สำหรับฐานข้อมูลเดิม ให้สำรองข้อมูลและตรวจว่าเคยรันไฟล์ไหนแล้วก่อนใช้ migrations ที่ยังขาด ไฟล์ลำดับ 2 และ 3 จะล้างค่าในคอลัมน์ `title_th` หากลำดับ 2 ล้างข้อมูลไปแล้ว ให้ข้ามลำดับ 3 สำหรับงานล้างชื่อไทยเดิม

## 3. ตั้งค่าและทดสอบบนเครื่อง

คัดลอก [`.env.example`](./.env.example) เป็น `.env.local` ในโฟลเดอร์เดียวกับ `package.json`

**Windows PowerShell**

```powershell
Copy-Item .env.example .env.local
```

**macOS / Linux**

```sh
cp .env.example .env.local
```

กรอก URL และคีย์จาก Supabase Project เดียวกัน

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY` รับ Publishable Key หรือ Anon Key ได้ เก็บ `.env.local` ไว้ในเครื่องและห้ามใส่ Secret Key, Service Role Key หรือรหัสผ่านฐานข้อมูลในตัวแปร `NEXT_PUBLIC_*`

```sh
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000) หากต้องการทดสอบอีเมลยืนยันสมัครสมาชิก ให้เพิ่ม URL สำหรับ localhost ตามหัวข้อ Supabase Auth ด้านล่าง

ใช้คำสั่งต่อไปนี้เพื่อตรวจโค้ดและ build ก่อน Deploy

```sh
npm run lint
npx tsc --noEmit
npm run build
```

## 4. Deploy บน Vercel

1. เปิด [Vercel New Project](https://vercel.com/new) เชื่อมบัญชี GitHub แล้ว Import repository ที่ต้องการ Deploy
2. เลือก Framework Preset **Next.js** และใช้โฟลเดอร์ที่มี `package.json` เป็น Root Directory สำหรับ repo นี้คือโฟลเดอร์หลัก `./`
3. เลือก Node.js **24.x** ใน Project Settings และใช้ Build Command ตามค่าเริ่มต้นของ Next.js หรือ `npm run build`
4. เพิ่ม `NEXT_PUBLIC_SUPABASE_URL` และ `NEXT_PUBLIC_SUPABASE_ANON_KEY` ใน **Environment Variables** สำหรับ Production หากใช้ Preview ให้เพิ่มค่าสำหรับ Preview ด้วย
5. กด **Deploy** แล้วนำ URL ที่ได้ไปตั้งค่าใน Supabase Auth หากเปลี่ยน Environment Variables ภายหลัง ให้ Redeploy เพื่อให้ build ใหม่ใช้ค่าที่แก้

โค้ดปัจจุบันสร้าง URL ยืนยันอีเมลจากโดเมนที่ผู้ใช้เปิดอยู่ โดยใช้เส้นทาง `/auth/callback` ตัวแปร `NEXT_PUBLIC_SITE_URL` ที่อยู่ในไฟล์ตัวอย่างจึงเป็นค่าเสริม

เมื่อเชื่อม GitHub แล้ว การ Push ไปยัง Production Branch จะสร้าง Production Deployment ใหม่ตามการตั้งค่าของโปรเจกต์ ดูรายละเอียดเพิ่มเติมใน [Vercel Git Deployments](https://vercel.com/docs/git), [Environment Variables](https://vercel.com/docs/environment-variables) และ [Node.js Versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)

## 5. ตั้งค่า Supabase Auth

เปิด **Authentication → URL Configuration** ใน Supabase Dashboard แล้วใช้โดเมนของคุณแทน `your-project.vercel.app`

| การตั้งค่า | ตัวอย่าง |
| --- | --- |
| Site URL สำหรับ Production | `https://your-project.vercel.app` |
| Redirect URL สำหรับ Production | `https://your-project.vercel.app/auth/callback` |
| Redirect URL สำหรับทดสอบบนเครื่อง | `http://localhost:3000/auth/callback` |

ถ้า Supabase Project นี้ใช้บนเครื่องอย่างเดียว ให้ตั้ง **Site URL** เป็น `http://localhost:3000` หากทดสอบการยืนยันอีเมลบน Vercel Preview ให้เพิ่ม URL ของ Preview ที่ลงท้ายด้วย `/auth/callback` ด้วย ดู [Supabase Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)

หากเปิดรับสมัครสาธารณะและเปิดการยืนยันอีเมล ให้ตั้งค่า **Custom SMTP** ใน Supabase Auth แล้วทดสอบส่งอีเมลไปยังบัญชีผู้ใช้จริงก่อนเปิดใช้งาน ดู [Supabase Custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp)

## 6. ตรวจสอบหลัง Deploy

- สมัครบัญชีทดสอบ ยืนยันอีเมลตามการตั้งค่า แล้วเข้าสู่ระบบ
- ค้นหาอนิเมะจาก AniList เพิ่มรายการ แก้ไขข้อมูล และเปิดหน้าสถิติ
- อัปโหลดรูปโปรไฟล์เพื่อตรวจ bucket `avatars`
- เปิดแชร์คลัง แล้วเปิดลิงก์จากหน้าต่างที่ยังไม่ได้เข้าสู่ระบบ ใช้บัญชีทดสอบอีกบัญชีเพื่อตรวจว่าข้อมูลคลังส่วนตัวเข้าถึงได้เฉพาะเจ้าของ
- หากทดสอบการลบคลังหรือลบบัญชี ให้ใช้บัญชีและข้อมูลทดสอบ

## แก้ปัญหาเบื้องต้น

| อาการ | จุดที่ควรตรวจ |
| --- | --- |
| `Could not find anime_format` | ตรวจว่า migration ลำดับ 2 ทำงานแล้วใน Supabase Project ที่แอปเชื่อมต่อ |
| `Bucket not found` | ตรวจ bucket `avatars` ใน Storage และ migration ลำดับ 2 หรือ 4 |
| ลิงก์ยืนยันอีเมลพาไปผิดโดเมน | ตรวจ **Site URL** และ **Redirect URLs** ให้ตรงกับโดเมนและเส้นทาง `/auth/callback` |
| สมัครแล้วขึ้นว่ามีคำขอมากเกินไป | ตรวจ Auth Logs, การตั้งค่า SMTP และ Auth Rate Limits ใน Supabase |
| Build ล้มเหลวบน Vercel | เปิด Build Logs แล้วตรวจ Node.js, Root Directory และ Environment Variables ของ deployment นั้น |
| หา repository ไม่เจอตอน Import | ตรวจสิทธิ์ของ Vercel GitHub Integration ให้เข้าถึง repository ที่เลือก |
