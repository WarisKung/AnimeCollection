import {supabaseServer} from "@/lib/supabase/server";
import type {Anime} from "@/types/anime";
import {redirect} from "next/navigation";
export async function requireOwner(){
const sb=await supabaseServer();const {data:{user}}=await sb.auth.getUser();
if(!user)redirect("/login");return {sb,user};
}
export async function getOwnerAnime(){const {sb,user}=await requireOwner();const {data,error}=await sb.from("anime").select("*").eq("owner_id",user.id).order("finished_date",{ascending:false});if(error)throw new Error(error.message);return (data??[]) as Anime[];}
export async function getPublicLibrary(slug:string){const sb=await supabaseServer();const {data,error}=await sb.rpc("get_shared_library",{p_slug:slug});if(error||!data)return null;return data as {display_name:string|null;anime:Anime[]};}
