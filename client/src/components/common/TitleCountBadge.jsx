const TitleCountBadge = ({ count, label }) => {
  const safeCount = Number.isFinite(count) ? count : 0

  return (
    <span className="inline-flex items-center rounded-full border border-green-200 bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
      {safeCount} {label}
    </span>
  )
}

export default TitleCountBadge
