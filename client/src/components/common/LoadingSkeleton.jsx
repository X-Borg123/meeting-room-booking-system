const LoadingSkeleton = ({ rows = 5 }) => {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="h-4 bg-slate-200 rounded w-1/4" />
          <div className="h-4 bg-slate-200 rounded w-1/3" />
          <div className="h-4 bg-slate-200 rounded w-1/5" />
          <div className="h-4 bg-slate-200 rounded w-1/6" />
        </div>
      ))}
    </div>
  )
}

export default LoadingSkeleton
