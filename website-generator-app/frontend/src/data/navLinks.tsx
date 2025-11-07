import type { JSX } from "react";

import ExamplesPage from "../pages/ExamplePage";
import AboutPage from "../pages/AboutPage";
import DashboardPage from "../pages/DashboardPage";
import { LandingPage } from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";

/* ------- NAVBAR LINKS AND PATHS ------- */
// Define interface/shape for NavbarMenu array
interface NavbarItem {
  id: number;
  title: string;
  link: string;
  element: JSX.Element;
  showInNav?: boolean; // Optional: control if it appears in navbar
}

export const NavbarMenu: NavbarItem[] = [
  {
    id: 1,
    title: "Home",
    link: "/",
    element: <LandingPage />,
    showInNav: true,
  },
  {
    id: 2,
    title: "Examples",
    link: "/examples",
    element: <ExamplesPage />,
    showInNav: true,
  },
  {
    id: 3,
    title: "About",
    link: "/about",
    element: <AboutPage />,
    showInNav: true,
  },
  {
    id: 4,
    title: "Login",
    link: "/login",
    element: <LoginPage />,
    showInNav: false, // Don't show in navbar
  },
  {
    id: 5,
    title: "Dashboard",
    link: "/dashboard",
    element: <DashboardPage />,
    showInNav: false, // Don't show in navbar (accessed via "Get Started" button)
  },
];

// Helper to get only navbar-visible items
export const getNavbarItems = () =>
  NavbarMenu.filter((item) => item.showInNav !== false);