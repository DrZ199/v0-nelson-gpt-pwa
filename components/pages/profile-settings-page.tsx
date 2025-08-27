"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, User } from "lucide-react"

interface ProfileSettingsPageProps {
  onBack: () => void
}

export function ProfileSettingsPage({ onBack }: ProfileSettingsPageProps) {
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [ageUnit, setAgeUnit] = useState("years")
  const [role, setRole] = useState("")

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
        <User className="h-5 w-5 text-black dark:text-white" />
        <h1 className="text-xl font-semibold text-black dark:text-white">Profile & Age</h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl space-y-6">
          <Card className="border-black/10 dark:border-[#333333]">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">Personal Information</CardTitle>
              <CardDescription className="text-black/70 dark:text-white/70">
                Help us provide more personalized medical guidance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-black dark:text-white">
                  Name (Optional)
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="border-black/20 dark:border-[#333333] bg-transparent"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-black dark:text-white">
                  Role
                </Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="border-black/20 dark:border-[#333333] bg-transparent">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parent">Parent/Guardian</SelectItem>
                    <SelectItem value="pediatrician">Pediatrician</SelectItem>
                    <SelectItem value="nurse">Pediatric Nurse</SelectItem>
                    <SelectItem value="resident">Medical Resident</SelectItem>
                    <SelectItem value="student">Medical Student</SelectItem>
                    <SelectItem value="other">Other Healthcare Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-black/10 dark:border-[#333333]">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">Age Settings</CardTitle>
              <CardDescription className="text-black/70 dark:text-white/70">
                Set default age for dosing calculations and age-specific guidance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="age" className="text-black dark:text-white">
                    Age
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Enter age"
                    className="border-black/20 dark:border-[#333333] bg-transparent"
                  />
                </div>
                <div className="w-32 space-y-2">
                  <Label className="text-black dark:text-white">Unit</Label>
                  <Select value={ageUnit} onValueChange={setAgeUnit}>
                    <SelectTrigger className="border-black/20 dark:border-[#333333] bg-transparent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="weeks">Weeks</SelectItem>
                      <SelectItem value="months">Months</SelectItem>
                      <SelectItem value="years">Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
