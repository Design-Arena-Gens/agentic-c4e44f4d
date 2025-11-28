'use client';

import { forwardRef, InputHTMLAttributes } from "react";
import { clsx } from "clsx";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={clsx(
          "w-full rounded-lg border bg-slate-900 px-4 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-accent focus:ring-2 focus:ring-accent/40",
          hasError && "border-danger focus:border-danger focus:ring-danger/40",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;
