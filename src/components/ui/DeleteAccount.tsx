"use client";

import {useState,useTransition} from "react";
import {useRouter} from "next/navigation";
import {AlertTriangle,UserRoundX} from "lucide-react";
import {toast} from "sonner";
import {deleteMyAccount} from "@/lib/actions";
import {supabaseBrowser} from "@/lib/supabase/client";

const CONFIRM_TEXT="ลบบัญชี";

export default function DeleteAccount(){
 const router=useRouter();
 const [confirmation,setConfirmation]=useState("");
 const [password,setPassword]=useState("");
 const [busy,startTransition]=useTransition();
 const canDelete=confirmation.trim()===CONFIRM_TEXT&&password.length>0&&!busy;

 function handleDelete(){
  if(!canDelete)return;
  if(!window.confirm("ยืนยันลบบัญชีและข้อมูลอนิเมะทั้งหมดอย่างถาวร? การดำเนินการนี้ย้อนกลับไม่ได้"))return;

  startTransition(async()=>{
   try{
    // The server action verifies the current password before any deletion.
    const result=await deleteMyAccount(confirmation.trim(),password);
    if(!result.ok){
     toast.error(result.message??"ไม่สามารถลบบัญชีได้");
     return;
    }
    setConfirmation("");
    setPassword("");
    try{
     await supabaseBrowser().auth.signOut({scope:"local"});
    }catch{
     // The account has already been deleted on the server.
    }
    router.replace("/login");
    router.refresh();
    toast.success("ลบบัญชีและคลังอนิเมะแล้ว");
   }catch(error){
    toast.error(error instanceof Error?error.message:"ไม่สามารถลบบัญชีได้");
   }
  });
 }

 return <section className="panel border-red-500/40 p-5 sm:p-7 space-y-4" aria-labelledby="delete-account-title">
  <div className="flex items-center gap-2 text-red-400">
   <UserRoundX size={22}/>
   <h2 id="delete-account-title" className="text-lg font-bold">ลบบัญชี</h2>
  </div>
  <p className="muted text-sm leading-7">
   ลบบัญชีนี้พร้อมคลังอนิเมะ รูปโปรไฟล์ ข้อมูลการตั้งค่า และลิงก์แชร์อย่างถาวร การดำเนินการนี้ไม่สามารถย้อนกลับได้
  </p>
  <p className="flex items-start gap-2 text-xs text-amber-300">
   <AlertTriangle size={16} className="mt-0.5 shrink-0"/>
   ต้องยืนยันรหัสผ่านปัจจุบันก่อนลบ
  </p>
  <label className="block text-sm font-semibold" htmlFor="delete-account-confirm">
   พิมพ์ <strong className="text-red-400">{CONFIRM_TEXT}</strong> เพื่อยืนยัน
   <input id="delete-account-confirm" className="field mt-2" autoComplete="off" placeholder={CONFIRM_TEXT} value={confirmation} disabled={busy} onChange={e=>setConfirmation(e.target.value)}/>
  </label>
  <label className="block text-sm font-semibold" htmlFor="delete-account-password">
   รหัสผ่านปัจจุบัน
   <input id="delete-account-password" type="password" autoComplete="current-password" className="field mt-2" placeholder="กรอกรหัสผ่านเพื่อยืนยันตัวตน" value={password} disabled={busy} onChange={e=>setPassword(e.target.value)}/>
  </label>
  <button type="button" onClick={handleDelete} disabled={!canDelete} className="btn !border-red-600 !bg-red-600 !text-white disabled:opacity-40">
   <UserRoundX size={18}/>{busy?"กำลังลบบัญชี...":"ลบบัญชีถาวร"}
  </button>
 </section>;
}
