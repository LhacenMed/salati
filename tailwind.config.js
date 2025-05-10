/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./components/**/*.{js,jsx,ts,tsx}",
        "./app/**/*.{js,jsx,ts,tsx}",
        "./App.tsx",
    ],

    presets: [require("nativewind/preset")],
    theme: {
        extend: {},
    },
    plugins: [],
};