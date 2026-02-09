'use client'

import { usePathname } from 'next/navigation'
import Navigation from '@/components/Navigation'
import Breadcrumbs from '@/components/Breadcrumbs'
import Footer from '@/components/Footer'
import { ContactModalProvider } from '@/components/ContactModalContext'
import ContactModal from '@/components/ContactModal'
import ChatProactiveTrigger from '@/components/ChatProactiveTrigger'

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isStudio = pathname?.startsWith('/studio')

  if (isStudio) {
    return <>{children}</>
  }

  return (
    <ContactModalProvider>
      <Navigation />
      <Breadcrumbs />
      <main>{children}</main>
      <Footer />
      <ContactModal />
      <ChatProactiveTrigger />
    </ContactModalProvider>
  )
}
