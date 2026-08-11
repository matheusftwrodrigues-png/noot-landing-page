import NootLettersSection from "./components/NootLettersSection";
import MarketingScrollSection from "./components/MarketingScrollSection";
import CompaniesSection from "./components/CompaniesSection";
import TalkToUsSection from "./components/TalkToUsSection";
import SectionProgressNav from "./components/SectionProgressNav";
import ScrollCompanion from "./components/ScrollCompanion";

export default function Home() {
  return (
    <main className="flex min-h-full flex-col">
      <SectionProgressNav />
      <ScrollCompanion />
      <NootLettersSection />
      <MarketingScrollSection />
      <CompaniesSection />
      <TalkToUsSection />
    </main>
  );
}
