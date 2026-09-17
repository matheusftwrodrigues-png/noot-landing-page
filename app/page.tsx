import IntroLoader from "./components/IntroLoader";
import CustomCursor from "./components/CustomCursor";
import HeroSection from "./components/HeroSection";
import CraftSection from "./components/CraftSection";
import SiteHeader from "./components/SiteHeader";
import MarketingScrollSection from "./components/MarketingScrollSection";
import ElasticPlanSection from "./components/ElasticPlanSection";
import CompaniesSection from "./components/CompaniesSection";
import WorksMarqueeSection from "./components/WorksMarqueeSection";
import TalkToUsSection from "./components/TalkToUsSection";
import ScrollCompanion from "./components/ScrollCompanion";

export default function Home() {
  return (
    <main className="flex min-h-full flex-col">
      <IntroLoader />
      <CustomCursor />
      <SiteHeader />
      <ScrollCompanion />
      <HeroSection />
      <CraftSection />
      <ElasticPlanSection />
      <MarketingScrollSection />
      <CompaniesSection />
      <WorksMarqueeSection />
      <TalkToUsSection />
    </main>
  );
}
