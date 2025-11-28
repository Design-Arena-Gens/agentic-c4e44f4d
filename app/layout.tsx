import type { Metadata } from "next";
import "./globals.css";
import Providers from "../components/providers";

export const metadata: Metadata = {
  title: "Expert POS — Role-Aware Sales Platform",
  description:
    "Enterprise-grade point of sale with role-based security implemented by AI."
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" className="bg-slate-950">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
};

export default RootLayout;
