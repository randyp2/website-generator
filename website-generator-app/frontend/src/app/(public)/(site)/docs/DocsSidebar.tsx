"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown } from "lucide-react"

import { docsNavGroups, type DocNavGroup } from "./docs-config"

const isActiveHref = (pathname: string, href: string) => pathname === href

const NavGroup = ({
  group,
  pathname,
}: {
  group: DocNavGroup
  pathname: string
}) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
      {group.title}
    </p>
    <ul className="mt-3 space-y-1 border-l border-border/70">
      {group.items.map((item) => {
        const active = isActiveHref(pathname, item.href)
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`-ml-px flex border-l-2 py-1.5 pl-4 text-sm transition-colors ${
                active
                  ? "border-primary font-medium text-primary"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              }`}
            >
              {item.title}
            </Link>
          </li>
        )
      })}
    </ul>
  </div>
)

/**
 * Docs navigation shared across every doc page.
 *
 * Renders a sticky rail on large screens and a collapsible disclosure on small
 * screens. Active state is derived from the current pathname so the layout can
 * stay a server component and the nav persists across doc navigation.
 */
export const DocsSidebar = () => {
  const pathname = usePathname()

  return (
    <>
      <details className="group mb-2 rounded-xl border border-border/70 bg-card/[0.24] lg:hidden">
        <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium text-foreground">
          Documentation
          <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
        </summary>
        <div className="space-y-6 px-4 pb-4">
          {docsNavGroups.map((group) => (
            <NavGroup key={group.title} group={group} pathname={pathname} />
          ))}
        </div>
      </details>

      <nav className="sticky top-24 hidden space-y-8 lg:block">
        {docsNavGroups.map((group) => (
          <NavGroup key={group.title} group={group} pathname={pathname} />
        ))}
      </nav>
    </>
  )
}
