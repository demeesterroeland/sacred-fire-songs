import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Button (component sheet, Story 6.1.1 / G1.1, #385). Semantic tokens only.
 * - primary/default: accent fill — at most one per screen.
 * - secondary: grey fill. outline: grey border. ghost: no fill. text: accent text.
 * - destructive: danger fill; always with a text label.
 * All sizes are at least 44 px high (touch target).
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control text-body font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-accent text-on-accent hover:bg-accent/90",
        primary: "bg-accent text-on-accent hover:bg-accent/90",
        destructive: "bg-danger text-on-danger hover:bg-danger/90",
        outline: "border border-line-strong bg-transparent text-fg hover:bg-surface-2",
        secondary: "bg-surface-2 text-fg hover:bg-surface-2/80",
        ghost: "text-fg hover:bg-surface-2",
        text: "text-accent underline-offset-4 hover:underline",
        link: "text-accent underline-offset-4 hover:underline",
      },
      size: {
        default: "min-h-tap px-4 py-2",
        sm: "min-h-tap px-3 text-meta",
        lg: "min-h-12 px-6",
        icon: "size-tap",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
