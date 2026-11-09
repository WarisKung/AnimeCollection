"use client";

import {useCallback,useEffect,useState,useTransition} from "react";
import {Copy,ExternalLink,Link2,Share2,ShieldCheck} from "lucide-react";
import {toast} from "sonner";
import {syncShareLink} from "@/lib/actions";

const SHARE_SITE_URL="https://anime-collection-three.vercel.app";

export default function ShareSettings(){
 const [slug,setSlug]=useState("");
 const [error,setError]=useState("");
 const [busy,startTransition]=useTransition();

 const syncLink=useCallback(()=>{
  startTransition(async()=>{
   try{
    const result=await syncShareLink();
    if(!result.ok||!result.share_slug)throw new Error(result.message||"ไม่สามารถสร้างลิงก์แชร์ได้");
    setSlug(result.share_slug);
    setError("");
   }catch(err){
    const message=err instanceof Error?err.message:"ไม่สามารถสร้างลิงก์แชร์ได้";
    setError(message);
    toast.error(message);
   }
  });
 },[]);

 useEffect(()=>{
  // Create a named share link on first visit and update it after a profile-name change.
  syncLink();
  window.addEventListener("anime-profile-updated",syncLink);
  return()=>window.removeEventListener("anime-profile-updated",syncLink);
 },[syncLink]);

 const sharePath=slug?"/share/"+encodeURIComponent(slug):"";
 const shareUrl=sharePath?new URL(sharePath,SHARE_SITE_URL).toString():"";

 async function copyLink(){
  if(!shareUrl)return;
  try{
   await navigator.clipboard.writeText(shareUrl);
   toast.success("คัดลอกลิงก์แชร์แล้ว");
  }catch{
   toast.error("ไม่สามารถคัดลอกอัตโนมัติได้ กรุณาเลือกข้อความในช่องแล้วคัดลอก");
  }
 }

 return <section className="panel p-5 sm:p-7 space-y-5" aria-label="แชร์คลังอนิเมะ">
  <div className="flex items-center gap-3">
   <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-sky-500/15 text-sky-400"><Share2 size={21}/></span>
   <div>
    <h2 className="font-extrabold text-lg">แชร์คลังอนิเมะ</h2>
   </div>
  </div>

  <div className="space-y-3">
   <label className="block text-xs font-semibold" htmlFor="anime-share-url">ลิงก์สำหรับเข้าชม</label>
   <div className="relative">
    <Link2 size={18} className="muted pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"/>
    <input
     id="anime-share-url"
     type="text"
     className="field !pl-11"
     readOnly
     value={shareUrl}
     placeholder={busy?"กำลังเตรียมลิงก์แชร์...":"ยังไม่มีลิงก์แชร์"}
     onFocus={event=>event.currentTarget.select()}
    />
   </div>
   {error&&<p role="alert" className="text-sm text-red-400">{error} <button type="button" className="underline underline-offset-2" onClick={syncLink}>ลองอีกครั้ง</button></p>}
   <div className="flex flex-wrap gap-2">
    <button type="button" className="btn anime-action anime-action-save" disabled={busy||!shareUrl} onClick={copyLink}><Copy size={17}/>คัดลอกลิงก์</button>
    {shareUrl&&<a href={shareUrl} target="_blank" rel="noopener noreferrer" aria-disabled={busy} tabIndex={busy?-1:undefined} className={"btn "+(busy?"pointer-events-none opacity-50":"")}><ExternalLink size={17}/>ดูหน้าแชร์</a>}
   </div>
  </div>

  <p className="muted flex items-start gap-2 text-xs leading-6"><ShieldCheck size={17} className="mt-1 shrink-0 text-emerald-400"/>ผู้ที่มีลิงก์จะดูรายการและรายละเอียดอนิเมะได้เท่านั้น ไม่มีสิทธิ์เพิ่ม แก้ไข ลบ หรือตั้งค่า เมื่อเปลี่ยนชื่อที่แสดง ลิงก์เดิมจะใช้งานไม่ได้</p>
 </section>;
}
