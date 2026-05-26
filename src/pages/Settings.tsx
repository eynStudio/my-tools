import React, { useEffect, useState } from "react"
import { enable, disable, isEnabled } from "@tauri-apps/plugin-autostart"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getProxyEnabled, getProxyUrl, setProxyEnabled, setProxyUrl, MODULES, getModuleVisibility, setModuleVisibility, isModuleSupported } from "@/lib/settings"

type Category = "general" | "modules" | "network"

const categories: { id: Category; label: string }[] = [
  { id: "general", label: "通用" },
  { id: "modules", label: "功能模块" },
  { id: "network", label: "网络" },
]

function GeneralSettings() {
  const [autostart, setAutostart] = useState(false)

  useEffect(() => {
    isEnabled().then(setAutostart).catch(() => {})
  }, [])

  async function toggleAutostart(val: boolean) {
    try {
      if (val) {
        await enable()
      } else {
        await disable()
      }
      setAutostart(val)
    } catch {}
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">通用</h2>
      <div className="flex items-center gap-2">
        <input
          id="autostart"
          type="checkbox"
          checked={autostart}
          onChange={(e) => toggleAutostart(e.target.checked)}
          className="size-4 rounded"
        />
        <Label htmlFor="autostart">开机自动启动</Label>
      </div>
    </div>
  )
}

function NetworkSettings() {
  const [proxyEnabledState, setEnabled] = useState(getProxyEnabled)
  const [proxyUrl, setUrl] = useState(getProxyUrl)

  function toggleProxy(val: boolean) {
    setEnabled(val)
    setProxyEnabled(val)
  }

  function updateUrl(val: string) {
    setUrl(val)
    setProxyUrl(val)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">网络</h2>
      <div className="flex items-center gap-2">
        <input
          id="proxy-toggle"
          type="checkbox"
          checked={proxyEnabledState}
          onChange={(e) => toggleProxy(e.target.checked)}
          className="size-4 rounded"
        />
        <Label htmlFor="proxy-toggle">启用代理</Label>
      </div>

      {proxyEnabledState && (
        <div className="space-y-2">
          <Label htmlFor="proxy-url">代理地址</Label>
          <Input
            id="proxy-url"
            placeholder="http://127.0.0.1:7890"
            value={proxyUrl}
            onChange={(e) => updateUrl(e.target.value)}
          />
        </div>
      )}
    </div>
  )
}

function ModuleSettings() {
  const [vis, setVis] = useState(getModuleVisibility)

  function toggle(id: string, val: boolean) {
    const next = { ...vis, [id]: val }
    setVis(next)
    setModuleVisibility(next)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">功能模块</h2>
      <p className="text-sm text-muted-foreground">控制哪些功能模块显示在导航菜单中。</p>
      <div className="space-y-3">
        {MODULES.map((m) => {
          const supported = isModuleSupported(m)
          return (
            <div key={m.id} className="flex items-center gap-2">
              <input
                id={`mod-${m.id}`}
                type="checkbox"
                checked={vis[m.id] ?? false}
                disabled={!supported}
                onChange={(e) => toggle(m.id, e.target.checked)}
                className="size-4 rounded"
              />
              <Label htmlFor={`mod-${m.id}`}>{m.label}</Label>
              {!supported && (
                <span className="text-xs text-muted-foreground">（当前系统不支持）</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const panels: Record<Category, () => React.ReactElement> = {
  general: GeneralSettings,
  modules: ModuleSettings,
  network: NetworkSettings,
}

export default function Settings() {
  const [active, setActive] = useState<Category>("general")
  const Panel = panels[active]

  return (
    <div className="flex-1 flex">
      <nav className="w-48 border-r p-4 space-y-1">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              active === c.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {c.label}
          </button>
        ))}
      </nav>
      <main className="flex-1 p-6">
        <Panel />
      </main>
    </div>
  )
}
