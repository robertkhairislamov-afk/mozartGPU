import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

interface NavItem {
  to: string
  label: string
  icon: string
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: 'grid' },
  { to: '/instances', label: 'Instances', icon: 'server' },
  { to: '/billing', label: 'Billing', icon: 'credit-card' },
  { to: '/ssh-keys', label: 'SSH Keys', icon: 'key' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
]

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const icons: Record<string, string> = {
    grid: 'M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z',
    server:
      'M2 3a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3zm0 13a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-5zm15-10.5a1 1 0 1 0 2 0 1 1 0 0 0-2 0zm0 13a1 1 0 1 0 2 0 1 1 0 0 0-2 0z',
    'credit-card':
      'M2 5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5zm18 0H4v3h16V5zM4 12v7h16v-7H4zm2 2h4v2H6v-2z',
    key: 'M12.65 10A6 6 0 1 0 10 12.65L21 23.7 23.7 21 22.35 19.65 21 18.3l-1.35 1.35-1.3-1.3L19.7 17l-1.35-1.35L17 17l-1.3-1.3 3-3c-.35-.8-.55-1.64-.55-2.5a6 6 0 0 0-.5-2.2zM7 9a2 2 0 1 1 0 4 2 2 0 0 1 0-4z',
    settings:
      'M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.18c.04-.32.07-.64.07-.97s-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1s.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.58 1.69-.98l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66z',
    logout:
      'M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z',
    menu: 'M3 6h18M3 12h18M3 18h18',
    close: 'M18 6 6 18M6 6l12 12',
    plus: 'M12 5v14M5 12h14',
  }

  const d = icons[name]
  if (!d) return null

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {name === 'menu' || name === 'close' || name === 'plus' ? (
        d.split('M').filter(Boolean).map((segment, i) => (
          <path key={i} d={`M${segment}`} />
        ))
      ) : (
        <path d={d} />
      )}
    </svg>
  )
}

export { Icon }

export default function Layout() {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'flex items-center gap-3 px-3 py-2.5 rounded-[6px] text-sm font-medium transition-colors duration-150',
      isActive
        ? 'bg-[#1e1e1e] text-gold'
        : 'text-[rgba(245,245,240,0.55)] hover:text-neural-fog hover:bg-[#161616]',
    ].join(' ')

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      {/* Sidebar overlay on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          'fixed top-0 left-0 z-30 h-full w-[240px] bg-[#111111] border-r border-[#2a2a2a]',
          'flex flex-col transition-transform duration-200',
          'lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-[#2a2a2a]">
          <Link to="/dashboard" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
            <span className="text-gold font-bold tracking-widest text-lg uppercase">MOZART</span>
          </Link>
          <button
            className="lg:hidden text-muted hover:text-neural-fog p-1"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={navLinkClass}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon name={item.icon} size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-4 py-4 border-t border-[#2a2a2a]">
          <div className="text-xs text-muted truncate mb-3">{user?.email}</div>
          <button onClick={handleLogout} className="btn-secondary w-full text-xs py-2 min-h-[36px]">
            <Icon name="logout" size={14} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-[240px] min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-10 h-16 bg-[#0a0a0a]/80 backdrop-blur-sm border-b border-[#2a2a2a] flex items-center px-4 gap-4">
          <button
            className="lg:hidden text-muted hover:text-neural-fog p-1 min-h-[44px] flex items-center"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Icon name="menu" size={20} />
          </button>
          <span className="text-gold font-bold tracking-widest text-sm uppercase lg:hidden">MOZART</span>
          <div className="flex-1" />
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted">
            <span className="w-2 h-2 rounded-full bg-running inline-block animate-pulse-slow" />
            <span className="font-mono">{user?.email}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 animate-fade-in">
          <Outlet />
        </main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-10 h-16 bg-[#111111] border-t border-[#2a2a2a] flex items-center justify-around px-2">
          {NAV_ITEMS.slice(0, 4).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-[6px] min-h-[44px] justify-center',
                  isActive ? 'text-gold' : 'text-[rgba(245,245,240,0.4)]',
                ].join(' ')
              }
            >
              <Icon name={item.icon} size={20} />
              <span className="text-[10px]">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
