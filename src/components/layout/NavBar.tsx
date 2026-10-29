import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Grid2x2, Table2, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import UserMenu from '@/components/layout/UserMenu'
import { useQueryClient } from '@tanstack/react-query'

const NAV_LINKS = [
  { to: '/board', label: 'Board', icon: LayoutDashboard },
  { to: '/matrix', label: 'Matrix', icon: Grid2x2 },
  { to: '/table', label: 'Table', icon: Table2 },
]

export default function NavBar() {
  const queryClient = useQueryClient()

  function handleRefresh() {
    void queryClient.invalidateQueries({ queryKey: ['tasks'] })
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="flex items-center gap-1 px-6 py-3">
        {/* Logo */}
        <span className="font-bold text-slate-900 text-base mr-6 tracking-tight">
          Taskboard
        </span>

        {/* Nav links */}
        <div className="flex items-center gap-1 flex-1">
          {NAV_LINKS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            title="Refresh tasks"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          <UserMenu />
        </div>
      </nav>
    </header>
  )
}
