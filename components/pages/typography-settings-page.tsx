"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, Type } from "lucide-react"

interface TypographySettingsPageProps {
  onBack: () => void
}

export function TypographySettingsPage({ onBack }: TypographySettingsPageProps) {
  const [fontSize, setFontSize] = useState("medium")
  const [fontFamily, setFontFamily] = useState("system")
  const [lineHeight, setLineHeight] = useState([1.5])
  const [letterSpacing, setLetterSpacing] = useState([0])

  const fontSizeOptions = [
    { value: "small", label: "Small", size: "14px" },
    { value: "medium", label: "Medium", size: "16px" },
    { value: "large", label: "Large", size: "18px" },
    { value: "extra-large", label: "Extra Large", size: "20px" },
  ]

  const fontFamilyOptions = [
    { value: "system", label: "System Default", family: "system-ui" },
    { value: "inter", label: "Inter", family: "Inter" },
    { value: "roboto", label: "Roboto", family: "Roboto" },
    { value: "open-sans", label: "Open Sans", family: "Open Sans" },
    { value: "source-sans", label: "Source Sans Pro", family: "Source Sans Pro" },
  ]

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
        <Type className="h-5 w-5 text-black dark:text-white" />
        <h1 className="text-xl font-semibold text-black dark:text-white">Typography</h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl space-y-6">
          <Card className="border-black/10 dark:border-[#333333]">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">Font Settings</CardTitle>
              <CardDescription className="text-black/70 dark:text-white/70">
                Customize text appearance for better readability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-black dark:text-white">Font Size</Label>
                <div className="grid grid-cols-2 gap-3">
                  {fontSizeOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant="outline"
                      className={`h-auto p-4 justify-start border-black/20 dark:border-[#333333] bg-transparent hover:bg-black/5 dark:hover:bg-white/5 ${
                        fontSize === option.value ? "border-black dark:border-white bg-black/5 dark:bg-white/5" : ""
                      }`}
                      onClick={() => setFontSize(option.value)}
                    >
                      <div className="text-left">
                        <div className="font-medium text-black dark:text-white">{option.label}</div>
                        <div className="text-sm text-black/60 dark:text-white/60">{option.size}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-black dark:text-white">Font Family</Label>
                <Select value={fontFamily} onValueChange={setFontFamily}>
                  <SelectTrigger className="border-black/20 dark:border-[#333333] bg-transparent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontFamilyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span style={{ fontFamily: option.family }}>{option.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-black dark:text-white">Line Height: {lineHeight[0]}</Label>
                <Slider
                  value={lineHeight}
                  onValueChange={setLineHeight}
                  min={1.2}
                  max={2.0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-black dark:text-white">Letter Spacing: {letterSpacing[0]}px</Label>
                <Slider
                  value={letterSpacing}
                  onValueChange={setLetterSpacing}
                  min={-1}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-black/10 dark:border-[#333333]">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">Preview</CardTitle>
              <CardDescription className="text-black/70 dark:text-white/70">
                See how your text settings will look
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="p-4 border border-black/10 dark:border-[#333333] rounded-lg bg-black/5 dark:bg-white/5"
                style={{
                  fontSize: fontSizeOptions.find((f) => f.value === fontSize)?.size,
                  fontFamily: fontFamilyOptions.find((f) => f.value === fontFamily)?.family,
                  lineHeight: lineHeight[0],
                  letterSpacing: `${letterSpacing[0]}px`,
                }}
              >
                <h3 className="font-semibold text-black dark:text-white mb-2">Sample Medical Text</h3>
                <p className="text-black dark:text-white">
                  Pneumonia is an infection that inflames air sacs in one or both lungs. The air sacs may fill with
                  fluid or pus, causing cough with phlegm or pus, fever, chills, and difficulty breathing.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
