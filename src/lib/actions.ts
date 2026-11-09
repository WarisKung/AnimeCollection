"use server";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {requireOwner} from "@/lib/queries";
import {animeSchema,type AnimeInput} from "@/lib/validation";
import {nanoid} from "nanoid";
import {shareSlugFromDisplayName} from "@/lib/share-slug";

export type ActionResult={ok:boolean;message?:string;id?:string;share_slug?:string};

export async function saveAnime(input:AnimeInput,id?:string):Promise<ActionResult>{
 const valid=animeSchema.safeParse(input);
 if(!valid.success)return {ok:false,message:valid.error.issues[0]?.message??"ข้อมูลไม่ถูกต้อง"};
 const {sb,user}=await requireOwner();
 const d=valid.data;
 if(d.mal_id){
  let q=sb.from("anime").select("id").eq("owner_id",user.id).eq("mal_id",d.mal_id);
  if(id)q=q.neq("id",id);
  const {data:existing,error:checkError}=await q.maybeSingle();
  if(checkError)return {ok:false,message:checkError.message};
  if(existing)return {ok:false,message:"อนิเมะเรื่องนี้อยู่ในคลังแล้ว"};
 }
 const payload={
  ...d,
  owner_id:user.id,
  title_th:null,
  is_featured:true,
  poster_url:d.poster_url||null,
  aired_date:d.aired_date||null,
  watch_url:d.watch_url||null,
  review:d.review||null,
  updated_at:new Date().toISOString()
 };
 const save=async (record:Record<string,unknown>)=>id
  ?sb.from("anime").update(record).eq("id",id).eq("owner_id",user.id).select("id").single()
  :sb.from("anime").insert(record).select("id").single();

 let result=await save(payload);
 let note: string|undefined;
 // Support an older database schema while the owner has not yet run migration 002.
 // Do not silently report the extra fields as persisted.
 if(result.error && (result.error.code==="PGRST204"||result.error.code==="42703") &&
    /(?:anime_format|duration_minutes|watch_url)/i.test(result.error.message)){
  const {anime_format:_format,duration_minutes:_duration,watch_url:_url,...legacy}=payload;
  void _format;void _duration;void _url;
  result=await save(legacy);
  if(!result.error)note="บันทึกอนิเมะแล้ว แต่ฐานข้อมูลยังไม่มีคอลัมน์ใหม่ จึงยังไม่บันทึกประเภท ความยาว และลิงก์ดูอนิเมะ กรุณารัน SQL Migration 202611040002_features.sql";
 }
 if(result.error)return {ok:false,message:result.error.message};
 revalidatePath("/");
 revalidatePath("/statistics");
 return {ok:true,id:result.data.id,message:note};
}

export async function deleteAnime(id:string){
 const {sb,user}=await requireOwner();
 const {error}=await sb.from("anime").delete().eq("id",id).eq("owner_id",user.id);
 if(error)throw Error(error.message);
 revalidatePath("/");
 revalidatePath("/statistics");
 redirect("/");
}
export async function deleteAllAnime(confirmation:string):Promise<ActionResult>{
 if(confirmation!=="ลบทั้งหมด")return {ok:false,message:"ยืนยันการลบไม่ถูกต้อง"};
 const {sb,user}=await requireOwner();
 // Scope the destructive operation strictly to the authenticated account.
 const {error}=await sb.from("anime").delete().eq("owner_id",user.id);
 if(error)return {ok:false,message:error.message};
 revalidatePath("/");
 revalidatePath("/statistics");
 revalidatePath("/settings");
 return {ok:true};
}

// The share link is always public and tracks the authenticated owner's displayed name.
export async function syncShareLink():Promise<ActionResult>{
 const {sb,user}=await requireOwner();
 const profileName=typeof user.user_metadata?.display_name==="string"&&user.user_metadata.display_name.trim()
  ?user.user_metadata.display_name.trim()
  :user.email?.split("@")[0]||"anime-library";
 const displayName=profileName.slice(0,80);
 const base=shareSlugFromDisplayName(displayName);

 const {data:old,error:readError}=await sb.from("library_settings")
  .select("share_slug,display_name,is_public")
  .eq("owner_id",user.id).maybeSingle();
 if(readError)return {ok:false,message:readError.message};

 // Preserve an existing named link when the display name has not changed.
 if(old?.is_public&&old.display_name===displayName&&
    (old.share_slug===base||old.share_slug.startsWith(base+"-"))){
  return {ok:true,share_slug:old.share_slug};
 }

 // The database's unique constraint is authoritative; another user may have the same name.
 for(let attempt=0;attempt<5;attempt++){
  const share_slug=attempt===0?base:base+"-"+nanoid(6).toLowerCase();
  const {error}=await sb.from("library_settings").upsert({
   owner_id:user.id,is_public:true,share_slug,display_name:displayName
  });
  if(!error){
   revalidatePath("/settings");
   return {ok:true,share_slug};
  }
  if(error.code!=="23505")return {ok:false,message:error.message};
 }
 return {ok:false,message:"ชื่อสำหรับแชร์ซ้ำกับบัญชีอื่น กรุณาลองอีกครั้ง"};
}

// Called only after the account owner explicitly confirms deletion.
// Password verification, avatar cleanup, and the owner-scoped RPC run on the server.
export async function deleteMyAccount(confirmation:string,password:string):Promise<ActionResult>{
 if(confirmation!=="ลบบัญชี")return {ok:false,message:"กรุณาพิมพ์ ลบบัญชี เพื่อยืนยัน"};
 if(!password)return {ok:false,message:"กรุณากรอกรหัสผ่านปัจจุบัน"};

 const {sb,user}=await requireOwner();
 if(!user.email)return {ok:false,message:"บัญชีนี้ไม่มีอีเมลสำหรับยืนยันตัวตน"};

 const {data:verified,error:passwordError}=await sb.auth.signInWithPassword({
  email:user.email,
  password
 });
 if(passwordError||verified.user?.id!==user.id){
  return {ok:false,message:"รหัสผ่านปัจจุบันไม่ถูกต้อง"};
 }

 // Delete user-owned files through Storage API before removing the auth account.
 for(let batch=0;batch<100;batch++){
  const {data:files,error:listError}=await sb.storage.from("avatars").list(user.id,{limit:100});
  if(listError){
   if(/bucket not found/i.test(listError.message))break;
   return {ok:false,message:"ไม่สามารถตรวจสอบรูปโปรไฟล์ได้: "+listError.message};
  }
  if(!files?.length)break;
  const paths=files.filter(f=>f.id&&f.name).map(f=>user.id+"/"+f.name);
  if(!paths.length)break;
  const {error:removeError}=await sb.storage.from("avatars").remove(paths);
  if(removeError)return {ok:false,message:"ไม่สามารถลบรูปโปรไฟล์ได้: "+removeError.message};
  if(batch===99)return {ok:false,message:"รูปโปรไฟล์มีจำนวนมากเกินไป กรุณาติดต่อผู้ดูแลระบบ"};
 }

 // The database function uses auth.uid(), never a caller-supplied user ID.
 const {error}=await sb.rpc("delete_my_account");
 if(error){
  if(error.code==="PGRST202"||error.code==="42883")
   return {ok:false,message:"ยังไม่ได้ติดตั้งฟังก์ชันลบบัญชี กรุณารัน SQL Migration 202611090005_delete_account.sql ใน Supabase"};
  return {ok:false,message:"ไม่สามารถลบบัญชีได้: "+error.message};
 }
 revalidatePath("/");
 revalidatePath("/settings");
 return {ok:true};
}
