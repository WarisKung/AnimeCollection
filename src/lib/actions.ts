"use server";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {requireOwner} from "@/lib/queries";
import {animeSchema,type AnimeInput} from "@/lib/validation";
import {nanoid} from "nanoid";

export type ActionResult={ok:boolean;message?:string;id?:string};

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

export async function updateSharing(is_public:boolean,regenerate=false):Promise<ActionResult>{
 const {sb,user}=await requireOwner();
 const {data:old}=await sb.from("library_settings").select("share_slug").eq("owner_id",user.id).maybeSingle();
 const {error}=await sb.from("library_settings").upsert({owner_id:user.id,is_public,share_slug:regenerate||!old?.share_slug?nanoid(18):old.share_slug});
 if(error)return {ok:false,message:error.message};
 revalidatePath("/settings");
 return {ok:true};
}
