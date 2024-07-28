module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#F7CB46",
        secondary: "#303380",
        blue: "#4EAEFF",
        dark: "#1B1C31",
        "dark-light": "#555555",
        grey: "#E7ECEF",
        "grey-darker": "#A0A8B2",
        red: "#E30000",
        light: "#fff",
        transparent: "transparent",
      },
      screens: {
        sm: { max: "767px" },
        md: { min: "768px", max: "1023px" },
        lg: { min: "1024px", max: "1279px" },
        xl: { min: "1280px" },
      },
    },
  },
  plugins: [],
};
