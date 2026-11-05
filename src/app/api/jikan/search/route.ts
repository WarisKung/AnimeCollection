import {NextRequest,NextResponse} from "next/server";
import {jikanGet} from "@/lib/jikan";
import {supabaseServer} from "@/lib/supabase/server";
export async function GET(req:NextRequest){
const sb=await supabaseServer();const {data:{user}}=await sb.auth.getUser();
if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
const id=req.nextUrl.searchParams.get("id");const q=req.nextUrl.searchParams.get("q")?.trim();
if(!id&&(!q||q.length<2))return NextResponse.json({data:[]});
try{const path=id?"/anime/"+encodeURIComponent(id):"/anime?q="+encodeURIComponent(q!)+"&limit=10&sfw=true";return NextResponse.json(await jikanGet(path));}
catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Anime catalog unavailable"},{status:503});}
}
