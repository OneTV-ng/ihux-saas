export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    card: string;
    border: string;
    muted: string;
  };
  cssVars: {
    light: Record<string, string>;
    dark: Record<string, string>;
  };
}

export const themes: Theme[] = [
  {
    id: "default",
    name: "Default",
    description: "Classic dark theme with subtle contrast",
    colors: {
      primary: "#10b981",
      secondary: "#8b5cf6",
      accent: "#f59e0b",
      background: "#09090b",
      foreground: "#fafafa",
      card: "#18181b",
      border: "#27272a",
      muted: "#71717a",
    },
    cssVars: {
      light: {
        "--background": "0 0% 100%",
        "--foreground": "240 10% 3.9%",
        "--primary": "142.1 76.2% 36.3%",
        "--primary-foreground": "355.7 100% 97.3%",
        "--secondary": "240 4.8% 95.9%",
        "--secondary-foreground": "240 5.9% 10%",
      },
      dark: {
        "--background": "240 10% 3.9%",
        "--foreground": "0 0% 98%",
        "--primary": "142.1 70.6% 45.3%",
        "--primary-foreground": "144.9 80.4% 10%",
        "--secondary": "240 3.7% 15.9%",
        "--secondary-foreground": "0 0% 98%",
      },
    },
  },
  {
    id: "ocean",
    name: "Ocean Blue",
    description: "Deep blue theme inspired by the ocean",
    colors: {
      primary: "#0ea5e9",
      secondary: "#06b6d4",
      accent: "#3b82f6",
      background: "#0c4a6e",
      foreground: "#f0f9ff",
      card: "#075985",
      border: "#0369a1",
      muted: "#7dd3fc",
    },
    cssVars: {
      light: {
        "--background": "204 100% 97.1%",
        "--foreground": "200 100% 10%",
        "--primary": "199.4 89.1% 48.4%",
        "--primary-foreground": "204 100% 97.1%",
      },
      dark: {
        "--background": "200 100% 10%",
        "--foreground": "204 100% 97.1%",
        "--primary": "199.4 89.1% 48.4%",
        "--primary-foreground": "200 100% 10%",
      },
    },
  },
  {
    id: "sunset",
    name: "Sunset Orange",
    description: "Warm sunset colors with vibrant oranges",
    colors: {
      primary: "#f97316",
      secondary: "#fb923c",
      accent: "#fbbf24",
      background: "#7c2d12",
      foreground: "#fff7ed",
      card: "#9a3412",
      border: "#c2410c",
      muted: "#fdba74",
    },
    cssVars: {
      light: {
        "--background": "33 100% 96.5%",
        "--foreground": "20 14.3% 4.1%",
        "--primary": "24.6 95% 53.1%",
        "--primary-foreground": "60 9.1% 97.8%",
      },
      dark: {
        "--background": "20 14.3% 4.1%",
        "--foreground": "33 100% 96.5%",
        "--primary": "20.5 90.2% 48.2%",
        "--primary-foreground": "60 9.1% 97.8%",
      },
    },
  },
  {
    id: "forest",
    name: "Forest Green",
    description: "Natural green theme like a deep forest",
    colors: {
      primary: "#22c55e",
      secondary: "#84cc16",
      accent: "#a3e635",
      background: "#14532d",
      foreground: "#f0fdf4",
      card: "#166534",
      border: "#15803d",
      muted: "#86efac",
    },
    cssVars: {
      light: {
        "--background": "138.5 76.5% 96.7%",
        "--foreground": "140 10% 3.9%",
        "--primary": "142.1 76.2% 36.3%",
        "--primary-foreground": "355.7 100% 97.3%",
      },
      dark: {
        "--background": "140 60% 10%",
        "--foreground": "138.5 76.5% 96.7%",
        "--primary": "142.1 70.6% 45.3%",
        "--primary-foreground": "144.9 80.4% 10%",
      },
    },
  },
  {
    id: "royal",
    name: "Royal Purple",
    description: "Elegant purple theme with royal vibes",
    colors: {
      primary: "#a855f7",
      secondary: "#c084fc",
      accent: "#d946ef",
      background: "#581c87",
      foreground: "#faf5ff",
      card: "#6b21a8",
      border: "#7c3aed",
      muted: "#d8b4fe",
    },
    cssVars: {
      light: {
        "--background": "270 100% 98%",
        "--foreground": "280 10% 3.9%",
        "--primary": "270 91% 65.1%",
        "--primary-foreground": "0 0% 100%",
      },
      dark: {
        "--background": "280 50% 15%",
        "--foreground": "270 100% 98%",
        "--primary": "270 95.2% 75.3%",
        "--primary-foreground": "280 50% 15%",
      },
    },
  },
  {
    id: "rose",
    name: "Rose Pink",
    description: "Soft pink theme with romantic vibes",
    colors: {
      primary: "#f43f5e",
      secondary: "#fb7185",
      accent: "#fda4af",
      background: "#881337",
      foreground: "#fff1f2",
      card: "#9f1239",
      border: "#be123c",
      muted: "#fda4af",
    },
    cssVars: {
      light: {
        "--background": "0 85.7% 97.3%",
        "--foreground": "346.8 77.2% 10%",
        "--primary": "346.8 77.2% 49.8%",
        "--primary-foreground": "355.7 100% 97.3%",
      },
      dark: {
        "--background": "346.8 77.2% 20%",
        "--foreground": "0 85.7% 97.3%",
        "--primary": "346.8 77.2% 49.8%",
        "--primary-foreground": "355.7 100% 97.3%",
      },
    },
  },
  {
    id: "cyber",
    name: "Cyberpunk",
    description: "Neon cyan and magenta for a futuristic feel",
    colors: {
      primary: "#06b6d4",
      secondary: "#ec4899",
      accent: "#8b5cf6",
      background: "#0f172a",
      foreground: "#f1f5f9",
      card: "#1e293b",
      border: "#334155",
      muted: "#64748b",
    },
    cssVars: {
      light: {
        "--background": "210 40% 98%",
        "--foreground": "222.2 84% 4.9%",
        "--primary": "186.4 94% 42.5%",
        "--primary-foreground": "210 40% 98%",
      },
      dark: {
        "--background": "222.2 84% 4.9%",
        "--foreground": "210 40% 98%",
        "--primary": "186.4 94% 42.5%",
        "--primary-foreground": "222.2 84% 4.9%",
      },
    },
  },
  {
    id: "midnight",
    name: "Midnight Blue",
    description: "Deep midnight blue with silver accents",
    colors: {
      primary: "#3b82f6",
      secondary: "#60a5fa",
      accent: "#93c5fd",
      background: "#1e1b4b",
      foreground: "#e0e7ff",
      card: "#312e81",
      border: "#4338ca",
      muted: "#818cf8",
    },
    cssVars: {
      light: {
        "--background": "226 100% 97%",
        "--foreground": "226 90% 20%",
        "--primary": "217.2 91.2% 59.8%",
        "--primary-foreground": "222.2 47.4% 11.2%",
      },
      dark: {
        "--background": "226 90% 20%",
        "--foreground": "226 100% 97%",
        "--primary": "217.2 91.2% 59.8%",
        "--primary-foreground": "222.2 47.4% 11.2%",
      },
    },
  },
  {
    id: "autumn",
    name: "Autumn Leaves",
    description: "Warm autumn colors with brown and orange tones",
    colors: {
      primary: "#dc2626",
      secondary: "#ea580c",
      accent: "#f59e0b",
      background: "#451a03",
      foreground: "#fef3c7",
      card: "#78350f",
      border: "#92400e",
      muted: "#fbbf24",
    },
    cssVars: {
      light: {
        "--background": "48 96.5% 88.8%",
        "--foreground": "30 40% 10%",
        "--primary": "0 84.2% 60.2%",
        "--primary-foreground": "0 0% 98%",
      },
      dark: {
        "--background": "30 40% 10%",
        "--foreground": "48 96.5% 88.8%",
        "--primary": "0 72.2% 50.6%",
        "--primary-foreground": "0 85.7% 97.3%",
      },
    },
  },
  {
    id: "mint",
    name: "Mint Fresh",
    description: "Cool mint green for a refreshing look",
    colors: {
      primary: "#10b981",
      secondary: "#34d399",
      accent: "#6ee7b7",
      background: "#064e3b",
      foreground: "#d1fae5",
      card: "#065f46",
      border: "#047857",
      muted: "#6ee7b7",
    },
    cssVars: {
      light: {
        "--background": "151.8 80.9% 95.9%",
        "--foreground": "160 60% 10%",
        "--primary": "160 84.1% 39.4%",
        "--primary-foreground": "0 0% 100%",
      },
      dark: {
        "--background": "160 60% 15%",
        "--foreground": "151.8 80.9% 95.9%",
        "--primary": "160 84.1% 39.4%",
        "--primary-foreground": "160 60% 10%",
      },
    },
  },
  {
    id: "lavender",
    name: "Lavender Dream",
    description: "Soft lavender with purple undertones",
    colors: {
      primary: "#8b5cf6",
      secondary: "#a78bfa",
      accent: "#c4b5fd",
      background: "#4c1d95",
      foreground: "#f5f3ff",
      card: "#5b21b6",
      border: "#6d28d9",
      muted: "#c4b5fd",
    },
    cssVars: {
      light: {
        "--background": "250 100% 97.6%",
        "--foreground": "270 50% 15%",
        "--primary": "262.1 83.3% 57.8%",
        "--primary-foreground": "0 0% 100%",
      },
      dark: {
        "--background": "270 50% 20%",
        "--foreground": "250 100% 97.6%",
        "--primary": "263.4 70% 50.4%",
        "--primary-foreground": "270 50% 15%",
      },
    },
  },
  {
    id: "monochrome",
    name: "Monochrome",
    description: "Pure black and white for minimalists",
    colors: {
      primary: "#000000",
      secondary: "#404040",
      accent: "#737373",
      background: "#ffffff",
      foreground: "#000000",
      card: "#f5f5f5",
      border: "#e5e5e5",
      muted: "#737373",
    },
    cssVars: {
      light: {
        "--background": "0 0% 100%",
        "--foreground": "0 0% 0%",
        "--primary": "0 0% 0%",
        "--primary-foreground": "0 0% 100%",
      },
      dark: {
        "--background": "0 0% 0%",
        "--foreground": "0 0% 100%",
        "--primary": "0 0% 100%",
        "--primary-foreground": "0 0% 0%",
      },
    },
  },
];

export function applyTheme(themeId: string, mode: "light" | "dark" = "dark") {
  const theme = themes.find((t) => t.id === themeId);
  if (!theme) return;

  const root = document.documentElement;
  const vars = theme.cssVars[mode];

  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

export function applyCustomTheme(colors: {
  primary?: string;
  secondary?: string;
  accent?: string;
  background?: string;
}) {
  const root = document.documentElement;
  
  if (colors.primary) {
    root.style.setProperty("--primary", colors.primary);
  }
  if (colors.secondary) {
    root.style.setProperty("--secondary", colors.secondary);
  }
  if (colors.accent) {
    root.style.setProperty("--accent", colors.accent);
  }
  if (colors.background) {
    root.style.setProperty("--background", colors.background);
  }
}
