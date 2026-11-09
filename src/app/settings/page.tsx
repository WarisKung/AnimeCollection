import Navbar from "@/components/ui/Navbar";
import {requireOwner} from "@/lib/queries";
import ProfileSettings from "@/components/ui/ProfileSettings";
import DeleteAllAnime from "@/components/ui/DeleteAllAnime";
import PageBreadcrumb from "@/components/ui/PageBreadcrumb";

export default async function Settings(){
  const {sb,user}=await requireOwner();
  const {count:animeCount,error:countError}=await sb.from("anime").select("id",{count:"exact",head:true}).eq("owner_id",user.id);
  if(countError)throw new Error(countError.message);
  const profileName = typeof user.user_metadata?.display_name === "string" ? user.user_metadata.display_name : user.email?.split("@")[0] || "เจ้าของคลังอนิเมะ";
  const profileAvatar = typeof user.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : "";
  return <>
    <Navbar/>
    <main className="shell py-7 md:py-10">
      <PageBreadcrumb current="ตั้งค่า"/>
      <div className="page-heading"><div><h1 className="page-title">ตั้งค่า<span className="gradient-text">คลังอนิเมะ</span></h1><p className="page-subtitle">จัดการข้อมูลบัญชีและคลังอนิเมะของคุณ</p></div></div>
      <div className="max-w-3xl space-y-9">
        <section><ProfileSettings initialName={profileName} initialAvatar={profileAvatar} email={user.email||""}/></section>
        <DeleteAllAnime count={animeCount??0}/>
      </div>
    </main>
  </>;
}
