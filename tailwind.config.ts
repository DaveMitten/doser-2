import type { Config } from "tailwindcss"

const config = {
  darkMode: "class",
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Doser-specific colors
        doser: {
          // Primary colors (supports opacity)
          primary: {
            DEFAULT: '#10b981',
            hover: '#059669',
            light: 'rgba(16, 185, 129, 0.15)',
          },
          // Background colors
          background: '#0a0a0a',
          surface: {
            DEFAULT: '#111111',
            hover: '#1a1a1a',
          },
          // Legacy green colors (same as primary for compatibility)
          green: {
            DEFAULT: '#10b981',
            dark: '#059669',
            light: '#34d399',
          },
          bg: {
            primary: '#0a0a0a',
            secondary: '#141414',
            tertiary: '#1a1a1a',
          },
          border: {
            DEFAULT: 'rgba(255, 255, 255, 0.1)',
            hover: 'rgba(255, 255, 255, 0.25)',
          },
          text: {
            DEFAULT: '#ffffff',
            primary: '#e5e5e5',
            secondary: '#d4d4d4',
            muted: 'rgba(255, 255, 255, 0.6)',
            disabled: '#737373',
            subtle: '#525252',
          },
          accent: '#6366f1',
          effect: {
            positive: '#10b981',
            neutral: '#fbbf24',
            negative: '#ef4444',
            creative: '#8b5cf6',
            happy: '#ec4899',
            energetic: '#f59e0b',
            euphoric: '#10b981',
            dizzy: '#06b6d4',
          },
          thc: '#f59e0b',
          cbd: '#3b82f6',
          success: '#34d399',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "slide-up": {
          from: { transform: "translateY(4px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
      },
      backgroundImage: {
        'gradient-doser': 'linear-gradient(135deg, #10b981, #34d399)',
        'gradient-doser-dark': 'linear-gradient(135deg, #10b981, #059669)',
        'gradient-card': 'linear-gradient(145deg, #1a1a1a 0%, #141414 100%)',
      },
      boxShadow: {
        'doser-sm': '0 4px 12px rgba(16, 185, 129, 0.1)',
        'doser-md': '0 12px 24px rgba(16, 185, 129, 0.15)',
        'doser-lg': '0 20px 32px rgba(16, 185, 129, 0.2)',
        'doser-button': '0 4px 12px rgba(16, 185, 129, 0.3)',
        'doser-button-hover': '0 6px 20px rgba(16, 185, 129, 0.4)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config