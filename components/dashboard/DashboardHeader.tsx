import { Badge } from "@/components/ui/badge"

interface DashboardHeaderProps {
  title: string
  description?: string
  badge?: string
  children?: React.ReactNode
}

export default function DashboardHeader({ 
  title, 
  description, 
  badge, 
  children 
}: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between space-y-2">
      <div className="space-y-2">
        <div className="flex items-center space-x-3">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {title}
          </h1>
          {badge && (
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
              {badge}
            </Badge>
          )}
        </div>
        {description && (
          <p className="text-muted-foreground max-w-3xl">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex items-center space-x-2">
          {children}
        </div>
      )}
    </div>
  )
}
