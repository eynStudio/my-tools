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
