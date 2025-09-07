/**
 * Icons System
 *
 * This module provides a centralized way to manage and use icons throughout the app.
 *
 * Usage:
 * import { RihletiLogo, HomeIcon } from '../../components/icons';
 *
 * To add new SVG icons:
 * 1. Place your .svg file in src/assets/
 * 2. Create a component that imports the SVG (see RihletiLogo.tsx as example)
 * 3. Export it from this index file
 *
 * The metro.config.js is configured to transform SVG files automatically.
 */

// Icon exports
// export { default as RihletiLogo } from "./app-icons/RihletiLogo";
// export { default as GoogleLogo } from "./app-icons/GoogleLogo";

// Re-export existing icons for consistency
export { default as HomeIcon } from "./tab-icons/HomeIcon";
export { default as ExploreIcon } from "./tab-icons/ExploreIcon";
export { default as BookingsIcon } from "./tab-icons/BookingsIcon";
export { default as SettingsIcon } from "./tab-icons/SettingsIcon";

// Export icon types
export type { IconProps } from "./types";
