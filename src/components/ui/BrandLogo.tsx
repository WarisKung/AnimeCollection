import {BookOpen,Sparkles} from "lucide-react";

// Shared branding: keeps login logo identical to the navbar.
export default function BrandLogo(){
 return <span className="brand-mark">
  <span className="brand-icon"><BookOpen size={31}/><Sparkles size={13} className="brand-sparkle"/></span>
  <span className="brand-text">ANIME<span>COMPLETED LIBRARY</span></span>
 </span>;
}
