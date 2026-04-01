import type { NavbarNavigation, NavLeafItem } from "@/components/navbar/navbar.types"

const productGroups = {
  starterkits: [
    {
      title: "Portfolio Launch",
      description: "Guided templates for designers, developers, and freelancers.",
      href: "/dashboard",
    },
    {
      title: "Resume Import",
      description: "Turn your resume into sections and project highlights in minutes.",
      href: "/dashboard",
    },
    {
      title: "AI Styling",
      description: "Refine tone, layout, and visual direction from plain-language prompts.",
      href: "/dashboard",
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
      href: "/dashboard",
    },
    {
      title: "Version History",
      description: "Keep iterations of your portfolio and switch between revisions safely.",
      href: "/dashboard-user",
    },
  ] satisfies NavLeafItem[],
  resources: [
    {
      title: "How It Works",
      description: "Understand the workflow from resume upload to published portfolio.",
      href: "/about",
    },
    {
      title: "Explore Portfolios",
      description: "Browse generated portfolios and study output quality.",
      href: "/explore",
    },
    {
      title: "Sign In",
      description: "Access saved portfolios and continue previous work.",
      href: "/login",
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
        { href: "/about", label: "About" },
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
      href: "/dashboard",
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
      href: "/about",
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
    { href: "/explore", label: "Explore" },
    { href: "/about", label: "About" },
  ],
}
