"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink } from "lucide-react"

interface AboutPageProps {
  onBack: () => void
}

export function AboutPage({ onBack }: AboutPageProps) {
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
        <h1 className="text-xl font-semibold text-black dark:text-white">About Nelson-GPT</h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl space-y-8">
          {/* Logo and Title */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-black dark:text-white mb-2">Nelson-GPT</h2>
            <p className="text-lg text-black/70 dark:text-white/70">AI-Powered Pediatric Medical Assistant</p>
            <p className="text-sm text-black/50 dark:text-white/50 mt-2">Version 1.0.0</p>
          </div>

          {/* Description */}
          <section>
            <h3 className="text-lg font-semibold text-black dark:text-white mb-3">What is Nelson-GPT?</h3>
            <div className="space-y-3 text-black/80 dark:text-white/80">
              <p>
                Nelson-GPT is an evidence-based pediatric medical assistant powered by the comprehensive Nelson Textbook
                of Pediatrics. Our AI system provides accurate, up-to-date medical information to support healthcare
                professionals in pediatric care.
              </p>
              <p>
                Using advanced retrieval-augmented generation (RAG) technology, Nelson-GPT searches through the entire
                Nelson Textbook to provide contextually relevant answers with proper citations and page references.
              </p>
            </div>
          </section>

          {/* Data Sources */}
          <section>
            <h3 className="text-lg font-semibold text-black dark:text-white mb-3">Data Sources</h3>
            <div className="space-y-2">
              <div className="p-3 rounded-lg border border-black/10 dark:border-[#333333]">
                <p className="font-medium text-black dark:text-white">Nelson Textbook of Pediatrics</p>
                <p className="text-sm text-black/70 dark:text-white/70">
                  The authoritative reference for pediatric medicine
                </p>
              </div>
            </div>
          </section>

          {/* Important Disclaimers */}
          <section>
            <h3 className="text-lg font-semibold text-black dark:text-white mb-3">Important Disclaimers</h3>
            <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <div className="space-y-2 text-sm">
                <p className="font-medium text-yellow-800 dark:text-yellow-200">Medical Disclaimer</p>
                <p className="text-yellow-700 dark:text-yellow-300">
                  Nelson-GPT is designed to assist healthcare professionals and should not replace clinical judgment.
                  Always consult with qualified medical professionals for patient care decisions.
                </p>
                <p className="text-yellow-700 dark:text-yellow-300">
                  This tool is for educational and reference purposes only and should not be used as the sole basis for
                  medical decisions.
                </p>
              </div>
            </div>
          </section>

          {/* Links */}
          <section>
            <h3 className="text-lg font-semibold text-black dark:text-white mb-3">Links</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-between border-black dark:border-[#333333] text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 bg-transparent"
              >
                Privacy Policy
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="w-full justify-between border-black dark:border-[#333333] text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 bg-transparent"
              >
                Terms of Service
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
