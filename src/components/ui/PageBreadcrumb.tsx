import Link from "next/link";
import {House, ChevronRight} from "lucide-react";

export default function PageBreadcrumb({current}:{current:string}){
 return <nav aria-label="เส้นทางหน้าเว็บ" className="mb-5 flex items-center gap-2 text-xs muted">
  <Link href="/" aria-label="หน้าหลัก" className="rounded-md p-1 transition-colors hover:text-violet-300 focus-visible:text-violet-300"><House size={16}/></Link>
  <ChevronRight size={14} aria-hidden="true"/>
  <span aria-current="page">{current}</span>
 </nav>;
}
