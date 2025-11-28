'use client';

import { ReactNode } from "react";
import { clsx } from "clsx";

interface CardProps {
  className?: string;
  children: ReactNode;
}

const Card = ({ className, children }: CardProps) => {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/40 backdrop-blur",
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;
