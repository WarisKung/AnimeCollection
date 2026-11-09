"use client";
import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import Image from "next/image";
import {LayoutGrid,List,Search,SlidersHorizontal,CalendarDays,CheckCircle2,Star,BookOpen,Pencil} from "lucide-react";
import type {Anime} from "@/types/anime";
import DeleteButton from "@/components/ui/DeleteButton";
import {ratingColor} from "@/lib/rating-color";
import {genreTagStyle} from "@/lib/genre-color";
type Sort="finished"|"rating"|"title"|"release"|"episodes";
const sorts:Sort[]=["finished","rating","title","release","episodes"];
export default function LibraryView({anime,readonly=false,shareBase}:{anime:Anime[];readonly?:boolean;shareBase?:string}){
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
 const [showFilters,setShowFilters]=useState(false);
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
 const animeHref=(id:string)=>readonly?(shareBase?shareBase+"/anime/"+id:"#"):"/anime/"+id;
 function switchMode(value:"grid"|"list"){setMode(value);localStorage.setItem("anime-view",value)}
 function switchSize(value:"tiny"|"small"|"medium"){setCardSize(value);localStorage.setItem("anime-card-size",value)}
 return <section className="space-y-5" aria-label="คลังอนิเมะ">
  <div className="page-heading !mb-0"><div><h2 className="page-title">รายการอนิเมะ<span className="gradient-text">ที่ดูจบแล้ว</span></h2><p className="page-subtitle">ทั้งหมด {anime.length} เรื่อง · แสดง {filtered.length} เรื่อง</p></div>
  </div>
  <div className="panel p-4 sm:p-5 space-y-4">
   <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
    <label className="relative flex-1 max-w-2xl"><Search size={19} className="absolute top-1/2 -translate-y-1/2 left-4 muted"/><input className="field !pl-11" aria-label="ค้นหาอนิเมะ" placeholder="ค้นหาอนิเมะที่ดูจบแล้ว..." value={search} onChange={e=>setSearch(e.target.value)}/></label>
    <div className="flex w-full lg:w-auto justify-between lg:justify-end items-center gap-2 flex-wrap min-w-0">
     {mode==="grid"&&<div className="hidden sm:flex items-center gap-1.5 min-w-0 max-w-full flex-wrap">
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
   <button type="button" aria-expanded={showFilters} aria-controls="library-filter-fields" onClick={()=>setShowFilters(v=>!v)} className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-xs font-bold muted transition-colors hover:bg-[var(--panel-raised)] hover:text-[var(--foreground)]">
    <span className="flex items-center gap-2"><SlidersHorizontal size={16}/> ตัวกรองและการเรียงลำดับ</span>
    <span className="text-violet-400">{showFilters?"−":"+"}</span>
   </button>
   {showFilters&&<div id="library-filter-fields" className="space-y-4">
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
    {showGenres&&<fieldset className="flex flex-wrap gap-2 mt-3"><legend className="sr-only">เลือกแนวอนิเมะ</legend>{allGenres.map(g=><label key={g} className="tag cursor-pointer" style={genreTagStyle(g)}><input type="checkbox" className="mr-2 accent-violet-500" checked={genres.includes(g)} onChange={e=>setGenres(p=>e.target.checked?[...p,g]:p.filter(x=>x!==g))}/>{g}</label>)}</fieldset>}
   </div>}
   </div>}
  </div>
  {filtered.length===0?<div className="panel py-16 px-5 text-center space-y-4"><BookOpen size={48} className="text-violet-400 mx-auto"/><h3 className="text-xl font-bold">ยังไม่พบอนิเมะในคลัง</h3><p className="muted text-sm">{anime.length?"ลองปรับตัวกรองหรือค้นหาด้วยคำอื่น":"เริ่มต้นบันทึกเรื่องแรกของคุณ"}</p></div>
  :mode==="grid"?<div className={"grid gap-3 sm:gap-5 "+(cardSize==="tiny"?"grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10":cardSize==="small"?"grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6":"grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4")}>
   {filtered.map(a=><Link key={a.id} href={animeHref(a.id)} className="panel relative isolate overflow-hidden group transition-all hover:-translate-y-1 hover:border-violet-500">
    {a.poster_url&&<span className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true"><Image unoptimized src={a.poster_url} alt="" fill sizes="320px" className="object-cover scale-125 blur-2xl opacity-75"/><span className="absolute inset-0 bg-[#0a0d1c]/40"/></span>}
    <div className="relative z-10 aspect-[3/4] bg-violet-950/20 overflow-hidden">
     {a.poster_url?<Image unoptimized src={a.poster_url} alt={a.title} fill sizes="(max-width:640px) 50vw, 240px" className="object-cover transition-transform duration-500 group-hover:scale-105"/>:<div className="poster-placeholder h-full"><BookOpen size={40}/></div>}
     <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-violet-600/90 text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 grid place-items-center"><CheckCircle2 size={16}/></span>
     <div role="tooltip" className="anime-card-tooltip pointer-events-none absolute inset-x-2 bottom-2 z-20 hidden translate-y-2 rounded-xl border border-white/30 bg-[#11162d]/35 p-2.5 text-[11px] leading-relaxed text-white opacity-0 shadow-[0_8px_30px_#0008] backdrop-blur-xl backdrop-saturate-150 transition-all duration-200 md:block md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100">
      <div>จำนวนตอน: {a.episodes??"ไม่ระบุ"}</div>
      {a.anime_format&&<div>ประเภท: {a.anime_format}</div>}
      {a.duration_minutes!=null&&<div>ความยาว: {a.duration_minutes} นาที/ตอน</div>}
      {a.genres.length>0&&<div className="mt-1 flex flex-wrap gap-1">{a.genres.slice(0,3).map(g=><span className="rounded border px-1" style={genreTagStyle(g)} key={g}>{g}</span>)}</div>}
      {a.review&&<p className="mt-1 line-clamp-2 text-white/80">{a.review}</p>}
     </div>
    </div>
    <div className={"relative z-10 isolate overflow-hidden text-white "+(cardSize==="tiny"?"p-2":"p-2 sm:p-4")}>
     {a.poster_url&&<span className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
      <Image unoptimized src={a.poster_url} alt="" fill sizes="320px" className="object-cover scale-125 blur-xl opacity-90"/>
      <span className="absolute inset-0 bg-gradient-to-t from-[#090c1b]/85 via-[#090c1b]/55 to-[#090c1b]/50"/>
     </span>}
     <h3 className={cardSize==="tiny"?"font-bold text-xs line-clamp-2 min-h-8":"font-bold text-xs sm:text-base line-clamp-2 min-h-8 sm:min-h-10"}>{a.title}</h3>
     {a.title_th&&<p className="muted text-xs mt-1 truncate">{a.title_th}</p>}
     <p className="font-bold mt-3 flex items-center gap-1.5" style={{color:ratingColor(a.rating)}}><Star size={16} fill="currentColor"/>{a.rating}<span className="text-xs muted">/10</span></p>
     <p className="text-slate-200 text-[10px] sm:text-xs mt-3 flex gap-1 items-center min-w-0"><CalendarDays size={13} className="shrink-0"/><span className="truncate">{a.finished_date}</span></p>
    </div>
   </Link>)}
  </div>:<div className="space-y-3">{filtered.map(a=><div key={a.id} className="panel relative isolate overflow-hidden p-3 flex items-center gap-4">
   {a.poster_url&&<span className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true"><Image unoptimized src={a.poster_url} alt="" fill sizes="480px" className="object-cover scale-110 blur-2xl opacity-75"/><span className="absolute inset-0 bg-[#0a0d1c]/40"/></span>}
   <Link href={animeHref(a.id)} className="relative z-10 shrink-0 w-16 h-22 sm:w-20 sm:h-27 rounded-lg overflow-hidden bg-violet-950/20">{a.poster_url?<Image unoptimized src={a.poster_url} alt={a.title} fill sizes="80px" className="object-cover"/>:<div className="poster-placeholder h-full"><BookOpen size={24}/></div>}</Link>
   <div className="relative z-10 min-w-0 flex-1"><Link href={animeHref(a.id)} className="font-bold hover:text-violet-400 line-clamp-1">{a.title}</Link>{a.title_th&&<p className="muted text-xs truncate">{a.title_th}</p>}<div className="mt-1 flex flex-wrap gap-1">{a.genres.map(g=><span key={g} className="tag" style={genreTagStyle(g)}>{g}</span>)}</div><p className="muted text-xs mt-2">{a.episodes??"—"} ตอน · {a.finished_date}</p></div>
   <span className="relative z-10 font-bold flex gap-1 items-center" style={{color:ratingColor(a.rating)}}><Star size={15} fill="currentColor"/>{a.rating}</span>
   {!readonly&&<div className="relative z-10 hidden lg:flex gap-2"><Link className="btn anime-action anime-action-edit text-xs" href={"/anime/"+a.id+"/edit"}><Pencil size={16}/>แก้ไข</Link><DeleteButton id={a.id}/></div>}
  </div>)}</div>}
 </section>;
}
