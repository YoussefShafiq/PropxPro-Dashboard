/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "darkBlue": "#131e57",
        "lightBlue": "#245ec1",
        "darkText": "#19243b",
        "grayText": "#475062",
        "lightgrayText": "#6c7381",
        "blueText": "#245ec1",
        "primary": "#245ec1",
        "background": "#f5f9fe",
      },
    },
  },
  plugins: [],
}

