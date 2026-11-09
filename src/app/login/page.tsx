"use client";

import {useState,type FormEvent} from "react";
import {useRouter} from "next/navigation";
import {CheckCircle2,LockKeyhole,Mail,ShieldCheck,UserRound} from "lucide-react";
import {supabaseBrowser} from "@/lib/supabase/client";
import BrandLogo from "@/components/ui/BrandLogo";

type AuthMode="login"|"signup";

function authErrorMessage(message:string):string{
 const lower=message.toLowerCase();
 if(lower.includes("invalid login credentials"))return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
 if(lower.includes("email not confirmed"))return "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ";
 if(lower.includes("user already registered"))return "อีเมลนี้เคยสมัครสมาชิกแล้ว";
 if(lower.includes("signup")&&lower.includes("disabled"))return "ระบบยังไม่เปิดรับสมัครสมาชิก กรุณาตรวจสอบ Supabase Authentication";
 if(lower.includes("rate limit"))return "มีคำขอมากเกินไป กรุณาลองใหม่ภายหลัง";
 if(lower.includes("password should be at least"))return "รหัสผ่านสั้นเกินไป กรุณาใช้รหัสผ่านที่ยาวขึ้น";
 return message;
}

export default function Login(){
 const router=useRouter();
 const [mode,setMode]=useState<AuthMode>("login");
 const [name,setName]=useState("");
 const [email,setEmail]=useState("");
 const [password,setPassword]=useState("");
 const [confirmPassword,setConfirmPassword]=useState("");
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");

 function switchMode(value:AuthMode){
  if(busy)return;
  setMode(value);
  setError("");
  setNotice("");
  setPassword("");
  setConfirmPassword("");
 }

 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(busy)return;

  const normalizedEmail=email.trim().toLowerCase();
  const displayName=name.trim();
  setError("");
  setNotice("");

  if(mode==="signup"){
   if(!displayName||displayName.length>80){
    setError("ชื่อที่แสดงต้องมี 1–80 ตัวอักษร");
    return;
   }
   if(password.length<8){
    setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
    return;
   }
   if(password!==confirmPassword){
    setError("รหัสผ่านทั้งสองช่องไม่ตรงกัน");
    return;
   }
  }

  setBusy(true);
  try{
   const sb=supabaseBrowser();
   if(mode==="login"){
    const {error:authError}=await sb.auth.signInWithPassword({email:normalizedEmail,password});
    if(authError)throw authError;
    router.replace("/");
    router.refresh();
    return;
   }

   // Supabase Auth creates the account in auth.users.
   const {data,error:authError}=await sb.auth.signUp({
    email:normalizedEmail,
    password,
    options:{
     data:{display_name:displayName},
     emailRedirectTo:new URL("/auth/callback",window.location.origin).toString(),
    },
   });
   if(authError)throw authError;
   if(!data.user)throw new Error("ไม่สามารถสร้างบัญชีได้ กรุณาลองอีกครั้ง");

   setPassword("");
   setConfirmPassword("");
   if(data.session){
    router.replace("/");
    router.refresh();
    return;
   }
   setMode("login");
   setNotice("ส่งคำขอสมัครสมาชิกแล้ว หากอีเมลนี้สามารถสมัครได้ กรุณาตรวจสอบอีเมลยืนยันก่อนเข้าสู่ระบบ");
  }catch(err){
   setError(authErrorMessage(err instanceof Error?err.message:"ไม่สามารถดำเนินการได้ กรุณาลองใหม่"));
  }finally{
   setBusy(false);
  }
 }

 return <main className="relative flex min-h-screen items-center justify-center overflow-hidden p-4 sm:p-6">
  <div className="pointer-events-none absolute -left-32 top-8 size-80 rounded-full bg-violet-600/15 blur-3xl" aria-hidden="true"/>
  <div className="pointer-events-none absolute -right-28 bottom-10 size-80 rounded-full bg-pink-500/10 blur-3xl" aria-hidden="true"/>
  <section className="panel relative w-full max-w-md p-6 sm:p-9">
   <div className="mb-7 flex flex-col items-center text-center">
    <div className="mb-7"><BrandLogo/></div>
    <h1 className="text-3xl font-extrabold tracking-tight">{mode==="login"?"เข้าสู่ระบบ":"สมัครสมาชิก"}</h1>
    <p className="muted mt-2 text-sm">{mode==="login"?"เข้าสู่คลังอนิเมะของคุณ":"สร้างบัญชีเพื่อเก็บอนิเมะที่คุณดูจบ"}</p>
   </div>

   <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl border border-[var(--border)] bg-[var(--panel-raised)] p-1" aria-label="รูปแบบการเข้าใช้งาน">
    {([{value:"login",label:"เข้าสู่ระบบ"},{value:"signup",label:"สมัครสมาชิก"}] as const).map(item=>
     <button key={item.value} type="button" aria-pressed={mode===item.value} disabled={busy} onClick={()=>switchMode(item.value)}
      className={"rounded-lg px-3 py-2.5 text-sm font-bold transition-colors "+(mode===item.value?"bg-violet-600 text-white shadow-sm":"text-[var(--muted)] hover:text-[var(--foreground)]")}>
      {item.label}
     </button>
    )}
   </div>

   <form onSubmit={submit} className="space-y-4">
    {mode==="signup"&&<label className="block text-sm font-semibold" htmlFor="auth-name">
     ชื่อที่แสดง <span className="text-red-400">*</span>
     <span className="relative mt-2 block">
      <UserRound size={18} className="muted pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"/>
      <input id="auth-name" className="field !pl-11" autoComplete="nickname" maxLength={80} placeholder="ชื่อโปรไฟล์ของคุณ" required value={name} onChange={e=>setName(e.target.value)}/>
     </span>
    </label>}

    <label className="block text-sm font-semibold" htmlFor="auth-email">
     อีเมล <span className="text-red-400">*</span>
     <span className="relative mt-2 block">
      <Mail size={18} className="muted pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"/>
      <input id="auth-email" className="field !pl-11" type="email" autoComplete="email" placeholder="you@example.com" required value={email} onChange={e=>setEmail(e.target.value)}/>
     </span>
    </label>

    <label className="block text-sm font-semibold" htmlFor="auth-password">
     รหัสผ่าน <span className="text-red-400">*</span>
     <span className="relative mt-2 block">
      <LockKeyhole size={18} className="muted pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"/>
      <input id="auth-password" className="field !pl-11" type="password" autoComplete={mode==="signup"?"new-password":"current-password"} minLength={mode==="signup"?8:undefined} placeholder={mode==="signup"?"อย่างน้อย 8 ตัวอักษร":"กรอกรหัสผ่าน"} required value={password} onChange={e=>setPassword(e.target.value)}/>
     </span>
    </label>

    {mode==="signup"&&<label className="block text-sm font-semibold" htmlFor="auth-confirm">
     ยืนยันรหัสผ่าน <span className="text-red-400">*</span>
     <span className="relative mt-2 block">
      <ShieldCheck size={18} className="muted pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"/>
      <input id="auth-confirm" className="field !pl-11" type="password" autoComplete="new-password" minLength={8} placeholder="กรอกรหัสผ่านอีกครั้ง" required value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)}/>
     </span>
    </label>}

    {error&&<p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
    {notice&&<p role="status" className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"><CheckCircle2 size={18} className="mt-0.5 shrink-0"/>{notice}</p>}

    <button type="submit" disabled={busy} className="btn btn-primary w-full">
     {busy?(mode==="signup"?"กำลังสมัครสมาชิก...":"กำลังเข้าสู่ระบบ..."):(mode==="signup"?"สร้างบัญชี":"เข้าสู่ระบบ")}
    </button>
    {mode==="signup"&&<p className="muted text-center text-xs leading-6">บัญชีแต่ละคนมีคลังอนิเมะของตนเอง และอาจต้องยืนยันอีเมลตามการตั้งค่า Supabase</p>}
   </form>
  </section>
 </main>;
}
