/**
 * UPDATE SKIPPED
 *
 * Reason:
 * Local customizations detected
 *
 * Upstream changes:
 * None (Custom component)
 *
 * Manual review recommended.
 */
import { cn } from "@/lib/utils"
import { SpinnerIcon } from "@phosphor-icons/react"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <SpinnerIcon role="status" aria-label="Loading" className={cn("size-4 animate-spin", className)} {...props} />
  )
}

export { Spinner }
