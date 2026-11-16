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
          slate: "#64748B",
          border: "#E2E8F0",
          card: "#FFFFFF",
          surface: "#F8FAFC",
        },
        ev: {
          available: "#10B981", // green
          "available-bg": "#ECFDF5",
          charging: "#1463FF", // electric blue
          "charging-bg": "#EFF6FF",
          offline: "#94A3B8", // slate grey
          "offline-bg": "#F1F5F9",
          maintenance: "#F59E0B", // amber
          "maintenance-bg": "#FFFBEB",
          faulted: "#EF4444", // red
          "faulted-bg": "#FEF2F2",
        }
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(16, 35, 63, 0.05), 0 1px 2px -1px rgba(16, 35, 63, 0.05)",
        "card-hover": "0 4px 6px -1px rgba(16, 35, 63, 0.08), 0 2px 4px -2px rgba(16, 35, 63, 0.08)",
        dropdown: "0 10px 15px -3px rgba(16, 35, 63, 0.1), 0 4px 6px -4px rgba(16, 35, 63, 0.1)",
      }
    },
  },
  plugins: [],
};
