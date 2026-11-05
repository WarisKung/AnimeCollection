import {z} from "zod";
export const animeSchema=z.object({
 title:z.string().trim().min(1).max(200),
 title_th:z.string().optional(),
 mal_id:z.number().int().positive().nullable(),
 poster_url:z.string().optional(),
 aired_date:z.string().optional(),
 episodes:z.number().int().min(0).nullable(),
 duration_minutes:z.number().int().min(1).max(600).nullable(),
 anime_format:z.string().max(32).nullable(),
 watch_url:z.union([z.url().refine(v=>/^https?:\/\//i.test(v)),z.literal("")]).optional(),
 genres:z.array(z.string()).transform(v=>[...new Set(v.map(s=>s.trim()).filter(Boolean))]),
 finished_date:z.iso.date(),
 rating:z.number().int().min(1).max(10),
 review:z.string().max(500),
 is_featured:z.boolean()
}).superRefine((v,ctx)=>{
 const now=new Date().toISOString().slice(0,10);
 if(v.finished_date>now)ctx.addIssue({code:"custom",path:["finished_date"],message:"Finished date cannot be in the future"});
});
export type AnimeInput=z.input<typeof animeSchema>;
