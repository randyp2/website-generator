"use client"

import * as React from "react"
import type { User } from "@supabase/supabase-js"
import { motion } from "framer-motion"
import {
  Bell,
  Inbox,
  LayoutDashboard,
  LogIn,
  Search,
  Sparkles,
  UserCircle2,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import BrandWordmark from "@/components/branding/BrandWordmark"
import { navbarNavigation } from "@/components/navbar/navbar.config"
import { ThemeModeToggle } from "@/components/theme/ThemeModeToggle"
import type {
  DesktopNavCategory,
  DesktopNavItem,
} from "@/components/navbar/navbar.types"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MobileNav } from "@/components/ui/navbar"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { signoutClient } from "@/lib/logout-client"
import { cn } from "@/lib/utils"
import { createClient } from "@/utils/supabase/client"

const actionButtonMotion = {
  whileHover: { scale: 1.03 },
  whileTap: { scale: 0.98 },
}

function getUserAvatarUrl(user: User | null) {
  if (!user) {
    return null
  }

  const metadata = user.user_metadata as Record<string, unknown> | undefined
  const avatarUrl = metadata?.avatar_url

  return typeof avatarUrl === "string" && avatarUrl.length > 0 ? avatarUrl : null
}

function getUserInitials(user: User | null) {
  const metadata = user?.user_metadata as Record<string, unknown> | undefined
  const fullName = metadata?.full_name

  if (typeof fullName === "string" && fullName.trim().length > 0) {
    return fullName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("")
  }

  const email = user?.email ?? ""
  return email.slice(0, 2).toUpperCase() || "U"
}

function getNavItemIsActive(item: DesktopNavItem, pathname: string) {
  if (item.href !== "/" && pathname.startsWith(item.href)) {
    return true
  }

  if (item.href === pathname) {
    return true
  }

  return item.categories?.some((category) =>
    category.items.some((entry) =>
      entry.href !== "/" ? pathname.startsWith(entry.href) : pathname === entry.href,
    ),
  )
}

function NavbarListItem({
  category,
}: {
  category: DesktopNavCategory
}) {
  return (
    <div className="mb-4 break-inside-avoid">
      <h3 className="mb-3 px-2 text-xs font-semibold tracking-[0.22em] text-foreground/55 uppercase">
        {category.name}
      </h3>
      <ul className="grid gap-1">
        {category.items.map((item) => (
          <li key={`${category.id}-${item.title}`}>
            <NavigationMenuLink asChild>
              <Link
                href={item.href}
                className="block rounded-xl px-3 py-2 transition-colors hover:bg-accent/60"
              >
                <div className="text-sm leading-none font-medium">{item.title}</div>
                <p className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-snug">
                  {item.description}
                </p>
              </Link>
            </NavigationMenuLink>
          </li>
        ))}
      </ul>
    </div>
  )
}

const NavbarClient: React.FC = () => {
  const [user, setUser] = React.useState<User | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = React.useMemo(() => createClient(), [])
  const avatarUrl = React.useMemo(() => getUserAvatarUrl(user), [user])
  const userInitials = React.useMemo(() => getUserInitials(user), [user])

  React.useEffect(() => {
    const initUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      setUser(session?.user ?? null)
    }

    void initUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
      <div className="flex min-w-0 items-center gap-2 md:-ml-2">
        <MobileNav nav={navbarNavigation.mobile} />

        <Link href="/" className="inline-flex items-center">
          <BrandWordmark className="text-lg text-foreground" />
        </Link>
      </div>

      <div className="flex justify-center">
      <NavigationMenu className="hidden md:flex">
        <NavigationMenuList>
          {navbarNavigation.desktop.map((item) => {
            const active = getNavItemIsActive(item, pathname)

            if (item.categories && item.categories.length > 0) {
              return (
                <NavigationMenuItem key={item.label}>
                  <NavigationMenuTrigger
                    className={cn(
                      "h-10 rounded-full bg-transparent px-4 text-sm font-medium",
                      active && "bg-accent/60 text-accent-foreground",
                    )}
                  >
                    {item.label}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent
                    className={cn(
                      "z-50 rounded-2xl border border-border/70 bg-popover/95 p-4 pb-1 shadow-2xl backdrop-blur md:w-[420px]",
                      item.gridCols === 1 && "columns-1 lg:w-[420px]",
                      item.gridCols === 2 && "columns-2 gap-4 lg:w-[620px]",
                      item.gridCols === 3 && "columns-3 gap-4 lg:w-[760px]",
                    )}
                  >
                    {item.categories.map((category) => (
                      <NavbarListItem key={category.id} category={category} />
                    ))}
                  </NavigationMenuContent>
                </NavigationMenuItem>
              )
            }

            return (
              <NavigationMenuItem key={item.label}>
                <NavigationMenuLink asChild data-active={active}>
                  <Link
                    href={item.href}
                    className={cn(
                      "inline-flex h-10 items-center rounded-full px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                      active && "bg-accent/60 text-accent-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            )
          })}
        </NavigationMenuList>
      </NavigationMenu>
      </div>

      <div className="ml-auto flex items-center gap-2 pl-2 md:pl-6">
        <ThemeModeToggle />
        {user ? (
          <>
            <div className="hidden items-center gap-2 md:flex">
              <div className="relative">
                <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                <input
                  type="text"
                  aria-label="Search"
                  placeholder="Search"
                  readOnly
                  className="h-10 w-40 rounded-full border border-border/70 bg-background/80 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/80 outline-none"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-9 rounded-md border border-border/70 bg-background/80 hover:bg-accent/60"
                aria-label="Inbox"
              >
                <Inbox className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-9 rounded-md border border-border/70 bg-background/80 hover:bg-accent/60"
                aria-label="Notifications"
              >
                <Bell className="size-4" />
              </Button>
            </div>
            <motion.div {...actionButtonMotion}>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-md bg-transparent p-0 hover:bg-accent/30 focus-visible:ring-0 focus-visible:ring-offset-0 md:ml-1"
                  >
                    <Avatar className="size-8">
                      <AvatarImage src={avatarUrl ?? undefined} alt={user.email ?? "User avatar"} />
                      <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="sr-only">Open user menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={10}
                  avoidCollisions={false}
                  className="w-48 rounded-xl"
                >
                  <DropdownMenuItem onClick={() => router.push("/dashboard-user")}>
                    <LayoutDashboard className="mr-2 size-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>
                    <UserCircle2 className="mr-2 size-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      await signoutClient()
                      router.push("/")
                    }}
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          </>
        ) : (
          <>
            <motion.div {...actionButtonMotion} className="max-sm:hidden">
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({ variant: "secondary", size: "sm" }),
                  "rounded-full px-4",
                )}
              >
                <LogIn className="mr-2 size-4" />
                Dashboard
              </Link>
            </motion.div>
            <motion.div {...actionButtonMotion}>
              <Link
                href="/dashboard"
                className={cn(buttonVariants({ size: "sm" }), "rounded-full px-4")}
              >
                <Sparkles className="mr-2 size-4" />
                Get Started
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}

export default NavbarClient
