import { Bell, Search, User } from 'lucide-react'

export function Topbar() {
    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#1f2937] bg-[#111827]/80 px-6 backdrop-blur-md">
            <div className="flex flex-1 items-center gap-4">
                {/* Placeholder for Breadcrumbs or Search */}
                <div className="relative w-96">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search projects, containers..."
                        className="w-full rounded-md border border-[#374151] bg-[#1f2937] py-1.5 pl-10 pr-4 text-sm text-gray-200 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="relative text-gray-400 hover:text-white">
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-0 top-0 block h-2 w-2 rounded-full bg-blue-500 ring-2 ring-[#111827]"></span>
                </button>
                <div className="h-8 w-8 overflow-hidden rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center cursor-pointer">
                    <User className="h-4 w-4 text-white" />
                </div>
            </div>
        </header>
    )
}
