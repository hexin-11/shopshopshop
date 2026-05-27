export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EEF4FF",
          100: "#E0EAFF",
          500: "#4F6EF7",
          600: "#3F5FE0",
          700: "#3049B4"
        }
      },
      boxShadow: { soft: "0 10px 24px rgba(15, 23, 42, 0.06)" }
    }
  },
  plugins: []
};
