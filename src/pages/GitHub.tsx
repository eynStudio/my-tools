import { useState } from "react"
import { invoke } from "@tauri-apps/api/core"
import { open } from "@tauri-apps/plugin-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FolderOpen, LogIn } from "lucide-react"

const NEED_LOGIN = "__NEED_LOGIN__"
const PROXY_KEY = "github_proxy"

function loadProxy(): string {
  return localStorage.getItem(PROXY_KEY) || ""
}

export default function GitHub() {
  const [proxy, setProxy] = useState(loadProxy)
  const [repoName, setRepoName] = useState("")
  const [privateRepo, setPrivateRepo] = useState(true)
  const [orgName, setOrgName] = useState("")
  const [workDir, setWorkDir] = useState("")
  const [loading, setLoading] = useState(false)
  const [needLogin, setNeedLogin] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  function updateProxy(val: string) {
    setProxy(val)
    localStorage.setItem(PROXY_KEY, val)
  }

  async function pickDir() {
    const selected = await open({ directory: true, multiple: false })
    if (selected) setWorkDir(selected)
  }

  async function handleLogin() {
    try {
      await invoke("github_login", { proxy })
      setMessage({ ok: true, text: "请在弹出的 PowerShell 窗口中完成登录，完成后重新点击「创建并克隆」" })
      setNeedLogin(false)
    } catch (e) {
      setMessage({ ok: false, text: String(e) })
    }
  }

  async function handleCreate() {
    if (!repoName || !orgName || !workDir) return
    setLoading(true)
    setMessage(null)
    setNeedLogin(false)
    try {
      const dest = await invoke<string>("create_and_clone_repo", {
        name: repoName,
        org: orgName,
        workDir,
        private: privateRepo,
        proxy,
      })
      setMessage({ ok: true, text: `已克隆到 ${dest}` })
      setRepoName("")
    } catch (e) {
      const err = String(e)
      if (err === NEED_LOGIN) {
        setNeedLogin(true)
        setMessage({ ok: false, text: "尚未登录 GitHub，请先登录" })
      } else {
        setMessage({ ok: false, text: err })
      }
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = repoName && orgName && workDir

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-full max-w-md space-y-5 p-6">
        <h2 className="text-xl font-semibold text-center">创建 GitHub 仓库</h2>

        <div className="space-y-2">
          <Label htmlFor="proxy">代理地址</Label>
          <Input id="proxy" placeholder="http://127.0.0.1:7890" value={proxy} onChange={(e) => updateProxy(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="repo">仓库名称</Label>
          <Input id="repo" placeholder="my-repo" value={repoName} onChange={(e) => setRepoName(e.target.value)} />
        </div>

        <div className="flex items-center gap-2">
          <input id="private" type="checkbox" checked={privateRepo} onChange={(e) => setPrivateRepo(e.target.checked)} className="size-4 rounded" />
          <Label htmlFor="private">私有仓库</Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="org">机构名称</Label>
          <Input id="org" placeholder="my-org" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="workdir">工作目录</Label>
          <div className="flex gap-2">
            <Input id="workdir" placeholder="选择或输入路径" value={workDir} onChange={(e) => setWorkDir(e.target.value)} />
            <Button variant="outline" size="icon" onClick={pickDir}>
              <FolderOpen className="size-4" />
            </Button>
          </div>
        </div>

        {message && (
          <p className={`text-sm ${message.ok ? "text-green-600" : "text-red-500"}`}>{message.text}</p>
        )}

        {needLogin ? (
          <Button className="w-full" onClick={handleLogin}>
            <LogIn className="size-4 mr-2" />
            登录 GitHub
          </Button>
        ) : (
          <Button className="w-full" onClick={handleCreate} disabled={loading || !canSubmit}>
            {loading ? "创建中..." : "创建并克隆"}
          </Button>
        )}
      </div>
    </div>
  )
}
