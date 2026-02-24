'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Container,
    KeyRound,
    ScrollText,
    Settings,
    Terminal
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
    { name: 'Overview', href: '/', icon: LayoutDashboard },
    { name: 'Containers', href: '/containers', icon: Container },
    { name: 'Secrets', href: '/secrets', icon: KeyRound },
    { name: 'Logs', href: '/logs', icon: ScrollText },
    { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-[#1f2937] bg-[#111827]">
            <div className="flex h-16 items-center border-b border-[#1f2937] px-6">
                <Terminal className="mr-2 h-6 w-6 text-blue-500" />
                <span className="text-xl font-bold tracking-tight text-white">EzOps</span>
            </div>

            <nav className="flex flex-col gap-1 p-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-blue-600/10 text-blue-500'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}
