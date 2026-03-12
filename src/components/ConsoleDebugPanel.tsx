import { useState, useEffect, useRef } from 'react'
import { X, ChevronDown, ChevronUp, Copy } from 'lucide-react'

interface LogEntry {
  level: 'log' | 'error' | 'warn' | 'info'
  message: string
  timestamp: string
  data?: unknown
}

// Global log queue for capturing before React mounts
const globalLogQueue: LogEntry[] = []

export function ConsoleDebugPanel() {
  const [logs, setLogs] = useState<LogEntry[]>(globalLogQueue)
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const logsEndRef = useRef<HTMLDivElement>(null)
  const logQueueRef = useRef(logs)

  useEffect(() => {
    logQueueRef.current = logs
  }, [logs])

  useEffect(() => {
    // Store original console methods
    const originalLog = console.log
    const originalError = console.error
    const originalWarn = console.warn
    const originalInfo = console.info

    const addLog = (level: 'log' | 'error' | 'warn' | 'info', ...args: any[]) => {
      const message = args
        .map(arg => {
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg, null, 2)
            } catch (e) {
              return String(arg)
            }
          }
          return String(arg)
        })
        .join(' ')
        .substring(0, level === 'error' ? 2000 : 800)

      const entry: LogEntry = {
        level,
        message,
        timestamp: new Date().toLocaleTimeString(),
        data: args[0],
      }

      setLogs(prev => {
        const updated = [...prev, entry]
        // Keep max 100 logs to avoid memory issues
        return updated.slice(-100)
      })

      // Auto-open on error with slight delay
      if (level === 'error') {
        setTimeout(() => setIsOpen(true), 100)
      }
    }

    // Intercept console.log
    console.log = function(...args: any[]) {
      originalLog.apply(console, args)
      addLog('log', ...args)
    }

    // Intercept console.error
    console.error = function(...args: any[]) {
      originalError.apply(console, args)
      addLog('error', ...args)
    }

    // Intercept console.warn
    console.warn = function(...args: any[]) {
      originalWarn.apply(console, args)
      addLog('warn', ...args)
    }

    // Intercept console.info
    console.info = function(...args: any[]) {
      originalInfo.apply(console, args)
      addLog('info', ...args)
    }

    // Add startup message
    originalLog.call(console, '✅ Debug Panel Initialized')

    return () => {
      // Restore original methods
      console.log = originalLog
      console.error = originalError
      console.warn = originalWarn
      console.info = originalInfo
    }
  }, [])

  // Auto-scroll to latest log
  useEffect(() => {
    if (isOpen && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'auto' })
    }
  }, [logs, isOpen])

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-bold z-50 transition-all hover:scale-105"
        title="Open console debug panel"
      >
        📊 Logs ({logs.length})
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-slate-900 border-2 border-slate-700 rounded-xl shadow-2xl w-[500px] max-h-[500px] flex flex-col z-50 text-white font-mono text-xs overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-700 bg-slate-800 rounded-t-lg flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">🐛</span>
          <h3 className="font-bold text-sm">Console Logs</h3>
          <span className="text-slate-400 text-[11px]">({logs.length})</span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => {
              const logText = logs.map(l => `[${l.timestamp}] ${l.message}`).join('\n')
              navigator.clipboard.writeText(logText)
              alert('Copied!')
            }}
            className="hover:bg-slate-700 p-1.5 rounded transition"
            title="Copy logs"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-slate-700 p-1.5 rounded transition"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-slate-700 p-1.5 rounded transition"
            title="Close"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Logs Container */}
      {!isMinimized && (
        <div className="flex-1 overflow-y-auto bg-slate-950 p-2 space-y-1">
          {logs.length === 0 ? (
            <div className="text-slate-500 py-8 text-center text-[11px]">Waiting for logs...</div>
          ) : (
            <>
              {logs.map((log, idx) => {
                let bgColor = 'bg-slate-900/40 border-slate-600 text-slate-300'
                if (log.level === 'error') {
                  bgColor = 'bg-red-950/60 border-red-700 text-red-200'
                } else if (log.level === 'warn') {
                  bgColor = 'bg-yellow-950/60 border-yellow-700 text-yellow-200'
                } else if (log.level === 'info') {
                  bgColor = 'bg-blue-950/60 border-blue-700 text-blue-200'
                }

                return (
                  <div
                    key={idx}
                    className={`py-1.5 px-2 rounded border-l-2 ${bgColor} break-words`}
                  >
                    <div className="text-[10px] text-slate-400 mb-0.5">
                      [{log.timestamp}]{' '}
                      {log.level === 'error'
                        ? '❌'
                        : log.level === 'warn'
                        ? '⚠️'
                        : log.level === 'info'
                        ? 'ℹ️'
                        : '✓'}
                    </div>
                    <div className="whitespace-pre-wrap text-[11px] leading-tight">
                      {log.message}
                    </div>
                  </div>
                )
              })}
              <div ref={logsEndRef} className="h-0" />
            </>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="p-2 border-t border-slate-700 bg-slate-800 rounded-b-lg flex-shrink-0 flex gap-2">
        <button
          onClick={() => setLogs([])}
          className="flex-1 bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-[11px] font-semibold transition"
        >
          Clear
        </button>
      </div>
    </div>
  )
}
