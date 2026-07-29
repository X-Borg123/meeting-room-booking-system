import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const DEFAULT_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'owner', label: 'Owner' },
  { value: 'user', label: 'User' },
]

const RoleTabsFilter = ({
  value,
  onValueChange,
  className = 'w-full sm:w-64',
  options = DEFAULT_OPTIONS,
}) => {
  return (
    <Tabs value={value} onValueChange={onValueChange}>
      <TabsList className={className}>
        {options.map((option) => (
          <TabsTrigger key={option.value} value={option.value}>
            {option.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}

export default RoleTabsFilter
