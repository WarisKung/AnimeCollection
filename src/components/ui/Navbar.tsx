"use client";
import Link from "next/link";
import Image from "next/image";
import {usePathname,useRouter} from "next/navigation";
import {useEffect,useState} from "react";
import {BookOpen,House,PlusCircle,Settings,LogOut,Menu,ChartNoAxesColumn,PanelLeftClose,PanelLeftOpen} from "lucide-react";
import BrandLogo from "@/components/ui/BrandLogo";
import {supabaseBrowser} from "@/lib/supabase/client";

const entries=[
 {href:"/",label:"หน้าหลัก",icon:House},
 {href:"/anime/new",label:"เพิ่มอนิเมะ",icon:PlusCircle},
 {href:"/statistics",label:"สถิติ",icon:ChartNoAxesColumn},
 {href:"/settings",label:"ตั้งค่า",icon:Settings},
];

export default function Navbar({readonly=false,shareBase}:{readonly?:boolean;shareBase?:string}){
 const pathname=usePathname();
 const router=useRouter();
 const [open,setOpen]=useState(false);
 const [collapsed,setCollapsed]=useState(false);
 useEffect(()=>{
  const timer=window.setTimeout(()=>{
   setCollapsed(localStorage.getItem("anime-sidebar-collapsed")==="true");
  },0);
  return()=>window.clearTimeout(timer);
 },[]);
 function toggleDesktopSidebar(){
  const next=!collapsed;
  localStorage.setItem("anime-sidebar-collapsed",String(next));
  setCollapsed(next);
 }
 const [profile,setProfile]=useState({name:"เจ้าของคลังอนิเมะ",avatar:""});
 useEffect(()=>{
  let active=true;
  async function load(){
   const {data:{user}}=await supabaseBrowser().auth.getUser();
   if(!user||!active)return;
   const name=user.user_metadata?.display_name;
   const avatar=user.user_metadata?.avatar_url;
   setProfile({name:typeof name==="string"&&name.trim()?name:user.email?.split("@")[0]||"เจ้าของคลังอนิเมะ",avatar:typeof avatar==="string"?avatar:""});
  }
  void load();
  window.addEventListener("anime-profile-updated",load);
  return()=>{active=false;window.removeEventListener("anime-profile-updated",load)};
 },[]);
 async function logout(){await supabaseBrowser().auth.signOut();router.replace("/login");router.refresh()}
 const brand=<BrandLogo/>;
 if(readonly){
  const libraryHref=shareBase||"/";
  const statsHref=shareBase?shareBase+"/statistics":"/statistics";
  const tabs=[
   {href:libraryHref,label:"คลังอนิเมะ",icon:BookOpen},
   {href:statsHref,label:"สถิติ",icon:ChartNoAxesColumn},
  ];
  return <header className="public-nav flex-wrap">
   <Link href={libraryHref} className="shrink-0">{brand}</Link>
   <nav aria-label="เมนูคลังอนิเมะที่แชร์" className="flex w-full sm:w-auto items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--panel-raised)] p-1">
    {tabs.map(({href,label,icon:Icon})=>{
     const selected=href===statsHref?pathname===statsHref:pathname!==statsHref;
     return <Link
      key={href}
      href={href}
      aria-current={selected?"page":undefined}
      className={"flex flex-1 sm:flex-none items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors "+(selected?"bg-violet-600 text-white shadow-sm":"text-[var(--muted)] hover:bg-[var(--panel)] hover:text-[var(--foreground)]")}
     ><Icon size={17}/>{label}</Link>;
    })}
   </nav>
  </header>;
 }
 return <>
  {!open&&<button type="button" className="mobile-menu-button" aria-label="เปิดเมนู" aria-expanded={false} onClick={()=>setOpen(true)}><Menu size={22}/></button>}
  {open&&<button type="button" className="sidebar-backdrop open" aria-label="ปิดเมนู" onClick={()=>setOpen(false)}/>}
  {collapsed&&<button type="button" className="desktop-sidebar-reopen" aria-label="แสดงแถบเมนูด้านซ้าย" title="แสดงเมนู" onClick={toggleDesktopSidebar}><PanelLeftOpen size={21}/></button>}
  <aside className={"app-sidebar "+(open?"open ":"")+(collapsed?"is-collapsed":"")} aria-label="เมนูหลัก">
   <Link href="/" className="sidebar-brand" onClick={()=>setOpen(false)}>{brand}</Link>
   <div className="sidebar-menu-heading"><p className="sidebar-section-label">MENU</p><button type="button" className="sidebar-collapse-toggle" onClick={()=>{if(window.matchMedia("(max-width: 1023px)").matches){setOpen(false)}else{toggleDesktopSidebar()}}} aria-label="ซ่อนแถบเมนูด้านซ้าย" title="ซ่อนเมนู"><PanelLeftClose size={19}/></button></div>
   <nav className="sidebar-links">
    {entries.map(({href,label,icon:Icon})=><Link key={href} href={href} onClick={()=>setOpen(false)} className={"sidebar-link "+(pathname===href?"active":"")}><Icon size={20}/><span>{label}</span></Link>)}
   </nav>
   <div className="sidebar-art" aria-hidden="true"/>
   <div className="sidebar-bottom">
    <Link href="/settings" className="sidebar-user" onClick={()=>setOpen(false)}><span className="user-avatar">{profile.avatar&&/^https?:\/\//.test(profile.avatar)?<Image unoptimized src={profile.avatar} alt="รูปโปรไฟล์" fill sizes="43px" className="object-cover rounded-full"/>:<BookOpen size={20}/>}</span><span className="min-w-0"><strong className="truncate">{profile.name}</strong><small>โปรไฟล์ของฉัน</small></span></Link>
    <button className="sidebar-link sidebar-logout" onClick={logout}><LogOut size={19}/><span>ออกจากระบบ</span></button>
   </div>
  </aside>
 </>;
}
