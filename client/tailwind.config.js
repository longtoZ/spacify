/** @type {import('tailwindcss').Config} */
export const content = ['./src/**/*.{js,jsx,ts,tsx}'];
export const theme = {
    extend: {
        colors: {
            'bg-color': 'var(--bg-color)',
            'text-color': 'var(--text-color)',
            'primary-1': 'var(--primary-1)',
            'primary-2': 'var(--primary-2)',
            'primary-1-dark': 'var(--primary-1-dark)',
            'primary-3': 'var(--primary-3)',
            'primary-4': 'var(--primary-4)',
        },
        boxShadow: {
            basic: 'var(--box-shadow)',
            light: 'var(--box-shadow-light)',
            lighter: 'var(--box-shadow-lighter)',
            thick: 'var(--box-shadow-thick)',
        },
    },
};
export const plugins = [];

export const darkMode = ['selector', '[data-theme="dark"]']