import * as React from "react"
import { CheckCircle, X, AlertCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface CenteredNotificationProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  type?: "success" | "error" | "info" | "warning"
  duration?: number
}

export function CenteredNotification({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  type = "success",
  duration = 3000 
}: CenteredNotificationProps) {
  React.useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isOpen, duration, onClose])

  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-6 w-6 text-green-600" />
      case "error":
        return <AlertCircle className="h-6 w-6 text-red-600" />
      case "warning":
        return <AlertCircle className="h-6 w-6 text-yellow-600" />
      case "info":
        return <Info className="h-6 w-6 text-blue-600" />
      default:
        return <CheckCircle className="h-6 w-6 text-green-600" />
    }
  }

  const getStyles = () => {
    switch (type) {
      case "success":
        return "border-green-200 bg-green-50"
      case "error":
        return "border-red-200 bg-red-50"
      case "warning":
        return "border-yellow-200 bg-yellow-50"
      case "info":
        return "border-blue-200 bg-blue-50"
      default:
        return "border-green-200 bg-green-50"
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={cn(
        "relative bg-white rounded-lg border-2 shadow-2xl p-6 max-w-md w-full mx-4 animate-in fade-in-0 zoom-in-95 duration-200",
        getStyles()
      )}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-gray-600">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {duration > 0 && (
          <div className="mt-4 w-full bg-gray-200 rounded-full h-1">
            <div 
              className={cn(
                "h-1 rounded-full",
                type === "success" ? "bg-green-600" :
                type === "error" ? "bg-red-600" :
                type === "warning" ? "bg-yellow-600" :
                "bg-blue-600"
              )}
              style={{
                width: "100%",
                animation: `progressShrink ${duration}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>

      {/* Add keyframes style to document head */}
      {isOpen && (
        <style>
          {`
            @keyframes progressShrink {
              from { width: 100%; }
              to { width: 0%; }
            }
          `}
        </style>
      )}
    </div>
  )
}

// Hook to use centered notifications
export function useCenteredNotification() {
  const [notification, setNotification] = React.useState<{
    isOpen: boolean
    title: string
    description?: string
    type?: "success" | "error" | "info" | "warning"
    duration?: number
  }>({
    isOpen: false,
    title: "",
    description: "",
    type: "success",
    duration: 3000
  })

  const showNotification = React.useCallback((params: {
    title: string
    description?: string
    type?: "success" | "error" | "info" | "warning"
    duration?: number
  }) => {
    setNotification({
      isOpen: true,
      ...params
    })
  }, [])

  const hideNotification = React.useCallback(() => {
    setNotification(prev => ({ ...prev, isOpen: false }))
  }, [])

  const NotificationComponent = React.useCallback(() => (
    <CenteredNotification
      isOpen={notification.isOpen}
      onClose={hideNotification}
      title={notification.title}
      description={notification.description}
      type={notification.type}
      duration={notification.duration}
    />
  ), [notification, hideNotification])

  return {
    showNotification,
    hideNotification,
    NotificationComponent
  }
}