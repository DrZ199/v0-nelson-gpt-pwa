"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, Settings, Brain, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { useAISettings, useSettings } from "@/lib/settings-context"

interface AIResponsesSettingsPageProps {
  onBack: () => void
}

export function AIResponsesSettingsPage({ onBack }: AIResponsesSettingsPageProps) {
  const {
    showCitations,
    setShowCitations,
    showConfidenceScores,
    setShowConfidenceScores,
    showClinicalReasoning,
    setShowClinicalReasoning,
    responseDetailLevel,
    setResponseDetailLevel,
    confidenceThreshold,
    setConfidenceThreshold,
  } = useAISettings()

  const { resetSettings } = useSettings()
  
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // Convert 0-1 confidence threshold to 0-100 for slider
  const confidencePercentage = Math.round((confidenceThreshold || 0.3) * 100)
  
  const handleConfidenceChange = (values: number[]) => {
    const newThreshold = values[0] / 100
    setConfidenceThreshold(newThreshold)
  }

  const handleReset = async () => {
    setIsSaving(true)
    try {
      const success = await resetSettings()
      if (success) {
        setSaveStatus('success')
        setTimeout(() => setSaveStatus('idle'), 2000)
      } else {
        setSaveStatus('error')
        setTimeout(() => setSaveStatus('idle'), 2000)
      }
    } catch (error) {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } finally {
      setIsSaving(false)
    }
  }

  const responseDetailOptions = [
    { value: "brief", label: "Brief", description: "Short, focused answers" },
    { value: "standard", label: "Standard", description: "Balanced detail level" },
    { value: "detailed", label: "Detailed", description: "Comprehensive explanations" },
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
        <Brain className="h-5 w-5 text-black dark:text-white" />
        <h1 className="text-xl font-semibold text-black dark:text-white">AI Responses</h1>
      </header>

      {/* Save Status */}
      {saveStatus !== 'idle' && (
        <div className={`px-4 py-3 border-b ${
          saveStatus === 'success' 
            ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-center gap-2">
            {saveStatus === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            )}
            <span className={`text-sm font-medium ${
              saveStatus === 'success' 
                ? 'text-green-800 dark:text-green-200' 
                : 'text-red-800 dark:text-red-200'
            }`}>
              {saveStatus === 'success' ? 'Settings saved successfully!' : 'Failed to save settings'}
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl space-y-6">
          {/* Response Display Settings */}
          <Card className="border-black/10 dark:border-[#333333]">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">Response Display</CardTitle>
              <CardDescription className="text-black/70 dark:text-white/70">
                Control what information is shown in AI responses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-black dark:text-white">Show Citations</Label>
                  <p className="text-sm text-black/70 dark:text-white/70">
                    Display Nelson Textbook page references and sources
                  </p>
                </div>
                <Switch 
                  checked={showCitations || false} 
                  onCheckedChange={setShowCitations} 
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-black dark:text-white">Show Confidence Scores</Label>
                  <p className="text-sm text-black/70 dark:text-white/70">
                    Display AI confidence levels for each response
                  </p>
                </div>
                <Switch 
                  checked={showConfidenceScores || false} 
                  onCheckedChange={setShowConfidenceScores} 
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-black dark:text-white">Show Clinical Reasoning</Label>
                  <p className="text-sm text-black/70 dark:text-white/70">
                    Display step-by-step medical reasoning process
                  </p>
                </div>
                <Switch 
                  checked={showClinicalReasoning || false} 
                  onCheckedChange={setShowClinicalReasoning} 
                />
              </div>
            </CardContent>
          </Card>

          {/* Response Generation Settings */}
          <Card className="border-black/10 dark:border-[#333333]">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">Response Generation</CardTitle>
              <CardDescription className="text-black/70 dark:text-white/70">
                Configure how AI responses are generated
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-black dark:text-white">Response Detail Level</Label>
                <p className="text-sm text-black/70 dark:text-white/70">
                  Choose how detailed you want the AI responses to be
                </p>
                <Select 
                  value={responseDetailLevel || "standard"} 
                  onValueChange={setResponseDetailLevel}
                >
                  <SelectTrigger className="border-black/20 dark:border-[#333333] bg-white dark:bg-[#1e1e1e]">
                    <SelectValue placeholder="Select detail level" />
                  </SelectTrigger>
                  <SelectContent className="border-black/20 dark:border-[#333333] bg-white dark:bg-[#1e1e1e]">
                    {responseDetailOptions.map((option) => (
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

              <div className="space-y-3">
                <Label className="text-black dark:text-white">
                  Confidence Threshold: {confidencePercentage}%
                </Label>
                <p className="text-sm text-black/70 dark:text-white/70">
                  Minimum confidence required for medical advice (higher = more conservative)
                </p>
                <Slider
                  value={[confidencePercentage]}
                  onValueChange={handleConfidenceChange}
                  min={10}
                  max={90}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-black/50 dark:text-white/50">
                  <span>Less strict (10%)</span>
                  <span>More strict (90%)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Safety Features */}
          <Card className="border-black/10 dark:border-[#333333]">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">Medical Safety</CardTitle>
              <CardDescription className="text-black/70 dark:text-white/70">
                Safety features for medical information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">⚠️ Important</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  This AI assistant provides educational information only. Always consult with qualified 
                  healthcare professionals for medical decisions and emergencies.
                </p>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">🔒 Privacy Protected</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  All conversations are processed securely. No personal medical information is stored 
                  beyond your current session unless you explicitly save it.
                </p>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">📚 Evidence-Based</h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  All responses are based on the Nelson Textbook of Pediatrics and established 
                  medical guidelines with proper citations provided.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 border-black dark:border-[#333333] text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 bg-transparent"
              onClick={handleReset}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                'Reset to Default'
              )}
            </Button>
          </div>

          {/* Settings automatically save, so we can show this info */}
          <div className="text-center text-sm text-black/60 dark:text-white/60">
            Settings are automatically saved as you change them
          </div>
        </div>
      </div>
    </div>
  )
}
