import IntroSequence from "../components/home/IntroSequence"
import EducationSection from "../components/home/EducationSection"
import DomainBranches from "../components/home/DomainBranches"
import ProblemToDecision from "../components/home/ProblemToDecision"
import FeaturedProjects from "../components/home/FeaturedProjects"
import ClosingSection from "../components/home/ClosingSection"
import {
  getProfile,
  getEducation,
  getHomepageMedia,
  getDomainNodes,
  getFeaturedProjects
} from "../lib/queries"

// Re-fetch published content periodically rather than only at build time,
// so admin changes show up without a redeploy.
export const revalidate = 60

export default async function Home() {
  const [profile, education, media, domainNodes, featuredProjects] = await Promise.all([
    getProfile(),
    getEducation(),
    getHomepageMedia(),
    getDomainNodes(),
    getFeaturedProjects()
  ])

  return (
    <>
      <IntroSequence profile={profile} media={media} />
      <EducationSection education={education} />
      <DomainBranches domainNodes={domainNodes.primary} media={media} />
      <ProblemToDecision media={media} />
      <FeaturedProjects projects={featuredProjects} media={media} />
      <ClosingSection profile={profile} />
    </>
  )
}
