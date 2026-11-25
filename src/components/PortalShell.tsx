'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

export type PortalNavItem = { label: string; href: string; icon: string }

export default function PortalShell({
  portal,
  displayName,
  email,
  navItems,
  signOut,
  children,
}: {
  portal: 'admin' | 'storekeeper'
  displayName: string
  email?: string | null
  navItems: PortalNavItem[]
  signOut: () => Promise<void>
  children: ReactNode
}) {
  const pathname = usePathname()
  const isAdmin = portal === 'admin'

  return (
    <div className="portal-shell">
      <aside className="portal-sidebar">
        <div className="portal-brand">
          <div className="portal-logo" aria-hidden="true">
            <svg viewBox="0 0 64 64" fill="none">
              <path d="M13 28h38l-4-8H17l-4 8Z" fill="currentColor"/>
              <path d="M20 18c1-8 7-13 12-13s11 5 12 13M27 7v13m10-13v13" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
              <path d="M24 28v8m16-8v8M8 39h48M13 39v10h38V39M23 49v7m18-7v7M18 56h28" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="portal-brand-name">TOOLROOM</div>
          <div className="portal-brand-subtitle">{isAdmin ? 'ADMIN PORTAL' : 'STOREKEEPER PORTAL'}</div>
        </div>

        <nav className="portal-nav" aria-label={isAdmin ? 'Admin navigation' : 'Storekeeper navigation'}>
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== '/admin/dashboard' && item.href !== '/storekeeper/dashboard' && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href} className={active ? 'portal-nav-link active' : 'portal-nav-link'} aria-current={active ? 'page' : undefined}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={item.icon}/>
                </svg>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <form action={signOut} className="portal-logout">
          <button type="submit" className="portal-nav-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10 17l5-5-5-5m5 5H3m9-9h6a2 2 0 012 2v14a2 2 0 01-2 2h-6"/>
            </svg>
            <span>Logout</span>
          </button>
        </form>

        <div className="portal-sidebar-footer">
          <span>TOOLROOM</span><span className="portal-footer-separator">|</span>
          <span>Construction Tool Management System</span>
          <small>v1.0.0</small>
        </div>
      </aside>

      <main className="portal-main">
        <header className="portal-topbar">
          {isAdmin ? (
            <div className="portal-role-chip">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2 3.5 5.5v6.2c0 5.1 3.6 8.6 8.5 10.3 4.9-1.7 8.5-5.2 8.5-10.3V5.5L12 2Zm-1.1 14.5-3.4-3.4 1.5-1.5 1.9 1.9 4.2-4.2 1.5 1.5-5.7 5.7Z"/></svg>
              <span>Admin</span><span className="portal-chevron">⌄</span>
            </div>
          ) : (
            <div className="portal-user">
              <div className="portal-avatar">{displayName.charAt(0).toUpperCase()}</div>
              <div className="portal-user-copy"><strong>{displayName}</strong><span>Storekeeper</span></div>
              <span className="portal-chevron">⌄</span>
            </div>
          )}
        </header>
        <div className="portal-content">{children}</div>
      </main>
    </div>
  )
}
