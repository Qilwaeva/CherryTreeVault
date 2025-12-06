/**@type {import('tailwindcss').Config}*/
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./src/**/*.{html,ts}",
  ],
  plugins: [require("daisyui")],
  daisyui: {
    styled: true,
    themes: [
      {
        customtheme: {
          "primary": "#5b21b6",
          "primary-content": "#dad5f4",
          "secondary": "#9A3DE4",
          "secondary-content": "#cfdefb",
          "accent": "#00ffff",
          "accent-content": "#001616",
          "neutral": "#5b21b6",
          "neutral-content": "#dad5f4",
          "base-100": "#1B222A",
          "base-200": "#222834",
          "base-300": "#113e5e",
          "base-content": "#c9cbcf",
          "info": "#60a5fa",
          "info-content": "#CDD54A",
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