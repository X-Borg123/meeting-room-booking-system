import TitleCountBadge from './TitleCountBadge'
import { CardTitle } from '@/components/ui/card'

const TableSectionHeader = ({
  title,
  count,
  countLabel,
  filters,
  className = 'flex flex-col gap-3 space-y-0 pb-4 sm:flex-row sm:items-center sm:justify-between',
}) => {
  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <TitleCountBadge count={count} label={countLabel} />
      </div>
      {filters || null}
    </div>
  )
}

export default TableSectionHeader
