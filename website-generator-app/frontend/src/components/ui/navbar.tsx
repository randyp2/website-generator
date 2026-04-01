"use client"

import * as React from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export interface MobileNavGroup {
  name: string
  items: Array<{
    label: string
    href: string
  }>
}

interface MobileNavProps {
  nav: MobileNavGroup[]
}

export function MobileNav({ nav }: MobileNavProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "block size-9 touch-manipulation items-center justify-start gap-2.5 rounded-full border border-border/70 bg-background/80 hover:bg-background focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-ring active:bg-background md:hidden",
          )}
        >
          <div className="relative flex items-center justify-center">
            <div className="relative size-4">
              <span
                className={cn(
                  "bg-foreground absolute left-0 block h-0.5 w-4 transition-all duration-100",
                  open ? "top-[0.4rem] -rotate-45" : "top-1",
                )}
              />
              <span
                className={cn(
                  "bg-foreground absolute left-0 block h-0.5 w-4 transition-all duration-100",
                  open ? "top-[0.4rem] rotate-45" : "top-2.5",
                )}
              />
            </div>
            <span className="sr-only">Toggle menu</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="bg-background/95 h-[var(--radix-popover-content-available-height)] w-[var(--radix-popover-content-available-width)] overflow-y-auto rounded-none border-x-0 border-b border-t-0 p-0 shadow-none backdrop-blur"
        align="start"
        side="bottom"
        alignOffset={-16}
        sideOffset={8}
      >
        <div className="flex flex-col gap-10 px-6 py-6">
          {nav.map((category) => (
            <div className="flex flex-col gap-4" key={category.name}>
              <p className="text-muted-foreground text-sm font-medium tracking-[0.18em] uppercase">
                {category.name}
              </p>
              <div className="flex flex-col gap-3">
                {category.items.map((item) => (
                  <Link
                    key={`${category.name}-${item.href}-${item.label}`}
                    href={item.href}
                    className="text-2xl font-medium tracking-tight"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
