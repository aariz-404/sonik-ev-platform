/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#10233F",
          "navy-dark": "#0B182B",
          "navy-light": "#1A3256",
          blue: "#1463FF",
          "blue-hover": "#0F52D9",
          "blue-subtle": "#EEF4FF",
          surface: "#F3F6FB",
          card: "#FFFFFF",
          border: "#E2E8F0",
        },
        ev: {
          available: "#10B981", // Green for Available
          "available-bg": "#ECFDF5",
          charging: "#F97316", // Orange for Charging
          "charging-bg": "#FFF7ED",
          offline: "#EF4444", // Red for Offline
          "offline-bg": "#FEF2F2",
          maintenance: "#F59E0B", // Amber for Maintenance
          "maintenance-bg": "#FFFBEB",
        }
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(16, 35, 63, 0.05), 0 1px 2px -1px rgba(16, 35, 63, 0.05)",
        "card-hover": "0 6px 12px -2px rgba(16, 35, 63, 0.08), 0 3px 6px -2px rgba(16, 35, 63, 0.06)",
        modal: "0 20px 25px -5px rgba(16, 35, 63, 0.15), 0 8px 10px -6px rgba(16, 35, 63, 0.1)",
      }
    },
  },
  plugins: [],
};
