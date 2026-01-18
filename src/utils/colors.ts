import { ColorMode } from '../constants';
import { ColorConfig, ColorThreshold } from '../types';

/**
 * Default color thresholds for battery level visualization
 * Used when no custom thresholds are provided
 */
export const DEFAULT_COLOR_THRESHOLDS: readonly ColorThreshold[] = [
  { value: 0, color: '#ff0000' }, // Red: Critical (0%)
  { value: 20, color: '#ff4500' }, // Orange-red: Low (20%)
  { value: 50, color: '#ffff00' }, // Yellow: Medium (50%)
  { value: 100, color: '#00ff00' }, // Green: Good (100%)
];

/**
 * Default fallback color when no threshold matches
 * Used as a safety fallback in case of missing configuration
 */
export const DEFAULT_FALLBACK_COLOR = '#808080'; // Gray

/**
 * Convert hex color string to RGB components
 * Example: "#ff0000" => { r: 255, g: 0, b: 0 }
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const num = parseInt(hex.replace('#', ''), 16);
  return {
    r: (num >> 16) & 0xff,
    g: (num >> 8) & 0xff,
    b: num & 0xff,
  };
}

/**
 * Convert RGB components to hex color string
 * Example: { r: 255, g: 0, b: 0 } => "#ff0000"
 */
function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Interpolate between two colors based on a factor (0-1)
 * Example: interpolateColor("#ff0000", "#00ff00", 0.5) => some shade between red and green
 */
function interpolateColor(color1: string, color2: string, factor: number): string {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);

  const r = Math.round(c1.r + (c2.r - c1.r) * factor);
  const g = Math.round(c1.g + (c2.g - c1.g) * factor);
  const b = Math.round(c1.b + (c2.b - c1.b) * factor);

  return rgbToHex(r, g, b);
}

/**
 * Find the color for a battery level using gradient interpolation
 * Finds the two thresholds that the level falls between and interpolates the color
 */
function getGradientColor(level: number, thresholds: ColorThreshold[]): string {
  const sorted = [...thresholds].sort((a, b) => a.value - b.value);

  // Find which two thresholds the level falls between
  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];

    if (current && next && level >= current.value && level <= next.value) {
      const range = next.value - current.value;
      const factor = (level - current.value) / range;
      return interpolateColor(current.color, next.color, factor);
    }
  }

  // Below minimum threshold
  const first = sorted[0];
  if (first && level < first.value) {
    return first.color;
  }

  // Above maximum threshold
  const last = sorted[sorted.length - 1];
  return last?.color || DEFAULT_FALLBACK_COLOR;
}

/**
 * Find the color for a battery level using threshold lookup
 * Returns the color of the highest threshold that doesn't exceed the level
 */
function getThresholdColor(level: number, thresholds: ColorThreshold[]): string {
  // Sort by value descending to find the highest matching threshold
  const sorted = [...thresholds].sort((a, b) => b.value - a.value);

  for (const threshold of sorted) {
    if (level >= threshold.value) {
      return threshold.color;
    }
  }

  // No matching threshold found, use fallback
  return sorted[sorted.length - 1]?.color ?? DEFAULT_FALLBACK_COLOR;
}

/**
 * Get the appropriate color for a battery level based on configuration
 * Supports two modes:
 * - "gradient": Smoothly interpolates colors between thresholds
 * - "threshold": Picks the color of the highest matching threshold
 */
export function getBatteryColor(level: number, colorConfig?: ColorConfig): string {
  // Use defaults if no configuration provided
  if (!colorConfig?.thresholds || colorConfig.thresholds.length === 0) {
    return getBatteryColor(level, {
      mode: ColorMode.Gradient,
      thresholds: [...DEFAULT_COLOR_THRESHOLDS] as ColorThreshold[],
    });
  }

  // Route to appropriate color calculation method
  return colorConfig.mode === ColorMode.Gradient
    ? getGradientColor(level, colorConfig.thresholds)
    : getThresholdColor(level, colorConfig.thresholds);
}
