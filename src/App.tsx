import { useEffect, useState } from "react"
import { NavLink, Outlet } from "react-router-dom"
import { Home, Settings, GitBranch } from "lucide-react"
import { isModuleVisible } from "@/lib/settings"

const navItems = [
  { to: "/", label: "首页", icon: Home },
  { to: "/github", label: "GitHub", icon: GitBranch, module: "github" },
  { to: "/settings", label: "设置", icon: Settings },
] as const

export default function App() {
  const [, setTick] = useState(0)

  useEffect(() => {
    const handler = () => setTick((t) => t + 1)
    window.addEventListener("modules-changed", handler)
    return () => window.removeEventListener("modules-changed", handler)
  }, [])

  const visibleItems = navItems.filter((item) => {
    if ("module" in item) return isModuleVisible(item.module)
    return true
  })

  return (
    <div className="h-screen flex flex-col">
      <nav className="flex items-center gap-1 border-b px-4 py-2 bg-muted/40">
        {visibleItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`
            }
          >
            <Icon className="size-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <main className="flex-1 flex">
        <Outlet />
      </main>
    </div>
  )
}
