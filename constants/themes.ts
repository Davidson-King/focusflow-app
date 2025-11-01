import type { ColorTheme } from '../types';

export const themes: ColorTheme[] = [
    {
        name: 'default',
        displayName: 'Default Blue',
        colors: {
            primary: '#0062CC',
            primaryHover: '#004C99',
            primaryGlow: 'rgba(0, 122, 255, 0.3)',
        },
    },
    {
        name: 'sunset',
        displayName: 'Sunset Orange',
        colors: {
            primary: '#D97E00',
            primaryHover: '#B86A00',
            primaryGlow: 'rgba(255, 149, 0, 0.3)',
        },
    },
    {
        name: 'forest',
        displayName: 'Forest Green',
        colors: {
            primary: '#1E7E34',
            primaryHover: '#176428',
            primaryGlow: 'rgba(52, 199, 89, 0.3)',
        },
    },
    {
        name: 'royal',
        displayName: 'Royal Purple',
        colors: {
            primary: '#9333EA',
            primaryHover: '#7E22CE',
            primaryGlow: 'rgba(175, 82, 222, 0.3)',
        },
    },
];