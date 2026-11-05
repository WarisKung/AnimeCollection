import Navbar from "@/components/ui/Navbar";
import StatsDashboard from "@/components/statistics/StatsDashboard";
import {getOwnerAnime} from "@/lib/queries";
export const dynamic="force-dynamic";
export default async function StatisticsPage(){
 const anime=await getOwnerAnime();
 return <><Navbar/><main className="shell py-7 md:py-10"><StatsDashboard anime={anime}/></main></>;
}
