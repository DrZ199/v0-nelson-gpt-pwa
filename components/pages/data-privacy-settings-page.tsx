"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, Info, Trash2, Download, Shield } from "lucide-react"

interface DataPrivacySettingsPageProps {
  onBack: () => void
}

export function DataPrivacySettingsPage({ onBack }: DataPrivacySettingsPageProps) {
  const [saveHistory, setSaveHistory] = useState(true)
  const [analytics, setAnalytics] = useState(false)
  const [crashReports, setCrashReports] = useState(true)

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
        <Info className="h-5 w-5 text-black dark:text-white" />
        <h1 className="text-xl font-semibold text-black dark:text-white">Data & Privacy</h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl space-y-6">
          <Card className="border-black/10 dark:border-[#333333]">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">Privacy Settings</CardTitle>
              <CardDescription className="text-black/70 dark:text-white/70">
                Control how your data is stored and used
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-black dark:text-white">Save Chat History</Label>
                  <p className="text-sm text-black/70 dark:text-white/70">Store conversations locally for reference</p>
                </div>
                <Switch checked={saveHistory} onCheckedChange={setSaveHistory} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-black dark:text-white">Usage Analytics</Label>
                  <p className="text-sm text-black/70 dark:text-white/70">
                    Help improve the app with anonymous usage data
                  </p>
                </div>
                <Switch checked={analytics} onCheckedChange={setAnalytics} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-black dark:text-white">Crash Reports</Label>
                  <p className="text-sm text-black/70 dark:text-white/70">Send error reports to help fix issues</p>
                </div>
                <Switch checked={crashReports} onCheckedChange={setCrashReports} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-black/10 dark:border-[#333333]">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">Data Management</CardTitle>
              <CardDescription className="text-black/70 dark:text-white/70">
                Manage your stored data and cache
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 border-black/20 dark:border-[#333333] text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 bg-transparent"
              >
                <Download className="h-4 w-4" />
                Export Chat History
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-3 border-black/20 dark:border-[#333333] text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 bg-transparent"
              >
                <Shield className="h-4 w-4" />
                Clear Cache
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3 border-red-500/20 text-red-500 hover:bg-red-500/10 bg-transparent"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear All Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white dark:bg-[#1e1e1e] border-black dark:border-[#333333]">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-black dark:text-white">Clear All Data</AlertDialogTitle>
                    <AlertDialogDescription className="text-black/70 dark:text-white/70">
                      This will permanently delete all your chat history, settings, and cached data. This action cannot
                      be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-black/20 dark:border-[#333333] text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction className="bg-red-500 text-white hover:bg-red-600">
                      Delete All Data
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>

          <Card className="border-black/10 dark:border-[#333333]">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">Medical Disclaimer</CardTitle>
              <CardDescription className="text-black/70 dark:text-white/70">
                Important information about medical advice
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-black/70 dark:text-white/70 leading-relaxed">
                Nelson-GPT is an AI assistant based on the Nelson Textbook of Pediatrics. It provides educational
                information and should not replace professional medical advice, diagnosis, or treatment. Always consult
                with qualified healthcare professionals for medical decisions.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
