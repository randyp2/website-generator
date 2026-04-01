export interface NavLeafItem {
  title: string
  description: string
  href: string
}

export interface MobileNavSection {
  name: string
  items: Array<{
    label: string
    href: string
  }>
}

export interface DesktopNavCategory {
  id: string
  name: string
  items: NavLeafItem[]
}

export type DesktopNavItem =
  | {
      href: string
      label: string
      active?: boolean
      categories?: undefined
      gridCols?: undefined
    }
  | {
      href: string
      label: string
      active?: boolean
      categories: DesktopNavCategory[]
      gridCols: number
    }

export interface NavbarNavigation {
  mobile: MobileNavSection[]
  desktop: DesktopNavItem[]
}
