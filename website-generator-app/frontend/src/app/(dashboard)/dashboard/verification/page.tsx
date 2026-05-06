"use client"

import { useUser } from "@/context/UserContext"
import VerificationTab from "../components/verification/VerificationTab"

const VerificationPage = () => {
  const { user } = useUser()

  return (
    <div className="space-y-8 px-6 py-8 md:px-8">
      <VerificationTab userId={user.id} />
    </div>
  )
}

export default VerificationPage
