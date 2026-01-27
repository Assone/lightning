import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const fallbackTheme = "light" as const;

const themeOptions = ["light", "dark", "system"] as const;

const themeLabelMap: Record<(typeof themeOptions)[number], string> = {
  light: "Light",
  dark: "Dark",
  system: "Auto",
};

type ThemeOption = (typeof themeOptions)[number];

const isThemeOption = (value: string): value is ThemeOption => {
  return themeOptions.some((option) => option === value);
};

export const ThemeToggle = () => {
  const { resolvedTheme, setTheme, theme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const activeTheme = useMemo<ThemeOption>(() => {
    if (!isMounted) {
      return fallbackTheme;
    }

    const candidate = theme ?? resolvedTheme ?? fallbackTheme;
    return isThemeOption(candidate) ? candidate : fallbackTheme;
  }, [isMounted, resolvedTheme, theme]);

  const resolvedMode = resolvedTheme ?? fallbackTheme;
  const buttonLabel =
    resolvedMode === "dark" ? "Switch theme (dark)" : "Switch theme (light)";

  const themeIcon = resolvedMode === "dark" ? Sun : Moon;
  const ButtonIcon = !isMounted || theme !== "system" ? themeIcon : Monitor;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={buttonLabel}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <ButtonIcon aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={activeTheme}
          onValueChange={(value) => setTheme(value)}
        >
          {themeOptions.map((option) => (
            <DropdownMenuRadioItem key={option} value={option}>
              {themeLabelMap[option]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
