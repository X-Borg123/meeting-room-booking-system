import { DayPicker } from 'react-day-picker'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

function Calendar({ className, classNames, showOutsideDays = true, ...props }) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        root: 'w-full',
        months: 'flex flex-col',
        month: 'space-y-4',
        month_caption: 'relative flex items-center justify-center pt-1',
        caption_label: 'text-sm font-medium',
        nav: 'flex items-center gap-1',
        button_previous: cn(
          buttonVariants({ variant: 'ghost', size: 'icon-xs' }),
          'absolute left-1 top-1 opacity-70 hover:opacity-100'
        ),
        button_next: cn(
          buttonVariants({ variant: 'ghost', size: 'icon-xs' }),
          'absolute right-1 top-1 opacity-70 hover:opacity-100'
        ),
        month_grid: 'w-full border-collapse',
        weekdays: 'grid grid-cols-7',
        weekday: 'text-muted-foreground rounded-md text-[0.8rem] font-normal',
        week: 'mt-2 grid grid-cols-7',
        day: 'h-9 w-9 p-0 text-center text-sm',
        day_button:
          'h-9 w-9 rounded-md p-0 font-normal transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50',
        selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
        today: 'bg-accent text-accent-foreground',
        outside: 'text-muted-foreground opacity-50',
        disabled: 'text-muted-foreground opacity-50',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ className: iconClassName, orientation }) => {
          const Icon = orientation === 'left' ? ChevronLeft : ChevronRight
          return <Icon className={cn('size-4', iconClassName)} />
        },
      }}
      {...props}
    />
  )
}

export { Calendar }
