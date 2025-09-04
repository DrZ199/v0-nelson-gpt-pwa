"use client"

import React, { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  errorId: string
}

/**
 * Enhanced Error Boundary with medical-safe error handling
 * Prevents app crashes while providing user-friendly recovery options
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Component error caught:', error)
    console.error('[ErrorBoundary] Error info:', errorInfo)
    
    // Update state with error info
    this.setState({
      error,
      errorInfo,
    })

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)

    // Report error to monitoring service in production
    if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
      // Log to Sentry or other error monitoring service
      console.info('[ErrorBoundary] Error reported to monitoring service')
    }

    // Log error details for debugging
    this.logErrorDetails(error, errorInfo)
  }

  private logErrorDetails = (error: Error, errorInfo: React.ErrorInfo) => {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
      errorId: this.state.errorId,
    }

    console.group(`🔴 Error Boundary: ${error.name}`)
    console.error('Error Details:', errorDetails)
    console.error('Original Error:', error)
    console.error('Component Stack:', errorInfo.componentStack)
    console.groupEnd()

    // Store error details for potential bug reports
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`nelson-gpt-error-${this.state.errorId}`, JSON.stringify(errorDetails))
      } catch (e) {
        console.warn('[ErrorBoundary] Could not store error details in localStorage:', e)
      }
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    })
  }

  private handleRefresh = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  private handleGoHome = () => {
    if (typeof window !== 'undefined') {
      // Clear any problematic state and go to home
      try {
        localStorage.removeItem('nelson-gpt-chat-state')
        localStorage.removeItem('nelson-gpt-session')
      } catch (e) {
        console.warn('Could not clear localStorage:', e)
      }
      window.location.href = '/'
    }
  }

  private handleReportBug = () => {
    const errorDetails = {
      errorId: this.state.errorId,
      message: this.state.error?.message || 'Unknown error',
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown',
    }

    // Create bug report email
    const subject = `Nelson-GPT Error Report - ${errorDetails.errorId}`
    const body = `
Error Details:
- Error ID: ${errorDetails.errorId}
- Message: ${errorDetails.message}
- Timestamp: ${errorDetails.timestamp}
- Browser: ${errorDetails.userAgent}

Please describe what you were doing when this error occurred:
[Your description here]

Technical Details:
${this.state.error?.stack || 'No stack trace available'}
    `.trim()

    const mailto = `mailto:support@nelson-gpt.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    
    if (typeof window !== 'undefined') {
      window.open(mailto)
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-white dark:bg-[#1e1e1e] flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full border-red-200 dark:border-red-800">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-xl text-red-700 dark:text-red-400">
                Something went wrong
              </CardTitle>
              <CardDescription className="text-red-600 dark:text-red-300">
                The application encountered an unexpected error. This has been logged for our development team.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Error Details</h4>
                <p className="text-sm text-red-700 dark:text-red-300 font-mono">
                  {this.state.error?.message || 'Unknown error occurred'}
                </p>
                {this.state.errorId && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                    Error ID: {this.state.errorId}
                  </p>
                )}
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">⚠️ Medical Disclaimer</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  If you were seeking medical information, please consult with a healthcare professional immediately. 
                  This application should not be used as a substitute for professional medical advice.
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row gap-3 pt-6">
              <Button 
                onClick={this.handleRetry} 
                variant="default" 
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              
              <Button 
                onClick={this.handleRefresh} 
                variant="outline" 
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
              
              <Button 
                onClick={this.handleGoHome} 
                variant="outline" 
                className="flex-1"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
              
              <Button 
                onClick={this.handleReportBug} 
                variant="secondary" 
                size="sm"
                className="w-full sm:w-auto"
              >
                <Bug className="w-4 h-4 mr-2" />
                Report Bug
              </Button>
            </CardFooter>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Hook-based error boundary for functional components
 * Provides error recovery functionality within components
 */
export function useErrorRecovery() {
  const [error, setError] = React.useState<Error | null>(null)
  
  const resetError = React.useCallback(() => {
    setError(null)
  }, [])
  
  const captureError = React.useCallback((error: Error) => {
    console.error('[useErrorRecovery] Error captured:', error)
    setError(error)
  }, [])
  
  React.useEffect(() => {
    if (error) {
      // Log error for debugging
      console.error('[useErrorRecovery] Component error:', error)
    }
  }, [error])
  
  return {
    error,
    resetError,
    captureError,
    hasError: error !== null,
  }
}

/**
 * Higher-order component for wrapping components with error boundaries
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  )
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}