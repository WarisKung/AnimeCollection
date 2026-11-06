"use client";

import {useTransition} from "react";
import {Trash2} from "lucide-react";
import {deleteAnime} from "@/lib/actions";
import {toast} from "sonner";

export default function DeleteButton({id}:{id:string}){
 const [busy,start]=useTransition();

 function remove(){
  if(!window.confirm("ต้องการลบอนิเมะเรื่องนี้อย่างถาวรหรือไม่?"))return;
  start(async()=>{
   try{await deleteAnime(id)}
   catch(e){toast.error(e instanceof Error?e.message:"ลบอนิเมะไม่สำเร็จ")}
  });
 }

 return <button
  type="button"
  className="btn anime-action anime-action-delete"
  title="ลบอนิเมะ"
  aria-label="ลบอนิเมะ"
  disabled={busy}
  onClick={remove}
 ><Trash2 size={16} aria-hidden="true"/>{busy?"กำลังลบ...":"ลบ"}</button>;
}
