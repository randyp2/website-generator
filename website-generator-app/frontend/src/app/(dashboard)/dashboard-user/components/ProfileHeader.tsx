"use client"

import Image from "next/image"
import { FiUser } from "react-icons/fi"

import { PROFILE_MOCK_DATA } from "../profile/profile.types"

interface ProfileHeaderProps {
  username: string
  avatarUrl: string | null
}

const getInitials = (name: string): string => {
  const parts = name.split(/\s+/).filter(Boolean)
  return parts
    .map((p) => p[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

const ProfileHeader = ({ username, avatarUrl }: ProfileHeaderProps) => {
  const initials = getInitials(username)

  return (
    <div>
      {/* Banner + Avatar Region */}
      <div className="relative">
        {/* Gradient Banner */}
        <div className="relative h-44 w-full overflow-hidden rounded-xl bg-background sm:h-56">
          {/* SVG wave shape with gradient fill */}
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 1200 400"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <radialGradient id="glow1" cx="30%" cy="70%" r="40%">
                <stop offset="0%" className="[stop-color:var(--primary)]" stopOpacity="0.35" />
                <stop offset="100%" className="[stop-color:var(--primary)]" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="glow2" cx="55%" cy="80%" r="35%">
                <stop offset="0%" className="[stop-color:var(--primary)]" stopOpacity="0.25" />
                <stop offset="100%" className="[stop-color:var(--primary)]" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="glow3" cx="80%" cy="65%" r="30%">
                <stop offset="0%" className="[stop-color:var(--primary)]" stopOpacity="0.2" />
                <stop offset="100%" className="[stop-color:var(--primary)]" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Circular glow orbs */}
            <circle cx="340" cy="280" r="180" fill="url(#glow1)" />
            <circle cx="640" cy="310" r="160" fill="url(#glow2)" />
            <circle cx="920" cy="260" r="140" fill="url(#glow3)" />

            {/* Wave path — flowing curve connecting the orbs */}
            <path
              d="M0,400 C0,400 100,280 300,260 C500,240 400,340 600,300 C800,260 750,220 950,250 C1100,270 1200,320 1200,400 Z"
              className="fill-primary/[0.08]"
            />
            {/* Second wave layer — offset for depth */}
            <path
              d="M0,400 C0,400 150,320 350,310 C550,300 500,370 700,340 C900,310 850,280 1050,300 C1150,310 1200,360 1200,400 Z"
              className="fill-primary/[0.06]"
            />
          </svg>
        </div>

        {/* Avatar with cutout effect */}
        <div className="absolute bottom-0 left-4 translate-y-1/3 sm:left-8">
          {/* Background ring that creates the "banner curves around image" look */}
          <div className="relative">
            <div className="absolute -inset-3 rounded-full bg-background" />
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={username}
                width={176}
                height={176}
                unoptimized
                className="relative z-10 h-44 w-44 rounded-full object-cover shadow-lg"
              />
            ) : (
              <div className="relative z-10 flex h-44 w-44 items-center justify-center rounded-full bg-muted shadow-lg">
                {initials ? (
                  <span className="text-5xl font-bold text-muted-foreground">
                    {initials}
                  </span>
                ) : (
                  <FiUser className="h-16 w-16 text-muted-foreground" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Content — below banner, to the right of avatar */}
      <div className="mt-4 flex flex-col items-center gap-6 px-4 sm:flex-row sm:items-end sm:px-8">
        {/* Spacer matching avatar width + padding */}
        <div className="hidden shrink-0 sm:block sm:w-52" />

        {/* Info + Buttons */}
        <div className="mt-10 flex flex-1 flex-col items-center gap-3 sm:mt-0 sm:items-start">
          {/* Name + Badge */}
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">{username}</h1>
            <span className="rounded-md bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
              PRO
            </span>
          </div>

          {/* Bio */}
          <p className="max-w-md text-center text-sm text-muted-foreground sm:text-left">
            {PROFILE_MOCK_DATA.bio}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-1">
            <button className="rounded-full bg-foreground px-6 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90">
              Follow
            </button>
            <button className="rounded-full border border-border px-6 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              Get in touch
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-8 pt-2 sm:gap-10">
          {[
            { label: "Followers", value: PROFILE_MOCK_DATA.followers },
            { label: "Following", value: PROFILE_MOCK_DATA.following },
            { label: "Likes", value: PROFILE_MOCK_DATA.likes },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <span className="text-xs text-muted-foreground">
                {stat.label}
              </span>
              <span className="text-3xl font-bold text-foreground">
                {stat.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProfileHeader
