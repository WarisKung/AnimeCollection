import type {Metadata} from "next";
import {Toaster} from "sonner";
import "./globals.css";
export const metadata:Metadata={title:"Anime Completed Library",description:"My completed anime collection"};
export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="th" className="dark"><body><Toaster richColors position="top-right"/>{children}</body></html>;
}
