import { useState, useEffect, useRef } from 'react'
import { X, ChevronDown, ChevronUp, Copy } from 'lucide-react'

interface LogEntry {
  level: 'log' | 'error' | 'warn' | 'info'
  message: string
  timestamp: string
  data?: unknown
}

export function ConsoleDebugPanel() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const logsEndRef = useRef<HTMLDivElement>(null)
  const capturedRef = useRef(false)

  useEffect(() => {
    // Only set up interception once
    if (capturedRef.current) return
    capturedRef.current = true

    // Add initial log to prove panel is working
    setLogs(prev => [...prev, {
      level: 'info',
      message: '✅ Console Debug Panel initialized',
      timestamp: new Date().toLocaleTimeString(),
    }])

    // Store original methods
    const originalLog = window.console.log
    const originalError = window.console.error
    const originalWarn = window.console.warn
    const originalInfo = window.console.info

    // Override console.log
    window.console.log = function(...args: any[]) {
      originalLog.apply(window.console, args)
      const message = args
        .map(arg => {
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg, null, 2)
            } catch {
              return String(arg)
            }
          }
          return String(arg)
        })
        .join(' ')
      
      setLogs(prev => [...prev, {
        level: 'log',
        message: message.substring(0, 500), // Limit size
        timestamp: new Date().toLocaleTimeString(),
        data: args[0],
      }])
    }

    // Override console.error
    window.console.error = function(...args: any[]) {
      originalError.apply(window.console, args)
      const message = args
        .map(arg => {
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg, null, 2)
            } catch {
              return String(arg)
            }
          }
          return String(arg)
        })
        .join(' ')
      
      setLogs(prev => [...prev, {
        level: 'error',
        message: message.substring(0, 1000), // Larger limit for errors
        timestamp: new Date().toLocaleTimeString(),
        data: args[0],
      }])
      
      // Auto-open on error
      setIsOpen(true)
    }

    // Override console.warn
    window.console.warn = function(...args: any[]) {
      originalWarn.apply(window.console, args)
      const message = args
        .map(arg => {
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg, null, 2)
            } catch {
              return String(arg)
            }
          }
          return String(arg)
        })
        .join(' ')
      
      setLogs(prev => [...prev, {
        level: 'warn',
        message: message.substring(0, 500),
        timestamp: new Date().toLocaleTimeString(),
        data: args[0],
      }])
    }

    // Override console.info
    window.console.info = function(...args: any[]) {
      originalInfo.apply(window.console, args)
      const message = args
        .map(arg => {
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg, null, 2)
            } catch {
              return String(arg)
            }
          }
          return String(arg)
        })
        .join(' ')
      
      setLogs(prev => [...prev, {
        level: 'info',
        message: message.substring(0, 500),
        timestamp: new Date().toLocaleTimeString(),
        data: args[0],
      }])
    }

    return () => {
      // Restore original methods on cleanup
      window.console.log = originalLog
      window.console.error = originalError
      window.console.warn = originalWarn
      window.console.info = originalInfo
    }
  }, [])

  // Auto-scroll to latest log
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-bold z-50 transition-all hover:scale-105"
        title="Open console debug panel"
      >
        📊 Debug Console ({logs.length})
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-slate-900 border-2 border-slate-700 rounded-xl shadow-2xl w-[500px] max-h-[500px] flex flex-col z-50 text-white font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800 rounded-t-lg sticky top-0">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-sm">🐛 Console Debug</h3>
          <span className="text-slate-400">({logs.length} logs)</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const logText = logs.map(l => `[${l.timestamp}] ${l.message}`).join('\n')
              navigator.clipboard.writeText(logText)
            }}
            className="hover:bg-slate-700 p-1.5 rounded transition"
            title="Copy all logs"
          >
            <Copy size={16} />
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-slate-700 p-1.5 rounded transition"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-slate-700 p-1.5 rounded transition"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Logs */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-950">
            {logs.length === 0 ? (
              <div className="text-slate-500 py-8 text-center">Waiting for console output...</div>
            ) : (
              <>
                {logs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`py-2 px-3 rounded border-l-2 ${
                      log.level === 'error'
                        ? 'bg-red-950/40 border-red-700 text-red-300'
                        : log.level === 'warn'
                        ? 'bg-yellow-950/40 border-yellow-700 text-yellow-300'
                        : log.level === 'info'
                        ? 'bg-blue-950/40 border-blue-700 text-blue-300'
                        : 'bg-slate-900/60 border-slate-600 text-slate-300'
                    }`}
                  >
                    <div className="flex gap-2 text-slate-500 text-[10px]">
                      <span>[{log.timestamp}]</span>
                      <span>
                        {log.level === 'error' ? '❌' : log.level === 'warn' ? '⚠️' : log.level === 'info' ? 'ℹ️' : '✓'}
                      </span>
                    </div>
                    <div className="whitespace-pre-wrap break-all mt-1 leading-tight">{log.message}</div>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </>
            )}
          </div>

          {/* Actions */}
          <div className="p-2 border-t border-slate-700 bg-slate-800 rounded-b-lg flex gap-2">
            <button
              onClick={() => setLogs([])}
              className="flex-1 bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded text-xs font-semibold transition"
            >
              Clear
            </button>
          </div>
        </>
      )}
    </div>
  )
}
