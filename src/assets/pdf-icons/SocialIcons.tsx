import React from 'react';

/**
 * Social Icons for export.
 * Using native SVG elements directly removes the need for wrapper components
 * and eliminates the Fast Refresh warning.
 */
export const SocialIcons: Record<string, (color: string) => React.ReactNode> = {
  github: (color) => (
    <>
      <path
        d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5 0.08-1.25 -0.27-2.48-1-3.5 0.28-1.15 0.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64 -0.5-5.36 -0.5-8 0C6 2 5 2 5 2c-0.3 1.15 -0.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5 -0.39.49 -0.68 1.05 -0.85 1.65 -0.17.6 -0.22 1.23 -0.15 1.85v4"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 18c-4.51 2-5-2-7-2"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  linkedin: (color) => (
    <>
      <path
        d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        width="4"
        height="12"
        x="2"
        y="9"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="4"
        cy="4"
        r="2"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  twitter: (color) => (
    <path
      d="M22 4s-0.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2 0.1 4.4 -0.6 6-2C3 15.5 0.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4 -0.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  facebook: (color) => (
    <path
      d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  instagram: (color) => (
    <>
      <rect
        width="20"
        height="20"
        x="2"
        y="2"
        rx="5"
        ry="5"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="17.5"
        x2="17.51"
        y1="6.5"
        y2="6.5"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  youtube: (color) => (
    <>
      <path
        d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m10 15 5-3-5-3z"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  gitlab: (color) => (
    <path
      d="m22 13.29-3.33-10a0.42 0.42 0 0 0-0.14-0.18 0.38 0.38 0 0 0-0.22-0.11 0.39 0.39 0 0 0-0.23 0.07 0.42 0.42 1 0 0-0.14 0.18L2 13.29a0.74 0.74 0 0 0 0.27 0.83L12 21l9.69-6.88a0.71 0.71 0 0 0 0.31-0.83Z"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  discord: (color) => (
    <path
      d="M19.73 4.87a18.2 18.2 0 0 0-4.6-1.44c-.21.36-.4.75-.59 1.14a16.73 16.73 0 0 0-5.1 0 13.2 13.2 0 0 0-.6-1.14 18.24 18.24 0 0 0-4.57 1.44 19.1 19.1 0 0 0-3.73 14.4c2.44 1.8 4.8 2.9 7.13 3.61.57-.77 1.08-1.6 1.51-2.48a12.18 12.18 0 0 1-2.43-1.16c.2-.14.4-.3.6-.46 4.67 2.16 9.75 2.16 14.37 0 .2.16.4.32.6.46-0.74.45-1.55.84-2.43 1.16.43.88.94 1.7 1.51 2.48 2.33-.7 4.7-1.8 7.13-3.61a19.1 19.1 0 0 0-3.73-14.4zM8.5 14.89c-1.11 0-2.01-1.02-2.01-2.27s0.86-2.27 1.97-2.27c1.13 0 2.03 1.02 2.03 2.27s-0.9 2.27-1.99 2.27zm7 0c-1.11 0-2.01-1.02-2.01-2.27s0.86-2.27 1.97-2.27c1.13 0 2.03 1.02 2.03 2.27s-0.9 2.27-1.99 2.27z"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  twitch: (color) => (
    <path
      d="M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9V7m5 4V7"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  dribbble: (color) => (
    <>
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.13 5.09C15.22 9.14 10 10.44 2.25 10.94"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21.75 12.84c-6.62-1.41-12.14 1-16.38 6.32"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.56 2.75c4.37 6 6 9.42 8 17.72"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  codepen: (color) => (
    <>
      <polygon
        points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="12"
        x2="12"
        y1="22"
        y2="15.5"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="22 8.5 12 15.5 2 8.5"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="2 15.5 12 8.5 22 15.5"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="12"
        x2="12"
        y1="2"
        y2="8.5"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  x: (color) => (
    <path
      d="M4 4l16 16m0-16L4 20"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  stackoverflow: (color) => (
    <>
      <path
        d="M19 16.5V20a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-3.5"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 12h8"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m8.5 8.5 7.5 2"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m10.5 5 6.5 4"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m13.5 2 5.5 5.5"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  behance: (color) => (
    <>
      <path
        d="M8.5 12h-5"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 8.5a2.5 2.5 0 1 0-5 0"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 15.5a2.5 2.5 0 1 1-5 0"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 12v6"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 12h7a3.5 3.5 0 1 0-7 0v3.5a3.5 3.5 0 0 0 7 0"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 8h5"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  medium: (color) => (
    <>
      <circle
        cx="7"
        cy="12"
        r="5"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse
        cx="16"
        cy="12"
        rx="2.5"
        ry="5"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse
        cx="21"
        cy="12"
        rx="1"
        ry="4.5"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  reddit: (color) => (
    <>
      <circle
        cx="12"
        cy="13"
        r="7"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 6V3a1 1 0 0 1 2 0"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="8.5"
        cy="13"
        r="1"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="15.5"
        cy="13"
        r="1"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 16.5a4 4 0 0 0 5 0"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  bluesky: (color) => (
    <path
      d="M12 21c-4-3-8-4-8-9 0-4 1-6 4-6 1.5 0 3 1.5 4 3 1-1.5 2.5-3 4-3 3 0 4 2 4 6 0 5-4 6-8 9z"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  mastodon: (color) => (
    <path
      d="M21 11.5c0 4.5-3.5 6.5-7 6.5h-2c-3.5 0-7-2-7-6.5V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5.5zM7 16V13c0-2 1-3 3-3a3 3 0 0 1 2 1 3 3 0 0 1 2-1c2 0 3 1 3 3v3"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  telegram: (color) => (
    <path
      d="m22 2-7 20-4-9-9-4zm0 0L11 13"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
};
