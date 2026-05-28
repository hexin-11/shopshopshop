export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ["Geist", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "ui-monospace", "monospace"],
      },
      colors: {
        siter: {
          bg: "#171719",
          card: "#222225",
          blue: "#2F80ED",
          blueHover: "#1366D6",
          bluePale: "#e1edfc", // siter.io's pale blue hover
        }
      },
      boxShadow: {
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
