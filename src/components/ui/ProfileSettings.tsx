"use client";
import {useState,useRef} from "react";
import Image from "next/image";
import {UserRound,Save,Upload} from "lucide-react";
import {supabaseBrowser} from "@/lib/supabase/client";
import {toast} from "sonner";
import {useRouter} from "next/navigation";

export default function ProfileSettings({initialName,initialAvatar,email}:{
 initialName:string;initialAvatar:string;email:string;
}){
 const [name,setName]=useState(initialName);
 const [avatar,setAvatar]=useState(initialAvatar);
 const [busy,setBusy]=useState(false);
 const [file,setFile]=useState<File|null>(null);
 const [preview,setPreview]=useState<string|null>(null);
 const inputRef=useRef<HTMLInputElement>(null);
 const router=useRouter();
 function pickFile(e:React.ChangeEvent<HTMLInputElement>){
  const chosen=e.target.files?.[0];
  if(!chosen)return;
  if(!["image/png","image/jpeg","image/webp"].includes(chosen.type)){toast.error("รองรับ JPG, PNG, WebP เท่านั้น");e.target.value="";return}
  if(chosen.size>2*1024*1024){toast.error("ไฟล์ต้องไม่เกิน 2 MB");e.target.value="";return}
  if(preview)URL.revokeObjectURL(preview);
  setPreview(URL.createObjectURL(chosen));setFile(chosen);
 }
 async function saveProfile(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();
  const displayName=name.trim();
  if(!displayName||displayName.length>80){toast.error("ชื่อโปรไฟล์ต้องมี 1–80 ตัวอักษร");return}
  setBusy(true);
  try{
   const sb=supabaseBrowser();
   const {data:{user},error:userError}=await sb.auth.getUser();
   if(userError||!user)throw new Error("กรุณาเข้าสู่ระบบใหม่");
   let updatedAvatar=avatar;
   if(file){
    const ext=file.type==="image/png"?"png":file.type==="image/webp"?"webp":"jpg";
    const key=`${user.id}/${crypto.randomUUID()}.${ext}`;
    const {error:uploadError}=await sb.storage.from("avatars").upload(key,file,{contentType:file.type,upsert:false,cacheControl:"3600"});
    if(uploadError)throw new Error(uploadError.message+" (ตรวจสอบว่าได้รัน Migration 202611040002_features.sql)");
    updatedAvatar=sb.storage.from("avatars").getPublicUrl(key).data.publicUrl;
   }
   const {error}=await sb.auth.updateUser({data:{display_name:displayName,avatar_url:updatedAvatar}});
   if(error)throw error;
   setAvatar(updatedAvatar);setFile(null);
   if(preview){URL.revokeObjectURL(preview);setPreview(null)}
   if(inputRef.current)inputRef.current.value="";
   window.dispatchEvent(new Event("anime-profile-updated"));
   toast.success("บันทึกโปรไฟล์สำเร็จ");router.refresh();
  }catch(error){toast.error(error instanceof Error?error.message:"ไม่สามารถบันทึกโปรไฟล์ได้")}
  finally{setBusy(false)}
 }
 return <form onSubmit={saveProfile} className="panel p-5 sm:p-7 space-y-5">
  <div className="flex items-center gap-4">
   <span className="relative grid size-24 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-violet-400 bg-[var(--panel-raised)]">
    {preview||avatar&&/^https?:\/\//.test(avatar)?<Image unoptimized src={preview||avatar} fill sizes="96px" alt="รูปโปรไฟล์" className="object-cover"/>:<UserRound size={36} className="text-violet-400"/>}
   </span>
   <div className="min-w-0"><h2 className="font-bold text-lg">โปรไฟล์ของฉัน</h2><p className="muted text-xs break-all">{email}</p></div>
  </div>
  <label className="block text-sm font-semibold">ชื่อที่แสดง<input className="field mt-2" value={name} maxLength={80} required onChange={e=>setName(e.target.value)}/></label>
  <div className="space-y-2">
   <label htmlFor="avatar-file" className="text-sm font-semibold">อัปโหลดรูปโปรไฟล์</label>
   <input ref={inputRef} id="avatar-file" type="file" accept="image/jpeg,image/png,image/webp" onChange={pickFile} className="field text-sm"/>
   <p className="muted text-xs">ไฟล์ JPG, PNG หรือ WebP ไม่เกิน 2 MB รูปจะถูกอัปโหลดไปยัง Supabase Storage</p>
   {file&&<p className="text-violet-400 text-xs flex gap-2 items-center"><Upload size={15}/>{file.name}</p>}
  </div>
  <button className="btn btn-primary" type="submit" disabled={busy}><Save size={17}/>{busy?"กำลังบันทึก...":"บันทึกโปรไฟล์"}</button>
 </form>;
}
