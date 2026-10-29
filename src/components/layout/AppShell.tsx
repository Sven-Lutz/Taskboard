import { Outlet } from 'react-router-dom'
import NavBar from '@/components/layout/NavBar'

export default function AppShell() {
  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <main>
        <Outlet />
      </main>
    </div>
  )
}
