import type { NavbarNavigation, NavLeafItem } from "@/components/navbar/navbar.types"

const productGroups = {
  starterkits: [
    {
      title: "Portfolio Launch",
      description: "Guided templates for designers, developers, and freelancers.",
      href: "/dashboard/create",
    },
    {
      title: "Resume Import",
      description: "Turn your resume into sections and project highlights in minutes.",
      href: "/dashboard/create",
    },
    {
      title: "AI Styling",
      description: "Refine tone, layout, and visual direction from plain-language prompts.",
      href: "/docs/how-it-works",
    },
  ] satisfies NavLeafItem[],
  components: [
    {
      title: "Template Gallery",
      description: "Review generated layouts before publishing a full portfolio.",
      href: "/explore",
    },
    {
      title: "Section Builder",
      description: "Assemble hero, about, work, and contact sections with structure.",
      href: "/dashboard/create",
    },
    {
      title: "Version History",
      description: "Keep iterations of your portfolio and switch between revisions safely.",
      href: "/dashboard",
    },
  ] satisfies NavLeafItem[],
  resources: [
    {
      title: "How It Works",
      description: "Understand the workflow from resume upload to published portfolio.",
      href: "/docs/how-it-works",
    },
    {
      title: "Verification Scoring",
      description: "See how uploaded evidence is scored and turned into verified skills.",
      href: "/docs/verification-scoring",
    },
    {
      title: "Engineering Notes",
      description: "Read how the generation pipeline and architecture were built.",
      href: "/docs/engineering",
    },
    {
      title: "Explore Portfolios",
      description: "Browse generated portfolios and study output quality.",
      href: "/explore",
    },
  ] satisfies NavLeafItem[],
}

export const navbarNavigation: NavbarNavigation = {
  mobile: [
    {
      name: "Menu",
      items: [
        { href: "/", label: "Home" },
        { href: "/explore", label: "Explore" },
        { href: "/pricing", label: "Pricing" },
      ],
    },
    {
      name: "Build",
      items: productGroups.starterkits.map((item) => ({
        href: item.href,
        label: item.title,
      })),
    },
    {
      name: "Resources",
      items: productGroups.resources.map((item) => ({
        href: item.href,
        label: item.title,
      })),
    },
  ],
  desktop: [
    {
      href: "/",
      label: "Platform",
      gridCols: 2,
      categories: [
        {
          name: "Build",
          id: "build",
          items: productGroups.starterkits,
        },
        {
          name: "Tools",
          id: "tools",
          items: productGroups.components,
        },
      ],
    },
    {
      href: "/docs/how-it-works",
      label: "Resources",
      gridCols: 1,
      categories: [
        {
          name: "Learn",
          id: "learn",
          items: productGroups.resources,
        },
      ],
    },
    { href: "/pricing", label: "Pricing" },
    { href: "/explore", label: "Explore" },
  ],
}
