import {requireOwner} from "@/lib/queries";
import Navbar from "@/components/ui/Navbar";
import Link from "next/link";
import {notFound} from "next/navigation";
import DeleteButton from "@/components/ui/DeleteButton";
import Image from "next/image";
import {ArrowLeft,CalendarDays,Clapperboard, CheckCircle2,Pencil, Star,BookOpen} from "lucide-react";
import {ratingColor} from "@/lib/rating-color";

export default async function Detail({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const {sb,user}=await requireOwner();
  const {data:a}=await sb.from("anime").select("*").eq("id",id).eq("owner_id",user.id).maybeSingle();
  if(!a)notFound();
  return <>
    <Navbar/>
    <main className="shell py-7 md:py-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-7">
        <Link className="btn" href="/#my-library"><ArrowLeft size={18}/> กลับไปคลังอนิเมะ</Link>
        <span className="tag"><CheckCircle2 size={15} className="text-violet-400 mr-1"/> ดูจบแล้ว</span>
      </div>
      <section className="panel feature-panel p-4 sm:p-6 lg:p-8 overflow-hidden relative">
        <div className="absolute inset-x-0 top-0 h-64 pointer-events-none opacity-20" style={{background:"var(--accent)"}}/>
        <div className="relative grid gap-7 lg:gap-11 md:grid-cols-[minmax(220px,340px)_1fr]">
          <div className="relative aspect-[2/3] w-full max-w-[390px] mx-auto rounded-2xl overflow-hidden border-2 border-violet-500/50 shadow-[0_0_35px_#9e53ea22]">
            {a.poster_url?<Image unoptimized src={a.poster_url} alt={a.title} fill sizes="(max-width: 768px) 90vw, 340px" className="object-cover"/>:<div className="poster-placeholder w-full h-full"><BookOpen size={72}/></div>}
          </div>
          <div className="space-y-6">
            <div><h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">{a.title}</h1>{a.title_th&&<p className="mt-2 text-lg text-pink-400">{a.title_th}</p>}{a.watch_url&&/^https?:\/\//i.test(a.watch_url)&&<a href={a.watch_url} target="_blank" rel="noopener noreferrer" className="text-violet-400 text-sm underline mt-3 inline-block">เปิดลิงก์ดูอนิเมะ</a>}</div>
            <div className="flex flex-wrap gap-3 muted text-sm"><span className="flex items-center gap-2"><CalendarDays size={17}/>{a.aired_date?.slice(0,4)||"ไม่ระบุปี"}</span><span className="flex items-center gap-2"><Clapperboard size={17}/>{a.episodes??"—"} ตอน</span></div>
            <div className="border-t border-[var(--border)] pt-6"><p className="text-sm font-bold mb-3">แนวอนิเมะ</p><div className="flex flex-wrap gap-2">{a.genres.length?a.genres.map((g:string)=><span className="tag" key={g}>{g}</span>):<span className="muted text-sm">ไม่ได้ระบุแนว</span>}</div></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div><p className="muted text-sm mb-2">คะแนนของคุณ</p><p className="text-3xl font-extrabold flex items-center gap-2" style={{color:ratingColor(a.rating)}}><Star size={28} fill="currentColor"/>{a.rating}<span className="muted text-lg">/10</span></p></div>
              <div><p className="muted text-sm mb-2">วันที่ดูจบ</p><p className="font-semibold flex items-center gap-2"><CalendarDays size={19} className="text-violet-400"/>{a.finished_date}</p></div>
            </div>
            <div><p className="font-bold mb-3">รีวิวของคุณ</p><div className="rounded-xl p-5 bg-[var(--panel-raised)] border border-[var(--border)] min-h-32 whitespace-pre-wrap leading-7 text-sm">{a.review||<span className="muted">ยังไม่มีรีวิวสำหรับเรื่องนี้</span>}</div></div>
            <div className="flex flex-wrap gap-3"><Link className="btn anime-action anime-action-edit min-w-36" href={`/anime/${id}/edit`}> <Pencil size={17}/> แก้ไข</Link><DeleteButton id={id}/></div>
          </div>
        </div>
      </section>
    </main>
  </>;
}
