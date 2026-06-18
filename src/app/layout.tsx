import type { Metadata } from "next";
import "./globals.css";
import { TemplateBackgroundLayer } from "../components/TemplateBackgroundLayer";

export const metadata: Metadata = {
  title: "ORTUS",
  description: "Complex systems visual modeler"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <TemplateBackgroundLayer />
        {children}
      </body>
    </html>
  );
}
