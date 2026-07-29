import { Calendar } from 'lucide-react'

const EmptyState = ({ icon: Icon = Calendar, title, description }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <Icon size={24} className="text-slate-400" />
      </div>
      <h3 className="text-sm font-medium text-slate-700">{title}</h3>
      {description && (
        <p className="text-sm text-slate-400 mt-1 max-w-sm">{description}</p>
      )}
    </div>
  )
}

export default EmptyState
