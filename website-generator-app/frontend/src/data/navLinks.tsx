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
    title: "Explore",
    link: "/explore",
    showInNav: true,
  },
  {
    id: 3,
    title: "How It Works",
    link: "/docs/how-it-works",
    showInNav: false, // Don't show in navbar (accessed via "Get Started" button)
  },
];

// Helper to get only navbar-visible items
export const getNavbarItems = () =>
  NavbarMenu.filter((item) => item.showInNav !== false);
