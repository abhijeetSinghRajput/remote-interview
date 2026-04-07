import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google"

import "@/app/styles/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { Providers } from "./providers";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { ApiProvider } from "@/components/ApiProvider";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        geist.variable
      )}
    >
      <body>
        <ClerkProvider>
          <ApiProvider>
            <Providers>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <TooltipProvider>
                  {children}
                  <Toaster richColors position="top-right" />
                </TooltipProvider>
              </ThemeProvider>
            </Providers>
          </ApiProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
