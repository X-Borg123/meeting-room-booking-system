import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "group/alert relative w-full rounded-lg border px-4 py-3 text-sm has-[>svg]:grid has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-3 has-[>svg]:gap-y-1 [&>svg]:text-current [&>svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props} />
  );
}

function AlertTitle({
  className,
  ...props
}) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "mb-1 font-medium leading-none tracking-tight",
        className
      )}
      {...props} />
  );
}

function AlertDescription({
  className,
  ...props
}) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-sm text-muted-foreground [&_p]:leading-relaxed",
        className
      )}
      {...props} />
  );
}

function AlertAction({
  className,
  ...props
}) {
  return (
    <div
      data-slot="alert-action"
      className={cn("absolute top-3 right-3", className)}
      {...props} />
  );
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
