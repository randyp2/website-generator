import type { JSX } from "react";


/* ------- NAVBAR LINKS AND PATHS ------- */
// Define interface/shape for NavbarMenu array
interface NavbarItem {
  id: number;
  title: string;
  link: string;
  showInNav?: boolean; // Optional: control if it appears in navbar
}

export const NavbarMenu: NavbarItem[] = [
  {
    id: 1,
    title: "Home",
    link: "/",
    showInNav: true,
  },
  {
    id: 2,
    title: "Examples",
    link: "/examples",
    showInNav: true,
  },
  {
    id: 3,
    title: "About",
    link: "/about",
    showInNav: true,
  },
  {
    id: 4,
    title: "Login",
    link: "/login",
    showInNav: false, // Don't show in navbar
  },
  {
    id: 5,
    title: "Dashboard",
    link: "/dashboard",
    showInNav: false, // Don't show in navbar (accessed via "Get Started" button)
  },
];

// Helper to get only navbar-visible items
export const getNavbarItems = () =>
  NavbarMenu.filter((item) => item.showInNav !== false);