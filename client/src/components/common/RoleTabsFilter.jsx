import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const RoleTabsFilter = ({ value, onValueChange, className = 'w-full sm:w-64' }) => {
  return (
    <Tabs value={value} onValueChange={onValueChange}>
      <TabsList className={className}>
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="owner">Owner</TabsTrigger>
        <TabsTrigger value="user">User</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

export default RoleTabsFilter
