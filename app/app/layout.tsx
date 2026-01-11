"use client"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import Link from "next/link"
import { usePathname } from "next/navigation"
import ProtectedLayout from "@/components/app/ProtectedLayout"
import { ConnectWallet } from "@/components/common/ConnectWallet"
import AppIcon from "@/components/common/AppIcon"
import config from "@/config"
import { LayoutDashboard, Workflow, FileText, Activity, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/flows/new", label: "Create Flow", icon: Workflow },
  { href: "/app/templates", label: "Templates", icon: FileText },
  { href: "/app/activity", label: "Activity", icon: Activity },
  { href: "/app/settings", label: "Settings", icon: Settings },
]

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <ProtectedLayout>
      <div className="flex min-h-screen">
        <aside className="w-64 border-r bg-background flex flex-col">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <AppIcon dimension={32} />
              <h2 className="text-xl font-bold">{config.appName}</h2>
            </div>
          </div>
    
          <nav className="p-4 space-y-1 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== "/app" && pathname?.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t">
            <ConnectWallet />
          </div>
        </aside>
    
        <main className="flex-1 overflow-auto bg-background">
          <header className="border-b p-6">
            <div className="flex items-center gap-3">
              <AppIcon dimension={32} />
              <h2 className="text-xl font-bold">{config.appName}</h2>
            </div>
          </header>
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </ProtectedLayout>
  )
}
  