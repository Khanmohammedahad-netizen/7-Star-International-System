"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { AppButton } from "@/components/primitives/AppButton"
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from "@/components/primitives/Dropdown"

export function ModeToggle() {
  const { setTheme } = useTheme()

  return (
    <Dropdown>
      <DropdownTrigger asChild>
        <AppButton variant="ghost" size="sm" className="w-9 px-0">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </AppButton>
      </DropdownTrigger>
      <DropdownContent align="end">
        <DropdownItem onClick={() => setTheme("light")}>
          Light
        </DropdownItem>
        <DropdownItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownItem>
        <DropdownItem onClick={() => setTheme("system")}>
          System
        </DropdownItem>
      </DropdownContent>
    </Dropdown>
  )
}
