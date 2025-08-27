"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Mic, Menu } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  citations?: Array<{
    page_number: number
    chapter_title: string
    section_title: string
  }>
  reasoning?: {
    query_decomposition: string[]
    clinical_reasoning: string[]
    confidence_score: number
    risk_level: "low" | "medium" | "high"
    requires_specialist: boolean
  }
}

interface ChatInterfaceProps {
  onMenuClick: () => void
}

export function ChatInterface({ onMenuClick }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => crypto.randomUUID())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const hasMessages = messages.length > 0

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input.trim()
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentInput,
          sessionId: sessionId,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: "assistant",
        timestamp: new Date(),
        citations: data.citations || [],
        reasoning: data.reasoning,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Chat API error:", error)

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "I apologize, but I'm having trouble connecting to the medical database right now. Please try again in a moment, or consult with a healthcare professional for immediate medical concerns.",
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
    inputRef.current?.focus()
  }

  const suggestions = [
    "5-year-old with fever and cough for 3 days",
    "Newborn with feeding difficulties and vomiting",
    "Adolescent with severe headache and neck stiffness",
  ]

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-[#1e1e1e]">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-black dark:border-[#333333]">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-black dark:text-white">Nelson-GPT</h1>
        </div>
        {/* Theme Toggle */}
        <ThemeToggle />
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden relative">
        {!hasMessages ? (
          // Welcome State
          <div className="flex flex-col items-center justify-center h-full px-4">
            <div className="text-center mb-8 max-w-2xl">
              <h2 className="text-3xl font-bold text-black dark:text-white mb-4">Welcome to Nelson-GPT</h2>
              <p className="text-lg text-black/70 dark:text-[#f2f2f2]/70 mb-8">
                Your AI-powered pediatric medical assistant with advanced clinical reasoning
              </p>
            </div>

            {/* Suggestion Chips */}
            <div className="flex flex-wrap gap-3 mb-8 justify-center max-w-2xl">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-4 py-2 rounded-full border border-black dark:border-[#333333] text-sm text-black dark:text-[#f2f2f2] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Centered Input */}
            <form onSubmit={handleSubmit} className="w-full max-w-2xl">
              <div className="relative">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe symptoms, age, and clinical context..."
                  className="h-18 text-lg px-6 pr-14 rounded-3xl border-black dark:border-[#333333] bg-white dark:bg-[#1C1C1C] text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50 focus:ring-2 focus:ring-black dark:focus:ring-white"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/80 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        ) : (
          // Chat Messages
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn("flex animate-fade-in", message.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-xl px-4 py-3",
                      message.role === "user"
                        ? "bg-white dark:bg-[#2A2A2A] border border-black dark:border-[#333333] text-black dark:text-white"
                        : "bg-[#f8f8f8] dark:bg-[#121212] text-black dark:text-[#f2f2f2] border border-black/10 dark:border-[#333333]",
                    )}
                  >
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <div
                        className="whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{
                          __html: message.content
                            .replace(/\n/g, "<br/>")
                            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                            .replace(/## (.*?)(?=\n|$)/g, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>'),
                        }}
                      />
                    </div>

                    {message.reasoning && (
                      <div className="mt-4 p-3 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                        <div className="text-xs font-semibold text-black/70 dark:text-white/70 mb-2">
                          Clinical Reasoning
                        </div>

                        {/* Confidence Score */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-black/60 dark:text-white/60">Confidence:</span>
                          <div className="flex-1 bg-black/10 dark:bg-white/10 rounded-full h-2">
                            <div
                              className="bg-black dark:bg-white h-2 rounded-full transition-all duration-300"
                              style={{ width: `${message.reasoning.confidence_score * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-black/60 dark:text-white/60">
                            {Math.round(message.reasoning.confidence_score * 100)}%
                          </span>
                        </div>

                        {/* Query Decomposition */}
                        {message.reasoning.query_decomposition.length > 0 && (
                          <div className="mb-2">
                            <div className="text-xs font-medium text-black/70 dark:text-white/70 mb-1">Analysis:</div>
                            <div className="flex flex-wrap gap-1">
                              {message.reasoning.query_decomposition.map((item, index) => (
                                <span
                                  key={index}
                                  className="text-xs px-2 py-1 rounded bg-black/10 dark:bg-white/10 text-black/70 dark:text-white/70"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {message.citations && message.citations.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {message.citations.map((citation, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-1 rounded bg-black/10 dark:bg-white/10 text-black/70 dark:text-white/70"
                            title={`${citation.chapter_title} - ${citation.section_title}`}
                          >
                            Nelson, pg. {citation.page_number}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start animate-fade-in">
                  <div className="bg-[#f8f8f8] dark:bg-[#121212] border border-black/10 dark:border-[#333333] rounded-xl px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-black/40 dark:bg-white/40 rounded-full animate-pulse" />
                        <div
                          className="w-2 h-2 bg-black/40 dark:bg-white/40 rounded-full animate-pulse"
                          style={{ animationDelay: "150ms" }}
                        />
                        <div
                          className="w-2 h-2 bg-black/40 dark:bg-white/40 rounded-full animate-pulse"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                      <span className="text-xs text-black/60 dark:text-white/60">Analyzing clinical context...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Footer Input */}
            <div className="border-t border-black dark:border-[#333333] p-4">
              <form onSubmit={handleSubmit}>
                <div className="relative">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Describe symptoms, age, and clinical context..."
                    className="h-12 px-4 pr-20 rounded-lg border-black dark:border-[#333333] bg-white dark:bg-[#1C1C1C] text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50"
                    disabled={isLoading}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10"
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!input.trim() || isLoading}
                      className="h-8 w-8 bg-black dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/80 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
