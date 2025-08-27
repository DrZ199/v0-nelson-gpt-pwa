"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, Settings } from "lucide-react"

interface AIResponsesSettingsPageProps {
  onBack: () => void
}

export function AIResponsesSettingsPage({ onBack }: AIResponsesSettingsPageProps) {
  const [showCitations, setShowCitations] = useState(true)
  const [responseLength, setResponseLength] = useState("balanced")
  const [autoSuggest, setAutoSuggest] = useState(true)
  const [contextMemory, setContextMemory] = useState(true)
  const [responseSpeed, setResponseSpeed] = useState([50])
  const [confidenceThreshold, setConfidenceThreshold] = useState([75])

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
        <Settings className="h-5 w-5 text-black dark:text-white" />
        <h1 className="text-xl font-semibold text-black dark:text-white">AI Responses</h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl space-y-6">
          <Card className="border-black/10 dark:border-[#333333]">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">Response Settings</CardTitle>
              <CardDescription className="text-black/70 dark:text-white/70">
                Configure how AI responses are generated and displayed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  <SelectTrigger className="w-32 border-black/20 dark:border-[#333333] bg-transparent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concise">Concise</SelectItem>
                    <SelectItem value="balanced">Balanced</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                    <SelectItem value="comprehensive">Comprehensive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-black dark:text-white">Response Speed: {responseSpeed[0]}%</Label>
                <p className="text-sm text-black/70 dark:text-white/70">Balance between speed and accuracy</p>
                <Slider
                  value={responseSpeed}
                  onValueChange={setResponseSpeed}
                  min={25}
                  max={100}
                  step={25}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-black/10 dark:border-[#333333]">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">Advanced Features</CardTitle>
              <CardDescription className="text-black/70 dark:text-white/70">
                Enhanced AI capabilities and suggestions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-black dark:text-white">Auto-Suggest Questions</Label>
                  <p className="text-sm text-black/70 dark:text-white/70">Show relevant follow-up questions</p>
                </div>
                <Switch checked={autoSuggest} onCheckedChange={setAutoSuggest} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-black dark:text-white">Context Memory</Label>
                  <p className="text-sm text-black/70 dark:text-white/70">Remember conversation context</p>
                </div>
                <Switch checked={contextMemory} onCheckedChange={setContextMemory} />
              </div>

              <div className="space-y-3">
                <Label className="text-black dark:text-white">Confidence Threshold: {confidenceThreshold[0]}%</Label>
                <p className="text-sm text-black/70 dark:text-white/70">Minimum confidence for medical advice</p>
                <Slider
                  value={confidenceThreshold}
                  onValueChange={setConfidenceThreshold}
                  min={50}
                  max={95}
                  step={5}
                  className="w-full"
                />
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
