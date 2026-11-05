"use client";

import {useState,useTransition} from "react";
import {useRouter} from "next/navigation";
import {Trash2,AlertTriangle} from "lucide-react";
import {toast} from "sonner";
import {deleteAllAnime} from "@/lib/actions";

const CONFIRM_TEXT="ลบทั้งหมด";

export default function DeleteAllAnime({count}:{count:number}){
 const [confirmation,setConfirmation]=useState("");
 const [busy,startTransition]=useTransition();
 const router=useRouter();
 const allowed=count>0&&confirmation.trim()===CONFIRM_TEXT&&!busy;

 function handleDelete(){
  if(!allowed)return;
  if(!window.confirm("ยืนยันลบอนิเมะทั้งหมด "+count+" เรื่อง? การดำเนินการนี้ไม่สามารถย้อนกลับได้"))return;
  startTransition(async()=>{
   try{
    const result=await deleteAllAnime(confirmation.trim());
    if(!result.ok){toast.error(result.message??"ลบไม่สำเร็จ");return}
    setConfirmation("");
    toast.success("ลบรายการอนิเมะทั้งหมดแล้ว");
    router.refresh();
  }catch(error){
    toast.error(error instanceof Error?error.message:"เกิดข้อผิดพลาดในการลบ");
  }
  });
 }

 return <section className="panel border-red-500/40 p-5 sm:p-7 space-y-4" aria-labelledby="delete-all-title">
  <div className="flex items-center gap-2 text-red-400"><AlertTriangle size={21}/><h2 id="delete-all-title" className="font-bold text-lg">ลบอนิเมะทั้งหมด</h2></div>
  <p className="text-sm muted">ขณะนี้มีอนิเมะ {count.toLocaleString("th-TH")} เรื่องในคลัง การลบจะลบข้อมูลอนิเมะทั้งหมดในบัญชีของคุณอย่างถาวร รวมถึงคะแนนและรีวิว แต่ไม่ลบบัญชีหรือรูปโปรไฟล์</p>
  <label className="block text-sm font-semibold">พิมพ์ <strong className="text-red-400">{CONFIRM_TEXT}</strong> เพื่อยืนยัน
   <input className="field mt-2" autoComplete="off" value={confirmation} onChange={e=>setConfirmation(e.target.value)} placeholder={CONFIRM_TEXT} disabled={busy||count===0}/>
  </label>
  <button type="button" onClick={handleDelete} disabled={!allowed} className="btn !bg-red-600 !text-white !border-red-600 disabled:opacity-40">
   <Trash2 size={18}/>{busy?"กำลังลบ...":"ลบอนิเมะทั้งหมด"}
  </button>
 </section>;
}
