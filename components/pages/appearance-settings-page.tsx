"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Palette, Sun, Moon, Monitor } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

interface AppearanceSettingsPageProps {
  onBack: () => void
}

export function AppearanceSettingsPage({ onBack }: AppearanceSettingsPageProps) {
  const [selectedTheme, setSelectedTheme] = useState("system")

  const themeOptions = [
    { id: "light", label: "Light", icon: Sun, description: "Clean white interface" },
    { id: "dark", label: "Dark", icon: Moon, description: "Easy on the eyes" },
    { id: "system", label: "System", icon: Monitor, description: "Match device settings" },
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
        <Palette className="h-5 w-5 text-black dark:text-white" />
        <h1 className="text-xl font-semibold text-black dark:text-white">Appearance</h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl space-y-6">
          <Card className="border-black/10 dark:border-[#333333]">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">Theme Selection</CardTitle>
              <CardDescription className="text-black/70 dark:text-white/70">
                Choose your preferred color scheme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {themeOptions.map((theme) => {
                  const Icon = theme.icon
                  const isSelected = selectedTheme === theme.id

                  return (
                    <Button
                      key={theme.id}
                      variant="outline"
                      className={`h-auto p-4 justify-start gap-4 border-black/20 dark:border-[#333333] bg-transparent hover:bg-black/5 dark:hover:bg-white/5 ${
                        isSelected ? "border-black dark:border-white bg-black/5 dark:bg-white/5" : ""
                      }`}
                      onClick={() => setSelectedTheme(theme.id)}
                    >
                      <Icon className="h-5 w-5 text-black dark:text-white" />
                      <div className="flex-1 text-left">
                        <div className="font-medium text-black dark:text-white">{theme.label}</div>
                        <div className="text-sm text-black/60 dark:text-white/60">{theme.description}</div>
                      </div>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-black dark:bg-white" />}
                    </Button>
                  )
                })}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-black/10 dark:border-[#333333]">
                <div>
                  <Label className="text-black dark:text-white">Quick Toggle</Label>
                  <p className="text-sm text-black/70 dark:text-white/70">Switch themes instantly</p>
                </div>
                <ThemeToggle />
              </div>
            </CardContent>
          </Card>

          <Card className="border-black/10 dark:border-[#333333]">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">Color Preferences</CardTitle>
              <CardDescription className="text-black/70 dark:text-white/70">
                Customize accent colors and highlights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                {["#000000", "#1e40af", "#059669", "#dc2626"].map((color) => (
                  <Button
                    key={color}
                    variant="outline"
                    className="h-12 w-full border-black/20 dark:border-[#333333] p-0 bg-transparent"
                    style={{ backgroundColor: color }}
                  >
                    <span className="sr-only">Select {color}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
