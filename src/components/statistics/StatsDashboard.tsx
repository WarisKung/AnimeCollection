"use client";
import {useMemo,useState} from "react";
import type {Anime} from "@/types/anime";
import {ratingColor} from "@/lib/rating-color";
import {genreColor} from "@/lib/genre-color";
import {ChartColumn,ChartPie,CheckSquare,Clock3,Film,Star,CalendarDays} from "lucide-react";

const shades=["#8b5cf6","#ed4eaa","#b96adb","#6251af","#5b7bce","#9a76e8","#48518f","#d06db0"];
type Stats={count:number;episodes:number;minutes:number;known:number;average:number;year:[string,number][];genres:[string,number][];ratings:{rating:number;count:number}[]};
function calculate(items:Anime[]):Stats{
 const count=items.length;
 const episodes=items.reduce((s,a)=>s+(a.episodes??0),0);
 const timed=items.filter(a=>a.episodes!=null&&a.duration_minutes!=null);
 const minutes=timed.reduce((s,a)=>s+(a.episodes??0)*(a.duration_minutes??0),0);
 const average=count?items.reduce((s,a)=>s+a.rating,0)/count:0;
 const years=new Map<string,number>(),genres=new Map<string,number>();
 for(const a of items){
  const y=a.finished_date.slice(0,4);years.set(y,(years.get(y)??0)+1);
  for(const g of a.genres){genres.set(g,(genres.get(g)??0)+1)}
 }
 return {count,episodes,minutes,known:timed.length,average,
 year:[...years].sort(([a],[b])=>a.localeCompare(b)),
 genres:[...genres].sort((a,b)=>b[1]-a[1]),
 ratings:Array.from({length:10},(_,i)=>({rating:i+1,count:items.filter(a=>a.rating===i+1).length}))};
}
function Tile({label,value,unit,icon:Icon,note,color,iconColor}:{label:string;value:string;unit:string;icon:typeof Star;note?:string;color?:string;iconColor?:string}){
 return <div className="panel feature-panel px-5 py-6 min-h-40">
  <div className="flex items-center gap-3"><span className="size-11 rounded-full grid place-items-center" style={{color:iconColor??color??"#a78bfa",backgroundColor:"color-mix(in srgb, "+(iconColor??color??"#a78bfa")+" 18%, transparent)"}}><Icon size={22}/></span><h2 className="font-bold text-sm">{label}</h2></div>
  <p className="mt-4 text-4xl font-extrabold tracking-tight" style={color?{color}:undefined}>{value}<span className="text-sm font-normal muted ml-2">{unit}</span></p>
  {note&&<p className="muted text-xs mt-2">{note}</p>}
 </div>;
}
function Bars({data}:{data:{name:string;count:number;color?:string}[]}){
 const max=Math.max(1,...data.map(d=>d.count));
 return <div className="flex gap-2 items-end h-72 pt-7 overflow-x-auto max-w-full w-full" role="img" aria-label={data.map(d=>d.name+": "+d.count).join(", ")}>
 {data.map((d,i)=><div key={d.name} className="flex-1 min-w-8 h-full flex flex-col justify-end items-center gap-2">
  <span className="text-xs font-bold">{d.count}</span>
  <div className="w-full max-w-14 rounded-t-md" style={{height:Math.max(d.count?4:1,(d.count/max)*235),background:d.color||shades[i%shades.length]}}/>
  <span className="muted text-xs text-center whitespace-nowrap">{d.name}</span>
 </div>)}
 </div>;
}
function Donut({data,total}:{data:[string,number][];total:number}){
 const radius=67,circ=2*Math.PI*radius;
 return <div className="flex flex-col 2xl:flex-row items-center gap-5 min-w-0">
 <div className="relative shrink-0 size-52">
 <svg viewBox="0 0 190 190" role="img" aria-label="แผนภูมิวงแหวนแสดงแนวอนิเมะ" className="-rotate-90 size-full">
 <circle cx="95" cy="95" r={radius} fill="none" stroke="#30304f" strokeWidth="29"/>
 {data.map(([name,value],i)=>{const offset=data.slice(0,i).reduce((s,[,n])=>s+n,0);return <circle key={name} cx="95" cy="95" r={radius} fill="none" stroke={genreColor(name)} strokeWidth="29" strokeDasharray={`${(value/total)*circ} ${circ}`} strokeDashoffset={-(offset/total)*circ}/>})}
 </svg>
 <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="muted text-xs">รายการแนว</span><b className="text-3xl">{total}</b></div>
 </div>
 <div className="flex-1 w-full min-w-0 space-y-2">{data.map(([name,value])=><div key={name} className="flex items-center justify-between text-sm gap-3"><span className="flex items-center gap-2 min-w-0"><i className="size-3 rounded-full shrink-0" style={{background:genreColor(name)}}/><span className="truncate" style={{color:genreColor(name)}}>{name}</span></span><span className="whitespace-nowrap text-xs sm:text-sm shrink-0" style={{color:genreColor(name)}}>{value} ({Math.round(value/total*100)}%)</span></div>)}</div>
 </div>;
}
export default function StatsDashboard({anime}:{anime:Anime[]}){
 const [period,setPeriod]=useState("all");
 const filtered=useMemo(()=>period==="all"?anime:anime.filter(a=>a.finished_date.startsWith(period)),[anime,period]);
 const s=useMemo(()=>calculate(filtered),[filtered]);
 const years=[...new Set(anime.map(a=>a.finished_date.slice(0,4)))].sort().reverse();
 const maxGenre=s.genres.slice(0,7);const genreTotal=maxGenre.reduce((n,[,v])=>n+v,0);
 const highRating=s.ratings.reduce((best,a)=>a.count>best.count?a:best,{rating:0,count:0});
 const yearAverage=s.year.length?s.count/s.year.length:0;
 const overviewColor=s.count?ratingColor(s.average):"#a78bfa";
 const latestYear=s.year.at(-1);
 const previousYear=s.year.at(-2);
 const yearTrend=latestYear&&previousYear?(latestYear[1]>previousYear[1]?"เพิ่มขึ้น":latestYear[1]<previousYear[1]?"ลดลง":"คงที่"):"ยังไม่มีข้อมูลเปรียบเทียบ";
 return <section className="space-y-6">
  <div className="page-heading"><div><h1 className="page-title">สถิติ<span className="gradient-text">การดูอนิเมะ</span></h1><p className="page-subtitle">คำนวณจากรายการที่บันทึกไว้</p></div>
  <label className="inline-flex gap-2 items-center text-sm"><CalendarDays size={18} className="text-sky-400"/><select className="field" aria-label="ช่วงเวลาสถิติ" value={period} onChange={e=>setPeriod(e.target.value)}><option value="all">ตลอดเวลา</option>{years.map(y=><option value={y} key={y}>{y}</option>)}</select></label></div>
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
   <Tile label="ดูจบทั้งหมด" icon={CheckSquare} iconColor="#34d399" color={overviewColor} value={s.count.toLocaleString("th-TH")} unit="เรื่อง"/>
   <Tile label="จำนวนตอนทั้งหมด" icon={Film} iconColor="#60a5fa" color={overviewColor} value={s.episodes.toLocaleString("th-TH")} unit="ตอน"/>
   <Tile label="ชั่วโมงที่รับชม" icon={Clock3} iconColor="#fbbf24" color={overviewColor} value={s.known?(s.minutes/60).toLocaleString("th-TH",{maximumFractionDigits:1}):"—"} unit="ชั่วโมง"/>
   <Tile label="คะแนนเฉลี่ย" icon={Star} iconColor={overviewColor} value={s.count?s.average.toFixed(2):"—"} unit="จาก 10" color={overviewColor}/>
  </div>
  <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
   <article className="panel feature-panel p-5 min-w-0 overflow-hidden flex flex-col min-h-[460px]"><h2 className="font-extrabold flex items-center gap-2 flex-wrap"><span className="grid size-9 shrink-0 place-items-center rounded-xl border border-sky-400/25 bg-sky-400/15 text-sky-400"><ChartColumn size={20}/></span> จำนวนอนิเมะที่ดูจบต่อปี</h2>
    <div className="flex-1 flex items-center justify-center min-h-[300px]">{s.year.length?<Bars data={s.year.map(([name,count])=>({name,count}))}/>:<p className="muted text-sm text-center">ยังไม่มีข้อมูล</p>}</div>
    <p className="text-base font-bold border-t border-[var(--border)] mt-auto pt-4 leading-relaxed break-words">แนวโน้ม: {yearTrend} · เฉลี่ย <span style={{color:shades[0]}}>{yearAverage.toFixed(1)}</span> เรื่องต่อปี</p>
   </article>
   <article className="panel feature-panel p-5 min-w-0 overflow-hidden flex flex-col min-h-[460px]"><h2 className="font-extrabold flex items-center gap-2 flex-wrap"><span className="grid size-9 shrink-0 place-items-center rounded-xl border border-pink-400/25 bg-pink-400/15 text-pink-400"><ChartPie size={20}/></span> แนวอนิเมะยอดนิยม</h2>
    <div className="flex-1 flex items-center justify-center min-h-[300px] py-4 w-full">{genreTotal?<Donut data={maxGenre} total={genreTotal}/>:<p className="muted text-sm text-center">ยังไม่มีข้อมูลแนวอนิเมะ</p>}</div>
    <p className="text-base font-bold border-t border-[var(--border)] mt-auto pt-4 leading-relaxed break-words">{s.genres[0]?<>แนวที่พบมากที่สุด: <span style={{color:genreColor(s.genres[0][0])}}>{s.genres[0][0]} {s.genres[0][1]}</span> เรื่อง ({s.count?Math.round(s.genres[0][1]/s.count*100):0}%)</>:"ยังไม่มีข้อมูลแนวอนิเมะ"}</p>
   </article>
   <article className="panel feature-panel p-5 min-w-0 overflow-hidden xl:col-span-2"><h2 className="font-extrabold flex items-center gap-2 flex-wrap"><Star size={20} style={{color:highRating.count?ratingColor(highRating.rating):undefined}}/> การกระจายคะแนน (1–10)</h2>
    <Bars data={s.ratings.map(({rating,count})=>({name:String(rating),count,color:ratingColor(rating)}))}/>
    <p className="text-base font-bold border-t border-[var(--border)] mt-auto pt-4 leading-relaxed break-words">{highRating.count?<>คะแนนที่พบมากที่สุด: <span style={{color:ratingColor(highRating.rating)}}>{highRating.rating}/10</span> ({highRating.count} เรื่อง)</>:"ยังไม่มีคะแนน"}</p>
   </article>
  </div>
 </section>;
}
