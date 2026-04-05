"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import { Button } from "./ui/button"
import { IconMoon, IconSun } from "@tabler/icons-react"

function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      <ThemeHotkey />
      {children}
    </NextThemesProvider>
  )
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

function ThemeToggleButton() {
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <Button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        fontSize: "1.2em",
        padding: 4,
        marginLeft: 8,
      }}
    >
      {resolvedTheme === "dark" ? <IconMoon/> : <IconSun/>}
    </Button>
  )
}

// PATCH: Fix ThemeHotkey to use Ctrl+D only
function ThemeHotkey() {
  const { resolvedTheme, setTheme } = useTheme()

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
        if (event.defaultPrevented || event.repeat) {
          return;
        }
        // Only toggle on Ctrl+D (not just D), and NOT if metaKey (Cmd on Mac) is pressed
        if (
          event.key.toLowerCase() !== "d" ||
          !event.ctrlKey ||
          event.metaKey ||
          event.altKey
        ) {
          return;
        }
        // Prevent browser bookmark if not in input
        if (!isTypingTarget(event.target)) {
          event.preventDefault();
          setTheme(resolvedTheme === "dark" ? "light" : "dark");
        }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [resolvedTheme, setTheme])

  return null
}

export { ThemeProvider }
