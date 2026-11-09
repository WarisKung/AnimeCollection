// Generate a stable URL path from the owner's displayed name.
export function shareSlugFromDisplayName(displayName:string):string{
 const normalized=displayName.normalize("NFKC").trim().toLowerCase();
 const candidate=normalized
  .replace(/[^\p{L}\p{N}]+/gu,"-")
  .replace(/^-+|-+$/g,"");
 const limited=Array.from(candidate).slice(0,48).join("").replace(/-+$/g,"");
 return limited||"anime-library";
}
