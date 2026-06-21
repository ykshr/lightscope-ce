/**
 * UPDATE SKIPPED
 *
 * Reason:
 * No update available
 *
 * Upstream changes:
 * None
 *
 * Manual review recommended.
 */
import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-none bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
