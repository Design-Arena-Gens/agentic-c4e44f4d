'use client';

import { LabelHTMLAttributes } from "react";
import { clsx } from "clsx";

const Label = ({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) => {
  return (
    <label
      className={clsx(
        "block text-sm font-medium text-slate-300",
        className
      )}
      {...props}
    />
  );
};

export default Label;
