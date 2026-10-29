import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function UserMenu() {
  const { user, signOut } = useAuth()
  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-300">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={`https://github.com/${user.login}.png?size=32`}
              alt={user.login}
            />
            <AvatarFallback className="text-xs">
              {user.login[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-slate-700 hidden sm:inline">
            {user.login}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <div className="px-2 py-1.5 text-sm font-medium text-slate-900">
          {user.login}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600 cursor-pointer"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
