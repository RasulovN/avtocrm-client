import { useEffect, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import '../landing.css'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

export function LandingLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="min-h-screen bg-white text-slate-700 dark:bg-slate-950 dark:text-slate-300">
      <a
        href="#lp-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Asosiy kontentga o‘tish
      </a>
      <Navbar />
      <main id="lp-main">{children}</main>
      <Footer />
    </div>
  )
}
