import type {Metadata} from "next";
import {notFound} from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import LibraryView from "@/components/library/LibraryView";
import FeaturedCarousel from "@/components/carousel/FeaturedCarousel";
import {getPublicLibrary} from "@/lib/queries";

export const dynamic="force-dynamic";

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params;
 const library=await getPublicLibrary(slug);
 return {
  title:library?.display_name||"คลังอนิเมะที่ดูแล้ว",
  robots:{index:false,follow:false},
 };
}

export default async function SharedLibrary({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 const library=await getPublicLibrary(slug);
 if(!library)notFound();

 const shareBase="/share/"+encodeURIComponent(slug);

 return <>
  <Navbar readonly shareBase={shareBase}/>
  <main className="shell py-7 md:py-10 space-y-10">
   <div className="page-heading !mb-0">
    <div>
     <h1 className="page-title">{library.display_name||"คลังอนิเมะ"}<span className="gradient-text">ที่ดูแล้ว</span></h1>
     <p className="page-subtitle">คลังอนิเมะที่แบ่งปันให้เข้าชม · อ่านอย่างเดียว</p>
    </div>
   </div>
   <FeaturedCarousel anime={library.anime} readonly shareBase={shareBase}/>
   <div id="my-library"><LibraryView anime={library.anime} readonly shareBase={shareBase}/></div>
  </main>
 </>;
}
