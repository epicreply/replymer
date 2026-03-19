import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";

import { cn } from "@/lib/utils";

const RadioToggle = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer inline-flex items-center gap-2 rounded-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  >
    <span className="flex h-4 w-4 items-center justify-center rounded-full border border-primary">
      <CheckboxPrimitive.Indicator className="flex items-center justify-center">
        <span className="h-2 w-2 rounded-full bg-primary" />
      </CheckboxPrimitive.Indicator>
    </span>
    {props.children}
  </CheckboxPrimitive.Root>
));
RadioToggle.displayName = "RadioToggle";

export { RadioToggle };
