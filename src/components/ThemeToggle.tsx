import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Leaf, Palette } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Theme = "dark" | "light" | "green";

function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem("theme") as Theme;
    if (stored === "dark" || stored === "light" || stored === "green") return stored;
  } catch {
    // ignore
  }
  // По умолчанию темная тема
  return "dark";
}

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    return getInitialTheme();
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "light", "green");
    root.classList.add(theme);
    try { localStorage.setItem("theme", theme); } catch {}
  }, [theme]);

  const getThemeIcon = () => {
    switch (theme) {
      case "light": return <Sun className="h-5 w-5" />;
      case "green": return <Leaf className="h-5 w-5" />;
      default: return <Moon className="h-5 w-5" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Change theme"
          className="shrink-0"
        >
          {getThemeIcon()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer">
          <Moon className="h-4 w-4 mr-2" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer">
          <Sun className="h-4 w-4 mr-2" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("green")} className="cursor-pointer">
          <Leaf className="h-4 w-4 mr-2" />
          <span>Green</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeToggle;


