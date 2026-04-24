"use client"

import Image from "next/image"
import { FiUser } from "react-icons/fi"

import { PROFILE_MOCK_DATA } from "../profile/profile.types"
import { GradientWaveBanner } from "./GradientWaveBanner"

interface ProfileHeaderProps {
  username: string
  avatarUrl: string | null
  bio?: string | null
  showEditProfileButton?: boolean
}

const getInitials = (name: string): string => {
  const parts = name.split(/\s+/).filter(Boolean)
  return parts
    .map((p) => p[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

const ProfileHeader = ({
  username,
  avatarUrl,
  bio,
  showEditProfileButton = false,
}: ProfileHeaderProps) => {
  const initials = getInitials(username)
  const displayBio = bio?.trim() || PROFILE_MOCK_DATA.bio

  return (
    <div>
      {/* Banner + Avatar Region */}
      <div className="relative">
        <GradientWaveBanner />

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
            {displayBio}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-1">
            <button className="rounded-full bg-foreground px-6 py-2 text-sm font-medium text-background transition-opacity hover:cursor-pointer hover:opacity-90">
              Follow
            </button>
            <button className="rounded-full border border-border px-6 py-2 text-sm font-medium text-foreground transition-colors hover:cursor-pointer hover:bg-muted">
              Get in touch
            </button>
            {showEditProfileButton && (
              <button
                type="button"
                disabled
                className="rounded-full border border-border px-6 py-2 text-sm font-medium text-muted-foreground opacity-70"
              >
                Edit profile
              </button>
            )}
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
