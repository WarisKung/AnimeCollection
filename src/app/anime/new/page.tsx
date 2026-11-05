import { requireOwner } from "@/lib/queries";
import Navbar from "@/components/ui/Navbar";
import AnimeForm from "@/components/forms/AnimeForm";
import { House, ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function NewAnime() {
  const {sb,user}=await requireOwner();
  const {data:existing}=await sb.from('anime').select('mal_id').eq('owner_id',user.id).not('mal_id','is',null);
  return <>
    <Navbar/>
    <main className="shell py-7 md:py-10">
      <nav className="mb-5 flex items-center gap-2 text-xs muted"><Link href="/" aria-label="หน้าหลัก"><House size={16}/></Link><ChevronRight size={14}/> เพิ่มอนิเมะ</nav>
      <div className="page-heading"><div><h1 className="page-title">เพิ่มอนิเมะ<span className="gradient-text">ที่ดูจบแล้ว</span></h1><p className="page-subtitle">ค้นหาเรื่องที่ต้องการจาก AniList หรือกรอกข้อมูลเองได้ทุกช่อง</p></div></div>
      <AnimeForm existingMalIds={(existing??[]).map(x=>x.mal_id).filter((id):id is number=>id!==null)}/>
    </main>
  </>;
}
