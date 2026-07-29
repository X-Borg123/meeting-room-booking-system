import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-slate-200">404</h1>
        <p className="text-lg text-slate-600">Page not found</p>
        <Link to="/dashboard">
          <Button variant="outline">
            <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
