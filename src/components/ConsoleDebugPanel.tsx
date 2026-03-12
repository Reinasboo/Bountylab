import { useState, useEffect } from 'react'
import { X, ChevronDown, ChevronUp } from 'lucide-react'

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

  useEffect(() => {
    // Capture console.log
    const originalLog = console.log
    console.log = (...args) => {
      originalLog(...args)
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')
      
      setLogs(prev => [...prev, {
        level: 'log',
        message,
        timestamp: new Date().toLocaleTimeString(),
        data: args[0],
      }])
    }

    // Capture console.error
    const originalError = console.error
    console.error = (...args) => {
      originalError(...args)
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')
      
      setLogs(prev => [...prev, {
        level: 'error',
        message,
        timestamp: new Date().toLocaleTimeString(),
        data: args[0],
      }])
    }

    // Capture console.warn
    const originalWarn = console.warn
    console.warn = (...args) => {
      originalWarn(...args)
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')
      
      setLogs(prev => [...prev, {
        level: 'warn',
        message,
        timestamp: new Date().toLocaleTimeString(),
        data: args[0],
      }])
    }

    return () => {
      console.log = originalLog
      console.error = originalError
      console.warn = originalWarn
    }
  }, [])

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-primary/90 hover:bg-primary text-white px-3 py-2 rounded-lg shadow-lg text-sm font-semibold z-50 transition"
        title="Click to open console debug panel"
      >
        📊 Debug Console ({logs.length})
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-96 max-h-96 flex flex-col z-50 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-800">
        <h3 className="font-bold text-sm">🐛 Console Debug Panel</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-gray-700 p-1 rounded text-xs"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-gray-700 p-1 rounded text-xs"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Logs */}
      {!isMinimized && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-900 font-mono text-xs">
          {logs.length === 0 ? (
            <div className="text-gray-500">Waiting for console output...</div>
          ) : (
            logs.map((log, idx) => (
              <div
                key={idx}
                className={`py-1 px-2 rounded ${
                  log.level === 'error'
                    ? 'bg-red-900/30 text-red-300'
                    : log.level === 'warn'
                    ? 'bg-yellow-900/30 text-yellow-300'
                    : 'bg-gray-800 text-gray-300'
                }`}
              >
                <div className="flex gap-2">
                  <span className="text-gray-500 flex-shrink-0">[{log.timestamp}]</span>
                  <span className="flex-shrink-0">
                    {log.level === 'error' ? '❌' : log.level === 'warn' ? '⚠️' : 'ℹ️'}
                  </span>
                </div>
                <div className="whitespace-pre-wrap break-all mt-1">{log.message}</div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Clear Button */}
      <div className="p-2 border-t border-gray-700 bg-gray-800">
        <button
          onClick={() => setLogs([])}
          className="w-full bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs font-semibold transition"
        >
          Clear Logs
        </button>
      </div>
    </div>
  )
}
