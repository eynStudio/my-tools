import { Button } from "@/components/ui/button"

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">My Tools</h1>
        <p className="text-muted-foreground">
          Tauri + React + Vite + TypeScript + TailwindCSS + shadcn/ui
        </p>
        <Button>Get Started</Button>
      </div>
    </div>
  )
}

export default App
