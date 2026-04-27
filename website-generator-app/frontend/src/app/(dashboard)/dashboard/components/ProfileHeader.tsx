"use client"

import Image from "next/image"
import {
  BriefcaseBusiness,
  Github,
  Globe,
  GraduationCap,
  Linkedin,
  MapPin,
} from "lucide-react"
import { FiUser } from "react-icons/fi"

import { GradientWaveBanner } from "./GradientWaveBanner"

const PROFILE_MOCK_DATA = {
  bio: "Creative designer and developer passionate about building beautiful digital experiences. Specializing in portfolio design and web development.",
  followers: 2985,
  following: 132,
  likes: 548,
} as const

interface ProfileHeaderProps {
  username: string
  handle?: string | null
  avatarUrl: string | null
  bio?: string | null
  jobTitle?: string | null
  company?: string | null
  school?: string | null
  degree?: string | null
  location?: string | null
  websiteUrl?: string | null
  linkedinUrl?: string | null
  githubUrl?: string | null
  showEditProfileButton?: boolean
  onEditProfile?: () => void
}

const nonEmpty = (value: string | null | undefined): string | null => {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
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
  handle,
  avatarUrl,
  bio,
  jobTitle,
  company,
  school,
  degree,
  location,
  websiteUrl,
  linkedinUrl,
  githubUrl,
  showEditProfileButton = false,
  onEditProfile,
}: ProfileHeaderProps) => {
  const initials = getInitials(username)
  const displayBio = bio?.trim() || PROFILE_MOCK_DATA.bio
  const cleanHandle = nonEmpty(handle)
  const showHandle =
    cleanHandle !== null &&
    cleanHandle.toLowerCase() !== username.trim().toLowerCase()

  const cleanJobTitle = nonEmpty(jobTitle)
  const cleanCompany = nonEmpty(company)
  const cleanSchool = nonEmpty(school)
  const cleanDegree = nonEmpty(degree)
  const cleanLocation = nonEmpty(location)
  const cleanWebsite = nonEmpty(websiteUrl)
  const cleanLinkedin = nonEmpty(linkedinUrl)
  const cleanGithub = nonEmpty(githubUrl)

  const jobLine = cleanJobTitle
    ? cleanCompany
      ? `${cleanJobTitle} at ${cleanCompany}`
      : cleanJobTitle
    : null
  const educationLine =
    cleanDegree && cleanSchool
      ? `${cleanDegree}, ${cleanSchool}`
      : (cleanDegree ?? cleanSchool)

  const hasAnySocial = Boolean(cleanGithub || cleanLinkedin || cleanWebsite)
  const hasAnyMeta = Boolean(jobLine || educationLine || cleanLocation)

  const socialLinks: { href: string; label: string; Icon: typeof Github }[] = []
  if (cleanGithub) socialLinks.push({ href: cleanGithub, label: "GitHub", Icon: Github })
  if (cleanLinkedin) socialLinks.push({ href: cleanLinkedin, label: "LinkedIn", Icon: Linkedin })
  if (cleanWebsite) socialLinks.push({ href: cleanWebsite, label: "Website", Icon: Globe })

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

          {/* Handle */}
          {showHandle && (
            <p className="text-sm font-medium text-primary">@{cleanHandle}</p>
          )}

          {/* Identity meta */}
          {hasAnyMeta && (
            <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground sm:items-start">
              {jobLine && (
                <div className="flex items-center gap-1.5">
                  <BriefcaseBusiness className="h-3.5 w-3.5 text-primary" />
                  <span>{jobLine}</span>
                </div>
              )}
              {educationLine && (
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-primary" />
                  <span>{educationLine}</span>
                </div>
              )}
              {cleanLocation && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span>{cleanLocation}</span>
                </div>
              )}
            </div>
          )}

          {/* Bio */}
          <p className="max-w-md text-center text-sm text-muted-foreground sm:text-left">
            {displayBio}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button className="rounded-full bg-foreground px-6 py-2 text-sm font-medium text-background transition-opacity hover:cursor-pointer hover:opacity-90">
              Follow
            </button>
            <button className="rounded-full border border-border px-6 py-2 text-sm font-medium text-foreground transition-colors hover:cursor-pointer hover:bg-muted">
              Get in touch
            </button>
            {showEditProfileButton && (
              <button
                type="button"
                onClick={onEditProfile}
                disabled={!onEditProfile}
                className="rounded-full border border-border px-6 py-2 text-sm font-medium text-foreground transition-colors hover:cursor-pointer hover:bg-muted disabled:cursor-not-allowed disabled:text-muted-foreground disabled:opacity-70 disabled:hover:bg-transparent"
              >
                Edit profile
              </button>
            )}
            {hasAnySocial && (
              <div className="ml-1 flex items-center gap-2 border-l border-border pl-3">
                {socialLinks.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={label}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="sr-only">{label}</span>
                  </a>
                ))}
              </div>
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
