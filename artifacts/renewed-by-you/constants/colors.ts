/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#25332d',
    tint: '#4b7562',

    // Core surfaces
    background: '#fbf8f4',
    foreground: '#25332d',

    // Cards / elevated surfaces
    card: '#ffffff',
    cardForeground: '#25332d',

    // Primary action color (buttons, links, active states)
    primary: '#4b7562',
    primaryForeground: '#ffffff',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#eef1e8',
    secondaryForeground: '#3c5045',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#f3eee8',
    mutedForeground: '#837d76',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#f8e4df',
    accentForeground: '#814f4a',

    // Destructive actions (delete, error states)
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',

    // Borders and input outlines
    border: '#ebe5de',
    input: '#e5ded5',

    // Renewed By You brand accents
    blush: '#f8e7e1',
    butter: '#f8efcf',
    sage: '#e7eddf',
    lavender: '#eee8f3',
    peach: '#fae9d9',
    success: '#557a62',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 18,
};

export default colors;
