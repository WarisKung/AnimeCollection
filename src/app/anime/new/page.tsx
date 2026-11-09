import { requireOwner } from "@/lib/queries";
import Navbar from "@/components/ui/Navbar";
import AnimeForm from "@/components/forms/AnimeForm";
import PageBreadcrumb from "@/components/ui/PageBreadcrumb";

export default async function NewAnime() {
  const {sb,user}=await requireOwner();
  const {data:existing}=await sb.from('anime').select('mal_id').eq('owner_id',user.id).not('mal_id','is',null);
  return <>
    <Navbar/>
    <main className="shell py-7 md:py-10">
      <PageBreadcrumb current="เพิ่มอนิเมะ"/>
      <div className="page-heading"><div><h1 className="page-title">เพิ่มอนิเมะ<span className="gradient-text">ที่ดูจบแล้ว</span></h1><p className="page-subtitle">ค้นหาเรื่องและบันทึกอนิเมะ</p></div></div>
      <AnimeForm existingMalIds={(existing??[]).map(x=>x.mal_id).filter((id):id is number=>id!==null)}/>
    </main>
  </>;
}
