import * as React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const buttonStyles = {
  base: "inline-flex items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0057FF]/40 disabled:pointer-events-none disabled:opacity-60",
  variant: {
    primary: "bg-[#0057FF] text-white shadow-[0_18px_40px_-24px_rgba(0,87,255,0.9)] hover:bg-[#0046d1]",
    secondary: "border border-slate-200 bg-white text-slate-900 hover:border-[#0057FF]/40 hover:text-[#0057FF]",
    ghost: "text-slate-500 hover:text-slate-900",
  },
  size: {
    sm: "h-10 px-4",
    md: "h-12",
    lg: "h-14 text-base",
  },
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonStyles.variant;
  size?: keyof typeof buttonStyles.size;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={twMerge(
        clsx(buttonStyles.base, buttonStyles.variant[variant], buttonStyles.size[size], className)
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button };
