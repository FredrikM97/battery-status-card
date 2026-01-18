import { describe, it, expect } from 'vitest';
import { getBatteryColor, DEFAULT_COLOR_THRESHOLDS } from '../../src/utils/colors';
import { ColorMode } from '../../src/constants';

const thresholds = [
  { value: 0, color: '#000000' },
  { value: 50, color: '#888888' },
  { value: 100, color: '#ffffff' },
];

describe('getBatteryColor', () => {
  it('uses defaults when no config provided', () => {
    expect(getBatteryColor(0)).toBe(DEFAULT_COLOR_THRESHOLDS[0]?.color);
  });

  it('interpolates in gradient mode', () => {
    const color = getBatteryColor(25, { mode: ColorMode.Gradient, thresholds });
    expect(color.startsWith('#')).toBe(true);
    expect(color).not.toBe(thresholds[0]?.color);
    expect(color).not.toBe(thresholds[1]?.color);
  });

  it('returns threshold color at exact boundary', () => {
    const color = getBatteryColor(50, { mode: ColorMode.Gradient, thresholds });
    expect(color).toBe('#888888');
  });

  it('uses threshold mode highest matching value', () => {
    const color = getBatteryColor(60, { mode: ColorMode.Threshold, thresholds });
    expect(color).toBe('#888888');
  });

  it('handles below min and above max', () => {
    expect(getBatteryColor(-10, { mode: ColorMode.Threshold, thresholds })).toBe('#000000');
    expect(getBatteryColor(200, { mode: ColorMode.Threshold, thresholds })).toBe('#ffffff');
  });
});
