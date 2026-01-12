"use client"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import ProtectedLayout from "@/components/app/ProtectedLayout"
import config from "@/config"
import { LayoutDashboard, Workflow, FileText, Activity, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAccount, useDisconnect } from "wagmi"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/flows/new", label: "Create Flow", icon: Workflow },
  { href: "/app/templates", label: "Templates", icon: FileText },
  { href: "/app/activity", label: "Activity", icon: Activity },
]

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const handleDisconnect = () => {
    disconnect()
    router.push('/')
  }

  return (
    <ProtectedLayout>
      <div className="flex min-h-screen">
        <aside className="w-64 border-r bg-background flex flex-col">
          <div className="h-16 px-4 border-b flex items-center">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt={config.appLogoAlt}
                width={28}
                height={28}
                className="select-none"
              />
              <h2 className="text-lg font-bold">{config.appName}</h2>
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

          {isConnected && address && (
            <div className="p-4 border-t bg-muted/20">
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-background/50 border border-border/50 mb-3 hover:bg-background/80 transition-colors">
                <div className="w-9 h-9 rounded-full bg-linear-to-br from-primary/30 to-primary/10 flex items-center justify-center shrink-0 ring-2 ring-primary/20">
                  <span className="text-xs font-bold text-primary">{address.slice(2, 4).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{formatAddress(address)}</p>
                  <p className="text-xs text-muted-foreground">Connected</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href="/app/settings" className="flex-1">
                  <Button
                    variant={pathname === "/app/settings" ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "w-full transition-all",
                      pathname === "/app/settings" 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "hover:bg-accent/50"
                    )}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnect}
                  className="flex-1 transition-all border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          )}
        </aside>
    
        <main className="flex-1 overflow-auto bg-background">
          <div className="w-full pt-0 pb-8">
            {children}
          </div>
        </main>
      </div>
    </ProtectedLayout>
  )
}
