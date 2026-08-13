import NootLettersSection from "./components/NootLettersSection";
import CraftLinesSection from "./components/CraftLinesSection";
import MarketingScrollSection from "./components/MarketingScrollSection";
import CompaniesSection from "./components/CompaniesSection";
import WorksGallerySection from "./components/WorksGallerySection";
import TalkToUsSection from "./components/TalkToUsSection";
import SectionProgressNav from "./components/SectionProgressNav";
import ScrollCompanion from "./components/ScrollCompanion";

export default function Home() {
  return (
    <main className="flex min-h-full flex-col">
      <SectionProgressNav />
      <ScrollCompanion />
      <NootLettersSection />
      <CraftLinesSection />
      <MarketingScrollSection />
      <CompaniesSection />
      <WorksGallerySection />
      <TalkToUsSection />
    </main>
  );
}
