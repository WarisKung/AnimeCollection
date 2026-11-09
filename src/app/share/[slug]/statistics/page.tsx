import type {Metadata} from "next";
import {notFound} from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import StatsDashboard from "@/components/statistics/StatsDashboard";
import {getPublicLibrary} from "@/lib/queries";

export const dynamic="force-dynamic";
export const metadata:Metadata={
 title:"สถิติการดูอนิเมะ",
 robots:{index:false,follow:false},
};

export default async function SharedStatistics({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 const library=await getPublicLibrary(slug);
 if(!library)notFound();

 const shareBase="/share/"+encodeURIComponent(slug);

 return <>
  <Navbar readonly shareBase={shareBase}/>
  <main className="shell py-7 md:py-10">
   <StatsDashboard anime={library.anime}/>
  </main>
 </>;
}
