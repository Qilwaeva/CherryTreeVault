/**@type {import('tailwindcss').Config}*/
module.exports = {
  content: [
    "./src/app/pages/**/*.{html,ts}",
    "./src/app/components/**/*.{html,ts}",
  ],
  plugins: [require("daisyui")],
  daisyui: {
    styled: true,
    themes: [
      {
        customtheme: {
          "primary": "#5b21b6",
          "primary-content": "#dad5f4",
          "secondary": "#1d4ed8",
          "secondary-content": "#cfdefb",
          "accent": "#00ffff",
          "accent-content": "#001616",
          "neutral": "#5b21b6",
          "neutral-content": "#dad5f4",
          "base-100": "#0f0621",
          "base-200": "#374151",
          "base-300": "#d1d5db",
          "base-content": "#c9cbcf",
          "info": "#60a5fa",
          "info-content": "#030a15",
          "success": "#00ff00",
          "success-content": "#001600",
          "warning": "#f59e0b",
          "warning-content": "#150900",
          "error": "#ff0000",
          "error-content": "#160000",
          },
        },
    ]
  }
}