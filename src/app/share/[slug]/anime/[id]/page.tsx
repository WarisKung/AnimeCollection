import type {Metadata} from "next";
import {notFound} from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {ArrowLeft,BookOpen,CalendarDays,Clapperboard,Clock3,Star,ExternalLink} from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import {getPublicLibrary} from "@/lib/queries";
import {ratingColor} from "@/lib/rating-color";
import {genreTagStyle} from "@/lib/genre-color";

export const dynamic="force-dynamic";
export const metadata:Metadata={robots:{index:false,follow:false}};

export default async function SharedAnimeDetail({params}:{params:Promise<{slug:string;id:string}>}){
 const {slug,id}=await params;
 const library=await getPublicLibrary(slug);
 const anime=library?.anime.find(item=>item.id===id);
 if(!anime)notFound();

 const shareBase="/share/"+encodeURIComponent(slug);
 const watchUrl=anime.watch_url&&/^https?:\/\//i.test(anime.watch_url)?anime.watch_url:null;

 return <>
  <Navbar readonly shareBase={shareBase}/>
  <main className="shell py-7 md:py-10 space-y-6">
   <Link href={shareBase+"#my-library"} className="btn"><ArrowLeft size={18}/>กลับไปคลังอนิเมะ</Link>
   <section className="panel feature-panel grid gap-6 p-4 sm:p-7 md:grid-cols-[minmax(200px,320px)_minmax(0,1fr)]">
    <div className="relative mx-auto aspect-[2/3] w-full max-w-[320px] overflow-hidden rounded-2xl border border-violet-500/40 bg-violet-950/20">
     {anime.poster_url?<Image unoptimized src={anime.poster_url} alt={anime.title} fill sizes="(max-width:768px) 90vw,320px" className="object-cover"/>:<div className="poster-placeholder h-full"><BookOpen size={56}/></div>}
    </div>
    <div className="min-w-0 space-y-6">
     <div>
      <h1 className="text-2xl font-extrabold leading-tight sm:text-3xl">{anime.title}</h1>
      {anime.title_th&&<p className="mt-2 text-pink-400">{anime.title_th}</p>}
      <p className="muted mt-2 text-xs">รายละเอียดอนิเมะ · อ่านอย่างเดียว</p>
     </div>
     <div className="flex flex-wrap items-center gap-4 text-sm">
      <span className="flex items-center gap-2 font-extrabold text-xl" style={{color:ratingColor(anime.rating)}}><Star size={20} fill="currentColor"/>{anime.rating}/10</span>
      <span className="muted flex items-center gap-2"><Clapperboard size={17}/>{anime.episodes??"—"} ตอน</span>
      {anime.duration_minutes!=null&&<span className="muted flex items-center gap-2"><Clock3 size={17}/>{anime.duration_minutes} นาที/ตอน</span>}
      <span className="muted flex items-center gap-2"><CalendarDays size={17}/>{anime.finished_date}</span>
     </div>
     <div>
      <h2 className="mb-3 font-bold">แนวอนิเมะ</h2>
      <div className="flex flex-wrap gap-2">{anime.genres.length?anime.genres.map(genre=><span key={genre} className="tag" style={genreTagStyle(genre)}>{genre}</span>):<span className="muted text-sm">ไม่ได้ระบุแนว</span>}</div>
     </div>
     {anime.aired_date&&<p className="text-sm"><span className="muted">วันที่ออกฉาย: </span>{anime.aired_date}</p>}
     {anime.anime_format&&<p className="text-sm"><span className="muted">ประเภท: </span>{anime.anime_format}</p>}
     <div>
      <h2 className="mb-3 font-bold">รีวิว</h2>
      <p className="min-h-24 whitespace-pre-wrap rounded-xl border border-[var(--border)] bg-[var(--panel-raised)] p-4 text-sm leading-7">{anime.review||<span className="muted">ยังไม่มีรีวิวสำหรับเรื่องนี้</span>}</p>
     </div>
     {watchUrl&&<a href={watchUrl} target="_blank" rel="noopener noreferrer" className="btn"><ExternalLink size={17}/>เปิดลิงก์ดูอนิเมะ</a>}
    </div>
   </section>
  </main>
 </>;
}
