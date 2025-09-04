"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Palette, Sun, Moon, Monitor, Eye, Type, Loader2 } from "lucide-react"
import { useThemeSettings } from "@/lib/settings-context"

interface AppearanceSettingsPageProps {
  onBack: () => void
}

export function AppearanceSettingsPage({ onBack }: AppearanceSettingsPageProps) {
  const {
    theme,
    setTheme,
    fontSize,
    setFontSize,
    highContrast,
    setHighContrast,
    reduceMotion,
    setReduceMotion,
  } = useThemeSettings()

  const themeOptions = [
    { id: "light", label: "Light", icon: Sun, description: "Clean white interface" },
    { id: "dark", label: "Dark", icon: Moon, description: "Easy on the eyes" },
    { id: "system", label: "System", icon: Monitor, description: "Match device settings" },
  ] as const

  const fontSizeOptions = [
    { value: "small", label: "Small", description: "Compact text size" },
    { value: "medium", label: "Medium", description: "Standard text size" },
    { value: "large", label: "Large", description: "Larger text for readability" },
    { value: "extra-large", label: "Extra Large", description: "Maximum text size" },
  ] as const

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
          {/* Theme Selection */}
          <Card className="border-black/10 dark:border-[#333333]">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">Theme Selection</CardTitle>
              <CardDescription className="text-black/70 dark:text-white/70">
                Choose your preferred color scheme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {themeOptions.map((themeOption) => {
                  const Icon = themeOption.icon
                  const isSelected = theme === themeOption.id

                  return (
                    <Button
                      key={themeOption.id}
                      variant="outline"
                      className={`h-auto p-4 justify-start gap-4 border-black/20 dark:border-[#333333] bg-transparent hover:bg-black/5 dark:hover:bg-white/5 transition-all ${
                        isSelected ? "border-black dark:border-white bg-black/5 dark:bg-white/5" : ""
                      }`}
                      onClick={() => setTheme(themeOption.id)}
                    >
                      <Icon className="h-5 w-5 text-black dark:text-white" />
                      <div className="flex-1 text-left">
                        <div className="font-medium text-black dark:text-white">{themeOption.label}</div>
                        <div className="text-sm text-black/60 dark:text-white/60">{themeOption.description}</div>
                      </div>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-black dark:bg-white" />}
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Typography Settings */}
          <Card className="border-black/10 dark:border-[#333333]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                <Type className="h-5 w-5" />
                Typography
              </CardTitle>
              <CardDescription className="text-black/70 dark:text-white/70">
                Adjust text size and readability options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-black dark:text-white">Font Size</Label>
                <Select value={fontSize} onValueChange={setFontSize}>
                  <SelectTrigger className="border-black/20 dark:border-[#333333] bg-white dark:bg-[#1e1e1e]">
                    <SelectValue placeholder="Select font size" />
                  </SelectTrigger>
                  <SelectContent className="border-black/20 dark:border-[#333333] bg-white dark:bg-[#1e1e1e]">
                    {fontSizeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-black/60 dark:text-white/60">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-black dark:text-white">High Contrast</Label>
                  <p className="text-sm text-black/70 dark:text-white/70">
                    Increase color contrast for better visibility
                  </p>
                </div>
                <Switch
                  checked={highContrast}
                  onCheckedChange={setHighContrast}
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-black dark:text-white">Reduce Motion</Label>
                  <p className="text-sm text-black/70 dark:text-white/70">
                    Minimize animations and transitions
                  </p>
                </div>
                <Switch
                  checked={reduceMotion}
                  onCheckedChange={setReduceMotion}
                />
              </div>
            </CardContent>
          </Card>

          {/* Accessibility Features */}
          <Card className="border-black/10 dark:border-[#333333]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                <Eye className="h-5 w-5" />
                Accessibility
              </CardTitle>
              <CardDescription className="text-black/70 dark:text-white/70">
                Features to improve accessibility and usability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Keyboard Navigation</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Use Tab to navigate, Enter to select, and Escape to close dialogs.
                </p>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Screen Reader Support</h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  This app is optimized for screen readers with proper ARIA labels and semantic markup.
                </p>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg">
                <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Medical Content</h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Medical information is clearly structured and marked for accessibility tools.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Preview Section */}
          <Card className="border-black/10 dark:border-[#333333]">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">Preview</CardTitle>
              <CardDescription className="text-black/70 dark:text-white/70">
                See how your settings affect the interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 border border-black/10 dark:border-[#333333] rounded-lg bg-black/5 dark:bg-white/5">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-black dark:text-white">Sample Medical Query</h3>
                  <p className="text-black dark:text-white">
                    "5-year-old with fever and cough for 3 days"
                  </p>
                  <div className="p-3 bg-white dark:bg-[#1e1e1e] border border-black/10 dark:border-[#333333] rounded">
                    <p className="text-sm text-black dark:text-white">
                      Based on the symptoms described, this could indicate a respiratory infection. 
                      The fever and cough duration suggests monitoring is needed.
                    </p>
                    {theme !== 'system' && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-black/60 dark:text-white/60">
                        <div className="w-1 h-1 bg-black/60 dark:bg-white/60 rounded-full"></div>
                        <span>Nelson Textbook, Chapter 12, Page 345</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
