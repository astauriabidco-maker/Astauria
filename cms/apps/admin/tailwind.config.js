/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                // Astauria Brand Colors
                navy: {
                    50: '#e6eaef',
                    100: '#c0c9d8',
                    200: '#96a6bd',
                    300: '#6c83a2',
                    400: '#4d698e',
                    500: '#2e507a',
                    600: '#284872',
                    700: '#203d67',
                    800: '#19335d',
                    900: '#0a1930', // Primary navy
                    950: '#050d18',
                },
                gold: {
                    50: '#fdf8e8',
                    100: '#fbefc6',
                    200: '#f8e4a0',
                    300: '#f5d97a',
                    400: '#f2d05e',
                    500: '#d4af37', // Primary gold
                    600: '#c9a030',
                    700: '#bc8e28',
                    800: '#af7c20',
                    900: '#965f13',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
