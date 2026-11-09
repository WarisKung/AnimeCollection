"use client";

import {useEffect,useMemo,useState} from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import {motion,useReducedMotion} from "motion/react";
import Image from "next/image";
import {useRouter} from "next/navigation";
import type {Anime} from "@/types/anime";
import {ratingColor} from "@/lib/rating-color";
import {genreTagStyle} from "@/lib/genre-color";

export default function FeaturedCarousel({anime,readonly=false,shareBase}:{anime:Anime[];readonly?:boolean;shareBase?:string}){
 const reducedMotion=useReducedMotion();
 const router=useRouter();
 const slides=useMemo(()=>[...anime].sort((a,b)=>b.finished_date.localeCompare(a.finished_date)),[anime]);

 // Embla requires enough slide width to support a true infinite loop.
 // Clones are visual only; clicking any clone opens the original anime record.
 const displaySlides=useMemo(()=>{
  if(slides.length===0)return [];
  if(slides.length>=8)return slides;
  return Array.from({length:Math.ceil(8/slides.length)},()=>slides).flat();
 },[slides]);

 // Start in the middle copy so previous and next posters are visible immediately.
 const initialSnap=slides.length>0&&displaySlides.length>slides.length
  ?Math.floor(displaySlides.length/slides.length/2)*slides.length
  :0;

 const autoplay=useMemo(()=>Autoplay({
  delay:4000,
  stopOnInteraction:false,
  stopOnMouseEnter:true,
  playOnInit:!reducedMotion&&slides.length>1,
 }),[reducedMotion,slides.length]);

 const [emblaRef,emblaApi]=useEmblaCarousel({
  loop:displaySlides.length>1,
  align:"center",
  containScroll:false,
  slidesToScroll:1,
  watchDrag:slides.length>1,
  startIndex:initialSnap,
 },[autoplay]);
 const [selected,setSelected]=useState(initialSnap);

 useEffect(()=>{
  if(!emblaApi)return;
  const update=()=>setSelected(emblaApi.selectedScrollSnap());
  emblaApi.on("select",update);
  emblaApi.on("reInit",update);
  update();
  return()=>{emblaApi.off("select",update);emblaApi.off("reInit",update)};
 },[emblaApi]);

 if(slides.length===0)return <div className="panel text-center py-16"><p className="muted">เพิ่มอนิเมะเพื่อแสดงในภาพสไลด์</p></div>;

 return <section
  role="region"
  aria-roledescription="carousel"
  aria-label="ภาพสไลด์อนิเมะ"
  tabIndex={0}
  className="relative -mx-[15px] sm:-mx-7 overflow-hidden bg-[#17132b] pt-3 pb-3 md:pt-5 md:pb-5 outline-offset-4"
  onKeyDown={e=>{
   if(e.key==="ArrowLeft"){e.preventDefault();emblaApi?.scrollPrev()}
   if(e.key==="ArrowRight"){e.preventDefault();emblaApi?.scrollNext()}
  }}
  onFocusCapture={()=>autoplay.stop()}
  onBlurCapture={e=>{
   if(!e.currentTarget.contains(e.relatedTarget as Node)&&!reducedMotion)autoplay.play();
  }}
 >
  {displaySlides[selected]?.poster_url&&<div className="absolute inset-0 pointer-events-none">
   <Image unoptimized src={displaySlides[selected].poster_url!} alt="" fill sizes="100vw" className="object-cover blur-3xl opacity-20 scale-125"/>
  </div>}
  <div ref={emblaRef} className="relative overflow-hidden">
   <div className="flex items-center touch-pan-y">
    {displaySlides.map((a,i)=>{
     const active=i===selected;
     return <motion.div
      key={a.id+"-"+i}
      aria-roledescription="slide"
      aria-label={`${a.title} (${i+1} จาก ${displaySlides.length})`}
      className="min-w-0 shrink-0 grow-0 basis-[78%] sm:basis-[55%] lg:basis-[43%] xl:basis-[36%] px-2 sm:px-3"
      animate={{scale:reducedMotion?1:active?1:.84,opacity:active?1:.68}}
      transition={{duration:reducedMotion?0:.4,ease:"easeOut"}}
     >
      <button
       type="button"
       aria-label={active?`ดูรายละเอียด ${a.title}`:`เลือก ${a.title}`}
       className="relative mx-auto block aspect-[2/3] w-full max-w-[460px] overflow-hidden rounded-2xl bg-[#282039] text-left shadow-2xl"
       onClick={()=>{
        if(!active){emblaApi?.scrollTo(i);return}
        if(readonly){if(shareBase)router.push(shareBase+"/anime/"+a.id)}
        else router.push("/anime/"+a.id);
       }}
      >
       {a.poster_url&&<Image unoptimized src={a.poster_url} alt={a.title} fill priority={i===0} sizes="(max-width:640px) 78vw, 460px" className="object-cover"/>}
       <div className="absolute inset-x-0 bottom-0 bg-black/75 p-4 pt-12 text-white">
        <h3 className="font-bold text-base sm:text-lg line-clamp-2">{a.title}</h3>
        <p className="text-sm text-violet-200">{a.aired_date?.slice(0,4)||"—"} · <span className="font-bold" style={{color:ratingColor(a.rating)}}>★ {a.rating}/10</span></p>
        <div className="mt-2 flex flex-wrap gap-1">
         {a.genres.slice(0,2).map(g=><span key={g} className="rounded-full border px-2 py-0.5 text-[10px]" style={genreTagStyle(g)}>{g}</span>)}
        </div>
       </div>
      </button>
     </motion.div>;
    })}
   </div>
  </div>
 </section>;
}
