import {requireOwner} from "@/lib/queries";
import {notFound} from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import AnimeForm from "@/components/forms/AnimeForm";
import Link from "next/link";
import { ChevronRight, House } from "lucide-react";

export default async function EditPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const {sb,user}=await requireOwner();
  const {data:a}=await sb.from("anime").select("*").eq("id",id).eq("owner_id",user.id).maybeSingle();
  if(!a)notFound();
  const {data:existing}=await sb.from('anime').select('mal_id').eq('owner_id',user.id).neq('id',id).not('mal_id','is',null);
  return <>
    <Navbar/>
    <main className="shell py-7 md:py-10">
      <nav className="mb-5 flex items-center gap-2 text-xs muted"><Link href="/" aria-label="หน้าหลัก"><House size={16}/></Link><ChevronRight size={14}/><Link href={`/anime/${id}`}>{a.title}</Link><ChevronRight size={14}/> แก้ไข</nav>
      <div className="page-heading"><div><h1 className="page-title">แก้ไขข้อมูล<span className="gradient-text">อนิเมะ</span></h1><p className="page-subtitle">ปรับข้อมูลที่คุณบันทึกไว้แล้ว</p></div></div>
      <AnimeForm anime={a} existingMalIds={(existing??[]).map(x=>x.mal_id).filter((value):value is number=>value!==null)}/>
    </main>
  </>;
}
