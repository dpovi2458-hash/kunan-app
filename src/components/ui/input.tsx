import * as React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const inputBase =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-[#0057FF] focus:ring-2 focus:ring-[#0057FF]/20 disabled:cursor-not-allowed disabled:opacity-60";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={twMerge(clsx(inputBase, className))}
      {...props}
    />
  )
);
Input.displayName = "Input";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={twMerge(
      clsx(
        "min-h-[140px] w-full resize-none rounded-3xl border border-slate-200 bg-white px-4 py-4 text-base text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-[#0057FF] focus:ring-2 focus:ring-[#0057FF]/20 disabled:cursor-not-allowed disabled:opacity-60",
        className
      )
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Input, Textarea };
