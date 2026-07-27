import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-[var(--background)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--fg-strong)] text-[var(--background)] hover:opacity-90 shadow-sm",
        gradient:
          "brand-gradient text-white shadow-lg shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50",
        outline:
          "border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--fg-strong)] hover:bg-[var(--surface-muted)]",
        ghost:
          "text-[var(--foreground)] hover:bg-[var(--surface-muted)] hover:text-[var(--fg-strong)]",
        destructive:
          "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
        muted:
          "bg-[var(--surface-muted)] text-[var(--foreground)] hover:bg-[var(--border)]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-11 px-6 text-sm",
        icon: "h-9 w-9",
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
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { buttonVariants };
