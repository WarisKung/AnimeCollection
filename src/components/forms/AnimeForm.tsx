"use client";
import {useEffect,useState} from "react";
import {useForm,Controller,useWatch} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {animeSchema,type AnimeInput} from "@/lib/validation";
import {saveAnime} from "@/lib/actions";
import type {Anime} from "@/types/anime";
import type {JikanAnime} from "@/lib/jikan";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import Link from "next/link";
import Image from "next/image";
import {Search,CheckCircle2,BookOpen,Star,Save} from "lucide-react";
import {ratingColor} from "@/lib/rating-color";

export default function AnimeForm({anime,existingMalIds=[]}:{anime?:Anime;existingMalIds?:number[]}){
 const ownedIds=new Set(existingMalIds);
 const router=useRouter();
 const [q,setQ]=useState("");
 const [matches,setMatches]=useState<JikanAnime[]>([]);
 const [searchError,setSearchError]=useState("");
 const [searching,setSearching]=useState(false);
 const [saving,setSaving]=useState(false);
 const [selected,setSelected]=useState<number|null>(anime?.mal_id??null);
 const [genreText,setGenreText]=useState(anime?.genres.join(", ")??"");
 const {register,control,handleSubmit,setValue,formState:{errors}}=useForm<AnimeInput>({
  resolver:zodResolver(animeSchema),
  defaultValues:{title:anime?.title??"",title_th:anime?.title_th??"",mal_id:anime?.mal_id??null,
   poster_url:anime?.poster_url??"",aired_date:anime?.aired_date??"",episodes:anime?.episodes??null,
   duration_minutes:anime?.duration_minutes??null,anime_format:anime?.anime_format??null,watch_url:anime?.watch_url??"",
   genres:anime?.genres??[],finished_date:anime?.finished_date??new Date().toISOString().slice(0,10),
   rating:anime?.rating??7,review:anime?.review??"",is_featured:true}
 });
 const values=useWatch({control});
 const genres=values.genres??[];
 const review=values.review??"";
 const poster=values.poster_url??"";
 useEffect(()=>{
  if(q.trim().length<2)return;
  const controller=new AbortController();
  const timer=setTimeout(async()=>{
   setSearching(true);setSearchError("");
   try{const r=await fetch("/api/jikan/search?q="+encodeURIComponent(q),{signal:controller.signal});
    const d=await r.json();if(!r.ok)throw Error(d.error||"Search failed");
    setMatches(d.data||[]);
   }catch(e){if(!controller.signal.aborted)setSearchError(e instanceof Error?e.message:"Search failed")}
   finally{if(!controller.signal.aborted)setSearching(false)}
  },400);
  return()=>{clearTimeout(timer);controller.abort()};
 },[q]);
 async function choose(m:JikanAnime){
  if(ownedIds.has(m.mal_id))return;
  setSelected(m.mal_id);
  try{const response=await fetch("/api/jikan/search?id="+m.mal_id);
   const result=await response.json();if(!response.ok)throw Error(result.error||"Details unavailable");
   const d=result.data as JikanAnime;
   setValue("mal_id",d.mal_id);setValue("title",d.title_english||d.title);
   setValue("poster_url",d.images?.webp?.large_image_url||"");
   setValue("aired_date",d.aired?.from?.slice(0,10)||"");
   setValue("episodes",d.episodes??null);
   setValue("duration_minutes",d.duration_minutes??null);
   setValue("anime_format",d.anime_format??null);
   setValue("watch_url",d.watch_url??"");
   const newGenres=d.genres?.map(g=>g.name)||[];
   setValue("genres",newGenres);
   setGenreText(newGenres.join(", "));
   toast.success("เติมข้อมูลจาก AniList สำเร็จ แก้ไขข้อมูลทุกช่องได้");
  }catch(e){toast.error(e instanceof Error?e.message:"โหลดข้อมูลไม่สำเร็จ")}
 }
 async function submit(data:AnimeInput){
  setSaving(true);
  try{const result=await saveAnime(data,anime?.id);
   if(!result.ok){toast.error(result.message||"บันทึกไม่สำเร็จ");return}
   if(result.message)toast.warning(result.message,{duration:9000});
   else toast.success(anime?"แก้ไขข้อมูลสำเร็จ":"เพิ่มอนิเมะสำเร็จ");
   router.push("/anime/"+result.id);router.refresh();
  }catch(e){toast.error(e instanceof Error?e.message:"บันทึกไม่สำเร็จ")}
  finally{setSaving(false)}
 }
 const airedBeforeFinish=Boolean(values.aired_date&&values.finished_date&&values.finished_date<values.aired_date);
 return <form onSubmit={handleSubmit(submit)} noValidate className="grid gap-5 xl:grid-cols-[minmax(280px,.85fr)_minmax(0,1.3fr)] items-start">
  <section className="panel p-4 sm:p-5 space-y-5">
   <div><h2 className="text-lg font-extrabold flex items-center gap-2"><Search size={19} className="text-violet-400"/> ค้นหาอนิเมะจาก AniList</h2><p className="muted text-xs mt-2">ค้นหาข้อมูลอัตโนมัติ (ไม่บังคับ) หรือกรอกข้อมูลทางขวามือด้วยตนเอง</p></div>
   <label className="relative block"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 muted"/><input className="field !pl-11" value={q} onChange={e=>{setQ(e.target.value);setMatches([])}} placeholder="เช่น Frieren, Steins;Gate..." aria-label="ค้นหาชื่ออนิเมะ"/></label>
   {searching&&<div className="muted text-sm" role="status">กำลังค้นหา...</div>}
   {searchError&&<p role="alert" className="text-sm text-red-400">{searchError} · คุณยังสามารถกรอกข้อมูลเองได้</p>}
   <div className="border-t border-[var(--border)] pt-4"><h3 className="text-sm font-bold mb-3">ผลการค้นหา {matches.length>0&&<span className="muted">({matches.length})</span>}</h3>
    {matches.length===0?<p className="muted text-sm text-center py-10">พิมพ์ชื่ออนิเมะเพื่อค้นหาจาก AniList</p>:<div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
     {matches.map(m=><button type="button" key={m.mal_id} disabled={ownedIds.has(m.mal_id)} onClick={()=>choose(m)} className={"w-full flex text-left gap-3 p-2.5 rounded-xl border transition-colors "+(ownedIds.has(m.mal_id)?"opacity-60 cursor-not-allowed border-[var(--border)] bg-[var(--panel-raised)]":selected===m.mal_id?"search-result-selected":"border-[var(--border)] bg-[var(--panel-raised)] hover:border-violet-500")}>
      <span className="relative h-22 w-17 shrink-0 overflow-hidden rounded-lg bg-violet-950/30">{m.images?.webp?.large_image_url?<Image unoptimized src={m.images.webp.large_image_url} fill sizes="68px" className="object-cover" alt={m.title}/>:<span className="poster-placeholder h-full"><BookOpen size={22}/></span>}</span>
      <span className="flex flex-col flex-1 min-w-0 justify-center"><strong className="text-sm line-clamp-2">{m.title_english||m.title}</strong><small className="muted mt-2">{m.year??"—"} · {m.episodes??"?"} ตอน {ownedIds.has(m.mal_id)?"· เพิ่มแล้ว":""}</small></span>
      <span className="self-center text-violet-400">{ownedIds.has(m.mal_id)||selected===m.mal_id?<CheckCircle2 size={22}/>:<span className="block rounded-full w-5 h-5 border-2 border-[var(--muted)]"/>}</span>
     </button>)}
    </div>}
   </div>
  </section>
  <section className="panel feature-panel p-4 sm:p-6 space-y-5">
   <div className="flex flex-col sm:flex-row gap-5">
    <div className="relative w-32 sm:w-40 aspect-[2/3] shrink-0 rounded-xl overflow-hidden border border-violet-500/40 mx-auto sm:mx-0">
     {poster?<Image unoptimized src={poster} alt="โปสเตอร์อนิเมะ" fill sizes="160px" className="object-cover"/>:<div className="poster-placeholder w-full h-full"><BookOpen size={42}/></div>}
    </div>
    <div className="flex-1 min-w-0 space-y-3">

     <label className="block text-xs font-semibold">ชื่ออนิเมะ *<input className="field mt-2" maxLength={200} placeholder="ชื่อเรื่องภาษาอังกฤษหรือญี่ปุ่น" {...register("title")}/></label>
     {errors.title&&<p className="text-red-400 text-xs">{errors.title.message}</p>}
     <label className="block text-xs font-semibold">ลิงก์สำหรับดูอนิเมะ (ถ้ามี)<input className="field mt-2" type="url" placeholder="https://..." {...register("watch_url")}/></label>
     {values.watch_url&&/^https?:\/\//.test(values.watch_url)&&<a className="text-violet-400 underline text-xs" href={values.watch_url} target="_blank" rel="noopener noreferrer">เปิดลิงก์ดูอนิเมะ</a>}
     {errors.watch_url&&<p className="text-red-400 text-xs">{errors.watch_url.message}</p>}
    </div>
   </div>
   <label className="block text-xs font-semibold">ลิงก์รูปโปสเตอร์<input className="field mt-2" type="url" placeholder="https://..." {...register("poster_url")}/></label>
   <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
    <label className="text-xs font-semibold">วันที่ออกฉาย<input className="field mt-2" type="date" {...register("aired_date")}/></label>
    <label className="text-xs font-semibold">จำนวนตอน<Controller control={control} name="episodes" render={({field})=><input className="field mt-2" type="number" min={0} value={field.value??""} onChange={e=>field.onChange(e.target.value===""?null:Number(e.target.value))}/>}/></label>
    <label className="text-xs font-semibold">วันที่ดูจบ *<input className="field mt-2" type="date" max={new Date().toISOString().slice(0,10)} {...register("finished_date")}/></label>
   </div>
   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><label className="text-xs font-semibold">ประเภทอนิเมะ<Controller control={control} name="anime_format" render={({field})=><select className="field mt-2" value={field.value??""} onChange={e=>field.onChange(e.target.value||null)}><option value="">ไม่ระบุ</option>{["TV","TV_SHORT","MOVIE","SPECIAL","OVA","ONA","MUSIC"].map(x=><option key={x} value={x}>{x}</option>)}</select>}/></label><label className="text-xs font-semibold">นาทีต่อตอน<Controller control={control} name="duration_minutes" render={({field})=><input className="field mt-2" type="number" min={1} max={600} value={field.value??""} onChange={e=>field.onChange(e.target.value===""?null:Number(e.target.value))}/>}/></label></div>
   {errors.finished_date&&<p role="alert" className="text-xs text-red-400">{errors.finished_date.message}</p>}
   {airedBeforeFinish&&<p className="text-amber-400 text-xs">คำเตือน: วันที่ดูจบเร็วกว่าวันที่ออกฉาย</p>}
   <div><label className="text-xs font-semibold" htmlFor="anime-genres">แนวอนิเมะ (คั่นด้วยเครื่องหมายจุลภาค)</label><input id="anime-genres" className="field mt-2" value={genreText} onChange={e=>{setGenreText(e.target.value);setValue("genres",e.target.value.split(",").map(s=>s.trim()).filter(Boolean))}} placeholder="Fantasy, Adventure, Drama"/><div className="flex flex-wrap gap-2 mt-3">{genres.map(g=><span className="tag" key={g}>{g}</span>)}</div></div>
   <div><p className="text-xs font-semibold mb-3">คะแนนของคุณ (1–10)</p><Controller name="rating" control={control} render={({field})=><div className="flex flex-wrap gap-1" role="group" aria-label="คะแนนอนิเมะ">
    {Array.from({length:10},(_,i)=>i+1).map(n=><button type="button" key={n} aria-label={n+" คะแนน"} aria-pressed={field.value===n} onClick={()=>field.onChange(n)} className={"p-1.5 rounded-lg transition-colors "+(n<=field.value?"":"muted hover:opacity-80")} style={n<=field.value?{color:ratingColor(n)}:undefined}><Star size={23} fill={n<=field.value?"currentColor":"none"}/></button>)}
    <strong className="ml-2 self-center" style={{color:ratingColor(field.value)}}>{field.value}/10</strong>
   </div>}/></div>
   <label className="block text-xs font-semibold">รีวิวสั้น ๆ (ไม่บังคับ)<textarea rows={5} maxLength={500} placeholder="เขียนความรู้สึกเกี่ยวกับอนิเมะเรื่องนี้..." className="field mt-2 resize-y" {...register("review")}/><span className="block muted text-right text-xs">{review.length}/500</span></label>


   <div className="flex flex-wrap justify-end gap-3 pt-3 border-t border-[var(--border)]"><Link className="btn" href="/">ยกเลิก</Link><button className="btn btn-primary min-w-36" disabled={saving} type="submit"><Save size={18}/>{saving?"กำลังบันทึก...":anime?"บันทึกการแก้ไข":"บันทึกอนิเมะ"}</button></div>
  </section>
 </form>;
}
