"use client";
import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import Image from "next/image";
import {LayoutGrid,List,Search,SlidersHorizontal,CalendarDays,CheckCircle2,Star,BookOpen} from "lucide-react";
import type {Anime} from "@/types/anime";
import DeleteButton from "@/components/ui/DeleteButton";
type Sort="finished"|"rating"|"title"|"release"|"episodes";
const sorts:Sort[]=["finished","rating","title","release","episodes"];
export default function LibraryView({anime,readonly=false}:{anime:Anime[];readonly?:boolean}){
 const [ready,setReady]=useState(false);
 const [mode,setMode]=useState<"grid"|"list">("grid");
 const [search,setSearch]=useState("");
 const [genres,setGenres]=useState<string[]>([]);
 const [min,setMin]=useState("1");
 const [max,setMax]=useState("10");
 const [release,setRelease]=useState("");
 const [finished,setFinished]=useState("");
 const [sort,setSort]=useState<Sort>("finished");
 const [showGenres,setShowGenres]=useState(false);
 const [episodeSize,setEpisodeSize]=useState("all");
 const [cardSize,setCardSize]=useState<"tiny"|"small"|"medium">("small");
 useEffect(()=>{const timer=setTimeout(()=>{
  const p=new URLSearchParams(location.search);
  setMode(localStorage.getItem("anime-view")==="list"?"list":"grid");
  const size=localStorage.getItem("anime-card-size");setCardSize(size==="tiny"||size==="small"||size==="medium"?size:size==="large"?"medium":"small");
  setSearch(p.get("q")||"");setGenres(p.get("genres")?.split(",").filter(Boolean)||[]);
  setMin(p.get("min")||"1");setMax(p.get("max")||"10");
  setRelease(p.get("release")||"");setFinished(p.get("finished")||"");
  const choice=p.get("sort") as Sort;setSort(sorts.includes(choice)?choice:"finished");setReady(true);
 },0);return()=>clearTimeout(timer)},[]);
 useEffect(()=>{if(!ready)return;const p=new URLSearchParams(location.search);
  for(const k of ["q","genres","min","max","release","finished","sort"])p.delete(k);
  if(search)p.set("q",search);if(genres.length)p.set("genres",genres.join(","));
  if(min!=="1")p.set("min",min);if(max!=="10")p.set("max",max);
  if(release)p.set("release",release);if(finished)p.set("finished",finished);
  if(sort!=="finished")p.set("sort",sort);const value=p.toString();
  window.history.replaceState(null,"",location.pathname+(value?"?"+value:"")+location.hash);
 },[ready,search,genres,min,max,release,finished,sort]);
 const allGenres=useMemo(()=>[...new Set(anime.flatMap(a=>a.genres))].sort(),[anime]);
 const years=(field:"aired_date"|"finished_date")=>[...new Set(anime.map(a=>a[field]?.slice(0,4)).filter((v):v is string=>Boolean(v)))].sort().reverse();
 const filtered=useMemo(()=>anime.filter(a=>(a.title+" "+(a.title_th||"")).toLowerCase().includes(search.toLowerCase())&&genres.every(g=>a.genres.includes(g))&&a.rating>=Number(min)&&a.rating<=Number(max)&&(!release||a.aired_date?.startsWith(release))&&(!finished||a.finished_date.startsWith(finished))&&(episodeSize==="all"||(a.episodes!==null&&(episodeSize==="short"?a.episodes<=12:episodeSize==="medium"?a.episodes>=13&&a.episodes<=26:episodeSize==="long"?a.episodes>=27:true)))).sort((a,b)=>sort==="rating"?b.rating-a.rating:sort==="title"?a.title.localeCompare(b.title):sort==="release"?(b.aired_date||"").localeCompare(a.aired_date||""):sort==="episodes"?(b.episodes||0)-(a.episodes||0):b.finished_date.localeCompare(a.finished_date)),[anime,search,genres,min,max,release,finished,sort,episodeSize]);
 function switchMode(value:"grid"|"list"){setMode(value);localStorage.setItem("anime-view",value)}
 function switchSize(value:"tiny"|"small"|"medium"){setCardSize(value);localStorage.setItem("anime-card-size",value)}
 return <section className="space-y-5" aria-label="คลังอนิเมะ">
  <div className="page-heading !mb-0"><div><h2 className="page-title">รายการอนิเมะ<span className="gradient-text">ที่ดูจบแล้ว</span></h2><p className="page-subtitle">ทั้งหมด {anime.length} เรื่อง · แสดง {filtered.length} เรื่อง</p></div>
  </div>
  <div className="panel p-4 sm:p-5 space-y-4">
   <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
    <label className="relative flex-1 max-w-2xl"><Search size={19} className="absolute top-1/2 -translate-y-1/2 left-4 muted"/><input className="field !pl-11" aria-label="ค้นหาอนิเมะ" placeholder="ค้นหาอนิเมะที่ดูจบแล้ว..." value={search} onChange={e=>setSearch(e.target.value)}/></label>
    <div className="flex w-full lg:w-auto justify-between lg:justify-end items-center gap-2 flex-wrap min-w-0"><span className="muted text-xs hidden sm:inline">ทั้งหมด {filtered.length} เรื่อง</span>
     {mode==="grid"&&<div className="flex items-center gap-1.5 min-w-0 max-w-full flex-wrap">
      <span className="text-xs font-semibold text-[var(--muted)] whitespace-nowrap">ขนาดการ์ด</span>
      <div className="flex items-center gap-0.5 rounded-xl border border-[var(--border)] bg-[var(--panel-raised)] p-1" role="group" aria-label="ขนาดการ์ด">
       {([
        {value:"tiny",text:"เล็ก",hint:"การ์ดขนาดเล็ก"},
        {value:"small",text:"กลาง",hint:"การ์ดขนาดกลาง"},
        {value:"medium",text:"ใหญ่",hint:"การ์ดขนาดใหญ่"},
       ] as const).map(item=><button key={item.value} type="button" title={item.hint}
        aria-label={item.hint} aria-pressed={cardSize===item.value}
        onClick={()=>switchSize(item.value)}
        className={"rounded-lg px-2 py-2 text-xs font-semibold transition-colors "+(cardSize===item.value?"bg-violet-600 text-white":"text-[var(--muted)] hover:text-[var(--foreground)]")}
       >{item.text}</button>)}
      </div>
     </div>}<div className="flex gap-1 rounded-xl border border-[var(--border)] p-1">
     <button title="แสดงแบบตาราง" aria-label="แสดงแบบตาราง" aria-pressed={mode==="grid"} onClick={()=>switchMode("grid")} className={"p-2.5 rounded-lg "+(mode==="grid"?"bg-violet-600 text-white":"")}><LayoutGrid size={18}/></button>
     <button title="แสดงแบบรายการ" aria-label="แสดงแบบรายการ" aria-pressed={mode==="list"} onClick={()=>switchMode("list")} className={"p-2.5 rounded-lg "+(mode==="list"?"bg-violet-600 text-white":"")}><List size={18}/></button>
    </div></div>
   </div>
   <div className="flex items-center gap-2 text-xs font-bold muted"><SlidersHorizontal size={16}/> ตัวกรองและการเรียงลำดับ</div>
   <div className="grid grid-cols-1 min-[460px]:grid-cols-2 md:grid-cols-3 2xl:grid-cols-6 gap-3">
    <label className="text-xs font-semibold">คะแนนต่ำสุด<select className="field mt-2" value={min} onChange={e=>setMin(e.target.value)}>{Array.from({length:10},(_,i)=><option key={i} value={i+1}>{i+1}/10</option>)}</select></label>
    <label className="text-xs font-semibold">คะแนนสูงสุด<select className="field mt-2" value={max} onChange={e=>setMax(e.target.value)}>{Array.from({length:10},(_,i)=><option key={i} value={i+1}>{i+1}/10</option>)}</select></label>
    <label className="text-xs font-semibold">ปีที่ออกฉาย<select className="field mt-2" value={release} onChange={e=>setRelease(e.target.value)}><option value="">ทุกปี</option>{years("aired_date").map(y=><option key={y}>{y}</option>)}</select></label>
    <label className="text-xs font-semibold">ปีที่ดูจบ<select className="field mt-2" value={finished} onChange={e=>setFinished(e.target.value)}><option value="">ทุกปี</option>{years("finished_date").map(y=><option key={y}>{y}</option>)}</select></label>
    <label className="text-xs font-semibold">ขนาดเรื่อง (จำนวนตอน)<select className="field mt-2" value={episodeSize} onChange={e=>setEpisodeSize(e.target.value)}><option value="all">ทั้งหมด</option><option value="short">สั้น · 1–12 ตอน</option><option value="medium">กลาง · 13–26 ตอน</option><option value="long">ยาว · 27+ ตอน</option></select></label>
    <label className="text-xs font-semibold">เรียงตาม<select className="field mt-2" value={sort} onChange={e=>setSort(e.target.value as Sort)}>
     <option value="finished">ดูล่าสุดก่อน</option><option value="rating">คะแนนสูงสุด</option><option value="title">ชื่อ A-Z</option><option value="release">ปีที่ออกฉาย</option><option value="episodes">จำนวนตอน</option>
    </select></label>
   </div>
   {allGenres.length>0&&<div><button type="button" className="text-sm font-bold text-violet-400" aria-expanded={showGenres} onClick={()=>setShowGenres(v=>!v)}>แนวอนิเมะ ({genres.length} เลือก) {showGenres?"−":"+"}</button>
    {showGenres&&<fieldset className="flex flex-wrap gap-2 mt-3"><legend className="sr-only">เลือกแนวอนิเมะ</legend>{allGenres.map(g=><label key={g} className="tag cursor-pointer"><input type="checkbox" className="mr-2 accent-violet-500" checked={genres.includes(g)} onChange={e=>setGenres(p=>e.target.checked?[...p,g]:p.filter(x=>x!==g))}/>{g}</label>)}</fieldset>}
   </div>}
  </div>
  {filtered.length===0?<div className="panel py-16 px-5 text-center space-y-4"><BookOpen size={48} className="text-violet-400 mx-auto"/><h3 className="text-xl font-bold">ยังไม่พบอนิเมะในคลัง</h3><p className="muted text-sm">{anime.length?"ลองปรับตัวกรองหรือค้นหาด้วยคำอื่น":"เริ่มต้นบันทึกเรื่องแรกของคุณ"}</p></div>
  :mode==="grid"?<div className={"grid gap-3 sm:gap-5 "+(cardSize==="tiny"?"grid-cols-2 min-[480px]:grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10":cardSize==="small"?"grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-7":"grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5")}>
   {filtered.map(a=><Link key={a.id} href={readonly?"#":"/anime/"+a.id} className="panel overflow-hidden group transition-all hover:-translate-y-1 hover:border-violet-500">
    <div className="relative aspect-[3/4] bg-violet-950/20 overflow-hidden">
     {a.poster_url?<Image unoptimized src={a.poster_url} alt={a.title} fill sizes="(max-width:640px) 50vw, 240px" className="object-cover transition-transform duration-500 group-hover:scale-105"/>:<div className="poster-placeholder h-full"><BookOpen size={40}/></div>}
     <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-violet-600/90 text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 grid place-items-center"><CheckCircle2 size={16}/></span>
    </div>
    <div className={cardSize==="tiny"?"p-2":"p-3 sm:p-4"}><h3 className={cardSize==="tiny"?"font-bold text-xs line-clamp-2 min-h-8":"font-bold text-sm sm:text-base line-clamp-2 min-h-10"}>{a.title}</h3>
     {a.title_th&&<p className="muted text-xs mt-1 truncate">{a.title_th}</p>}
     <p className="text-violet-400 font-bold mt-3 flex items-center gap-1.5"><Star size={16} fill="currentColor"/>{a.rating}<span className="text-xs muted">/10</span></p>
     <p className="muted text-[10px] sm:text-xs mt-3 flex gap-1 items-center min-w-0"><CalendarDays size={13} className="shrink-0"/><span className="truncate">{a.finished_date}</span></p>
    </div>
   </Link>)}
  </div>:<div className="space-y-3">{filtered.map(a=><div key={a.id} className="panel p-3 flex items-center gap-4">
   <Link href={readonly?"#":"/anime/"+a.id} className="relative shrink-0 w-16 h-22 sm:w-20 sm:h-27 rounded-lg overflow-hidden bg-violet-950/20">{a.poster_url?<Image unoptimized src={a.poster_url} alt={a.title} fill sizes="80px" className="object-cover"/>:<div className="poster-placeholder h-full"><BookOpen size={24}/></div>}</Link>
   <div className="min-w-0 flex-1"><Link href={readonly?"#":"/anime/"+a.id} className="font-bold hover:text-violet-400 line-clamp-1">{a.title}</Link>{a.title_th&&<p className="muted text-xs truncate">{a.title_th}</p>}<p className="muted text-xs mt-1 truncate">{a.genres.join(" · ")}</p><p className="muted text-xs mt-2">{a.episodes??"—"} ตอน · {a.finished_date}</p></div>
   <span className="text-violet-400 font-bold flex gap-1 items-center"><Star size={15} fill="currentColor"/>{a.rating}</span>
   {!readonly&&<div className="hidden lg:flex gap-2"><Link className="btn text-xs" href={"/anime/"+a.id+"/edit"}>แก้ไข</Link><DeleteButton id={a.id}/></div>}
  </div>)}</div>}
 </section>;
}
