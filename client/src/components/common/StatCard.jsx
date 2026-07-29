import { Card, CardContent } from '@/components/ui/card'

const StatCard = ({ icon: Icon, label, value, description }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <Icon size={20} className="text-slate-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            {description && (
              <p className="text-xs text-slate-400 mt-0.5">{description}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default StatCard
