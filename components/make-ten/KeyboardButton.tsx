import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface KeyboardButtonProps extends React.ComponentProps<typeof Button> {
  active?: boolean;
}

/**
 * Custom keyboard button component for the calculator interface
 */
const KeyboardButton = React.forwardRef<HTMLButtonElement, KeyboardButtonProps>(
  ({ className, active, ...props }, ref) => (
    <Button
      ref={ref}
      variant={active ? "default" : "outline"}
      className={cn(
        "h-12 w-12 text-base font-semibold transition-all md:h-14 md:w-14 md:text-lg",
        active && "bg-primary text-primary-foreground",
        className
      )}
      {...props}
    />
  )
);

KeyboardButton.displayName = "KeyboardButton";

export default KeyboardButton;
