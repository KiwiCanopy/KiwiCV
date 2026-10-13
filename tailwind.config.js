/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        kiwi: 'hsl(var(--kiwi))',
        'pale-kiwi': 'hsl(var(--pale-kiwi))',
        mist: 'hsl(var(--mist))',
        // The zones. A component that paints one of these surfaces reads its
        // zone token, never `background` — see tokens.css for why.
        nav: {
          DEFAULT: 'hsl(var(--nav))',
          foreground: 'hsl(var(--nav-foreground))',
          active: 'hsl(var(--nav-active))',
          'foreground-strong': 'hsl(var(--nav-foreground-strong))',
          border: 'hsl(var(--nav-border))',
        },
        rail: {
          DEFAULT: 'hsl(var(--rail))',
          active: 'hsl(var(--rail-active))',
        },
        workspace: 'hsl(var(--workspace))',
        desk: 'hsl(var(--desk))',
        divider: 'hsl(var(--divider))',
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: 'hsl(var(--warning))',
        danger: 'hsl(var(--danger))',
        premium: {
          DEFAULT: 'hsl(var(--premium))',
          deep: 'hsl(var(--premium-deep))',
          foreground: 'hsl(var(--premium-foreground))',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        // No numeric scale: the pre-rebrand blue/indigo ramp is retired. Vary
        // the brand with opacity (`bg-primary/10`) or reach for `--kiwi` /
        // `--pale-kiwi` / `--mist` rather than reintroducing shades.
        primary: {
          // The FILL. `bg-primary` and `accent-primary` only.
          DEFAULT: 'hsl(var(--primary))',
          // Text ON the fill.
          foreground: 'hsl(var(--primary-foreground))',
          // Everything DRAWN rather than painted: `text-`, `border-`, `ring-`,
          // `stroke-`, `decoration-`, `shadow-`, gradient stops. One rule —
          // `bg-*`/`accent-*` take the fill, everything else takes `strong`.
          strong: 'hsl(var(--primary-strong))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
