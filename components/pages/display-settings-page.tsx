"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, Monitor } from "lucide-react"

interface DisplaySettingsPageProps {
  onBack: () => void
}

export function DisplaySettingsPage({ onBack }: DisplaySettingsPageProps) {
  const [compactMode, setCompactMode] = useState(false)
  const [showTimestamps, setShowTimestamps] = useState(true)
  const [animationsEnabled, setAnimationsEnabled] = useState(true)
  const [chatWidth, setChatWidth] = useState([80])
  const [messageSpacing, setMessageSpacing] = useState([16])

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
        <Monitor className="h-5 w-5 text-black dark:text-white" />
        <h1 className="text-xl font-semibold text-black dark:text-white">Display</h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl space-y-6">
          <Card className="border-black/10 dark:border-[#333333]">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">Layout Options</CardTitle>
              <CardDescription className="text-black/70 dark:text-white/70">
                Customize the chat interface layout
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-black dark:text-white">Compact Mode</Label>
                  <p className="text-sm text-black/70 dark:text-white/70">Reduce spacing for more content</p>
                </div>
                <Switch checked={compactMode} onCheckedChange={setCompactMode} />
              </div>

              <div className="space-y-3">
                <Label className="text-black dark:text-white">Chat Width: {chatWidth[0]}%</Label>
                <Slider value={chatWidth} onValueChange={setChatWidth} min={60} max={100} step={5} className="w-full" />
              </div>

              <div className="space-y-3">
                <Label className="text-black dark:text-white">Message Spacing: {messageSpacing[0]}px</Label>
                <Slider
                  value={messageSpacing}
                  onValueChange={setMessageSpacing}
                  min={8}
                  max={32}
                  step={4}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-black/10 dark:border-[#333333]">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">Interface Elements</CardTitle>
              <CardDescription className="text-black/70 dark:text-white/70">
                Show or hide interface components
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-black dark:text-white">Show Timestamps</Label>
                  <p className="text-sm text-black/70 dark:text-white/70">Display message timestamps</p>
                </div>
                <Switch checked={showTimestamps} onCheckedChange={setShowTimestamps} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-black dark:text-white">Animations</Label>
                  <p className="text-sm text-black/70 dark:text-white/70">Enable smooth transitions and effects</p>
                </div>
                <Switch checked={animationsEnabled} onCheckedChange={setAnimationsEnabled} />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 border-black dark:border-[#333333] text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 bg-transparent"
            >
              Reset to Default
            </Button>
            <Button className="flex-1 bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90">
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
