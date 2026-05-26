const PROXY_ENABLED_KEY = "proxy_enabled"
const PROXY_URL_KEY = "proxy_url"

export function getProxyEnabled(): boolean {
  return localStorage.getItem(PROXY_ENABLED_KEY) === "true"
}

export function setProxyEnabled(val: boolean) {
  localStorage.setItem(PROXY_ENABLED_KEY, String(val))
}

export function getProxyUrl(): string {
  return localStorage.getItem(PROXY_URL_KEY) || ""
}

export function setProxyUrl(val: string) {
  localStorage.setItem(PROXY_URL_KEY, val)
}

export function getEffectiveProxy(): string {
  return getProxyEnabled() ? getProxyUrl() : ""
}

const ORG_KEY = "github_org"
const WORKDIR_KEY = "github_workdir"

export function getOrg(): string {
  return localStorage.getItem(ORG_KEY) || ""
}

export function setOrg(val: string) {
  localStorage.setItem(ORG_KEY, val)
}

export function getWorkDir(): string {
  return localStorage.getItem(WORKDIR_KEY) || ""
}

export function setWorkDir(val: string) {
  localStorage.setItem(WORKDIR_KEY, val)
}

// --- Module visibility ---

export interface ModuleDef {
  id: string
  label: string
  /** Platforms where this module can run. null = all platforms. */
  platforms?: string[]
}

export const MODULES: ModuleDef[] = [
  { id: "github", label: "GitHub" },
]

const MODULE_VIS_KEY = "module_visibility"

function getDefaults(): Record<string, boolean> {
  const result: Record<string, boolean> = {}
  for (const m of MODULES) {
    result[m.id] = isModuleSupported(m)
  }
  return result
}

export function isModuleSupported(m: ModuleDef): boolean {
  if (!m.platforms) return true
  return m.platforms.includes(navigator.platform)
}

export function getModuleVisibility(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(MODULE_VIS_KEY)
    if (raw) {
      const saved = JSON.parse(raw) as Record<string, boolean>
      const defaults = getDefaults()
      for (const m of MODULES) {
        if (!(m.id in saved)) {
          saved[m.id] = defaults[m.id]
        }
      }
      return saved
    }
  } catch {}
  return getDefaults()
}

export function setModuleVisibility(vis: Record<string, boolean>) {
  localStorage.setItem(MODULE_VIS_KEY, JSON.stringify(vis))
  window.dispatchEvent(new Event("modules-changed"))
}

export function isModuleVisible(id: string): boolean {
  const vis = getModuleVisibility()
  const mod = MODULES.find((m) => m.id === id)
  if (!mod || !isModuleSupported(mod)) return false
  return vis[id] ?? false
}
