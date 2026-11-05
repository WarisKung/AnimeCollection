import Navbar from "@/components/ui/Navbar";
import LibraryView from "@/components/library/LibraryView";
import FeaturedCarousel from "@/components/carousel/FeaturedCarousel";
import { getOwnerAnime } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function Home() {
  const anime = await getOwnerAnime();
  return <>
    <Navbar />
    <main className="shell py-7 md:py-10 space-y-10">
      <FeaturedCarousel anime={anime}/>
      <div id="my-library"><LibraryView anime={anime}/></div>
    </main>
  </>;
}
