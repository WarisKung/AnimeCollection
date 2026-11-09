import Navbar from "@/components/ui/Navbar";
import StatsDashboard from "@/components/statistics/StatsDashboard";
import PageBreadcrumb from "@/components/ui/PageBreadcrumb";
import {getOwnerAnime} from "@/lib/queries";
export const dynamic="force-dynamic";
export default async function StatisticsPage(){
 const anime=await getOwnerAnime();
 return <><Navbar/><main className="shell py-7 md:py-10"><PageBreadcrumb current="สถิติ"/><StatsDashboard anime={anime}/></main></>;
}
