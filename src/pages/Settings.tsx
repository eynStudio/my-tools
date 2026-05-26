import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getProxyEnabled, getProxyUrl, setProxyEnabled, setProxyUrl } from "@/lib/settings"

export default function Settings() {
  const [proxyEnabled, setEnabled] = useState(getProxyEnabled)
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
    <div className="flex-1 flex items-center justify-center">
      <div className="w-full max-w-md space-y-6 p-6">
        <h2 className="text-xl font-semibold text-center">设置</h2>

        <div className="space-y-4 rounded-md border p-4">
          <h3 className="font-medium">代理</h3>

          <div className="flex items-center gap-2">
            <input
              id="proxy-toggle"
              type="checkbox"
              checked={proxyEnabled}
              onChange={(e) => toggleProxy(e.target.checked)}
              className="size-4 rounded"
            />
            <Label htmlFor="proxy-toggle">启用代理</Label>
          </div>

          {proxyEnabled && (
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
      </div>
    </div>
  )
}
