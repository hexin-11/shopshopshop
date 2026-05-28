export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: ["class"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Geist", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "ui-monospace", "monospace"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
          border: "var(--secondary-border)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        constructive: {
          DEFAULT: "var(--constructive)",
          foreground: "var(--constructive-foreground)",
        },
        caution: {
          DEFAULT: "var(--caution)",
          foreground: "var(--caution-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        brand: {
          50: "#EEF4FF",
          100: "#E0EAFF",
          500: "#4F6EF7",
          600: "#3F5FE0",
          700: "#3049B4"
        },
        siter: {
          bg: "#171719",
          card: "#222225",
          blue: "#2F80ED",
          blueHover: "#1366D6",
          bluePale: "#e1edfc", // siter.io's pale blue hover
        }
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
      },
      boxShadow: {
        soft: "0 10px 24px rgba(15, 23, 42, 0.06)",
        diffuse: "0 20px 60px -15px rgba(0,0,0,0.4)",
      },
      letterSpacing: {
        tighter: '-0.032em',
        tight: '-0.02em',
      },
      animation: {
        shimmer: "shimmer 1.8s infinite linear",
        "fade-in": "fadeIn 0.3s ease-out both",
        "slide-up": "slideUp 0.3s cubic-bezier(0.16,1,0.3,1) both",
      },
      keyframes: {
        shimmer: {
          "0%":   { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
    }
  },
  plugins: []
};
