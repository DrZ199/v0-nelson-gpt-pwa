"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

interface SettingsPageProps {
  onBack: () => void
}

export function SettingsPage({ onBack }: SettingsPageProps) {
  const [showCitations, setShowCitations] = useState(true)
  const [fontSize, setFontSize] = useState("medium")
  const [responseLength, setResponseLength] = useState("balanced")

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-[#1e1e1e]">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 border-b border-black dark:border-[#333333]">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold text-black dark:text-white">Settings</h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl space-y-8">
          {/* Appearance */}
          <section>
            <h2 className="text-lg font-semibold text-black dark:text-white mb-4">Appearance</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-black dark:text-white">Theme</Label>
                  <p className="text-sm text-black/70 dark:text-white/70">Choose your preferred theme</p>
                </div>
                <ThemeToggle />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-black dark:text-white">Font Size</Label>
                  <p className="text-sm text-black/70 dark:text-white/70">Adjust text size for better readability</p>
                </div>
                <Select value={fontSize} onValueChange={setFontSize}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* AI Responses */}
          <section>
            <h2 className="text-lg font-semibold text-black dark:text-white mb-4">AI Responses</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-black dark:text-white">Show Citations</Label>
                  <p className="text-sm text-black/70 dark:text-white/70">Display Nelson Textbook page references</p>
                </div>
                <Switch checked={showCitations} onCheckedChange={setShowCitations} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-black dark:text-white">Response Length</Label>
                  <p className="text-sm text-black/70 dark:text-white/70">Preferred length of AI responses</p>
                </div>
                <Select value={responseLength} onValueChange={setResponseLength}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concise">Concise</SelectItem>
                    <SelectItem value="balanced">Balanced</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* Data & Privacy */}
          <section>
            <h2 className="text-lg font-semibold text-black dark:text-white mb-4">Data & Privacy</h2>
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-start border-black dark:border-[#333333] text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 bg-transparent"
              >
                Clear Chat History
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-black dark:border-[#333333] text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 bg-transparent"
              >
                Manage Cache
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
