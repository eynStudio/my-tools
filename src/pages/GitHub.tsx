import { useState } from "react"
import { invoke } from "@tauri-apps/api/core"
import { open } from "@tauri-apps/plugin-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FolderOpen, LogIn } from "lucide-react"
import { getEffectiveProxy, getOrg, setOrg as saveOrg, getWorkDir, setWorkDir as saveWorkDir } from "@/lib/settings"

const NEED_LOGIN = "__NEED_LOGIN__"

export default function GitHub() {
  const [repoName, setRepoName] = useState("")
  const [privateRepo, setPrivateRepo] = useState(true)
  const [orgName, setOrgName] = useState(getOrg)
  const [workDir, setWorkDir] = useState(getWorkDir)
  const [loading, setLoading] = useState(false)
  const [needLogin, setNeedLogin] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const [clonedPath, setClonedPath] = useState<string | null>(null)

  async function pickDir() {
    const selected = await open({ directory: true, multiple: false })
    if (selected) {
      setWorkDir(selected)
      saveWorkDir(selected)
    }
  }

  async function handleLogin() {
    try {
      await invoke("github_login", { proxy: getEffectiveProxy() })
      setMessage({ ok: true, text: "请在弹出的 PowerShell 窗口中完成登录，完成后重新点击「创建并克隆」" })
      setNeedLogin(false)
    } catch (e) {
      setMessage({ ok: false, text: String(e) })
    }
  }

  async function handleCreate() {
    if (!repoName || !orgName || !workDir) return
    saveOrg(orgName)
    saveWorkDir(workDir)
    setLoading(true)
    setMessage(null)
    setNeedLogin(false)
    setClonedPath(null)
    try {
      const dest = await invoke<string>("create_and_clone_repo", {
        name: repoName,
        org: orgName,
        workDir,
        private: privateRepo,
        proxy: getEffectiveProxy(),
      })
      setMessage({ ok: true, text: `已克隆到 ${dest}` })
      setClonedPath(dest)
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
          <div className="space-y-2">
            <Button className="w-full" onClick={handleCreate} disabled={loading || !canSubmit}>
              {loading ? "创建中..." : "创建并克隆"}
            </Button>
            {clonedPath && (
              <Button className="w-full" variant="outline" onClick={() => invoke("open_in_cursor", { path: clonedPath })}>
                用 Cursor 打开
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
