import IntroSequence from "../components/home/IntroSequence"
import EducationSection from "../components/home/EducationSection"
import DomainBranches from "../components/home/DomainBranches"
import ProblemToDecision from "../components/home/ProblemToDecision"
import FeaturedProjects from "../components/home/FeaturedProjects"
import ClosingSection from "../components/home/ClosingSection"

export default function Home() {
  return (
    <>
      <IntroSequence />
      <EducationSection />
      <DomainBranches />
      <ProblemToDecision />
      <FeaturedProjects />
      <ClosingSection />
    </>
  )
}
