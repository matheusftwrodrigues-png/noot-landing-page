import NootLettersSection from "./components/NootLettersSection";
import MarketingScrollSection from "./components/MarketingScrollSection";
import CompaniesSection from "./components/CompaniesSection";
import TalkToUsSection from "./components/TalkToUsSection";
import SectionProgressNav from "./components/SectionProgressNav";

export default function Home() {
  return (
    <main className="flex min-h-full flex-col">
      <SectionProgressNav />
      <NootLettersSection />
      <MarketingScrollSection />
      <CompaniesSection />
      <TalkToUsSection />
    </main>
  );
}
