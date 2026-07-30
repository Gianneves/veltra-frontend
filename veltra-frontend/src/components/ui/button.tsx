import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md font-[700] text-sm tracking-[0.05em] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
          variant === "primary" &&
            "bg-primary text-on-primary hover:brightness-110 shadow-sm",
          variant === "ghost" &&
            "bg-transparent text-on-surface hover:bg-surface-container-high",
          variant === "outline" &&
            "border border-outline bg-transparent text-on-surface hover:bg-surface-container",
          size === "sm" && "px-3 py-1.5 text-xs",
          size === "md" && "px-5 py-2.5 text-sm",
          size === "lg" && "px-7 py-3 text-base",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, type ButtonProps };
