import type { Metadata } from "next"

import { NotificationsPageClient } from "./components/NotificationsPageClient"

export const metadata: Metadata = {
  title: "Notifications | AI Portfolio Generator",
  description: "Activity on your portfolios and profile.",
  robots: { index: false, follow: false },
}

const NotificationsPage = () => <NotificationsPageClient />

export default NotificationsPage
