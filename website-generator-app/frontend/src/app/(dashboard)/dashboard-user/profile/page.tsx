"use client"

import { useUser } from "@/context/UserContext"

import ProfileHeader from "../components/ProfileHeader"
import ProfileTabs from "../components/ProfileTabs"

const ProfilePage = () => {
  const { user } = useUser()

  return (
    <div className="space-y-8 px-4 py-8 md:px-6">
      <ProfileHeader username={user.username} avatarUrl={user.avatar} />
      <ProfileTabs
        userId={user.id}
        username={user.username}
        avatarUrl={user.avatar}
      />
    </div>
  )
}

export default ProfilePage
