/**
 * Global constants for battery status card
 */

export const CARD_VERSION = '1.0.0';
export const CARD_NAME = 'battery-status-card';
export const CARD_TYPE = `custom:${CARD_NAME}`;

// Secondary info types
export enum SecondaryInfoType {
  LastChanged = 'last-changed',
  LastUpdated = 'last-updated',
  Area = 'area',
  Floor = 'floor',
}

export const SECONDARY_INFO_OPTIONS = Object.values(SecondaryInfoType);
export const DEFAULT_SECONDARY_INFO = [SecondaryInfoType.LastChanged] as const;

// Filter operators
export const FILTER_OPERATORS = [
  '=',
  '>',
  '<',
  '>=',
  '<=',
  'contains',
  'matches',
  'exists',
  'not_exists',
] as const;

// Sort options
export enum SortByType {
  State = 'state',
  Name = 'name',
}

export enum SortDirectionType {
  Asc = 'asc',
  Desc = 'desc',
}

export const SORT_OPTIONS = Object.values(SortByType);
export const SORT_DIRECTIONS = Object.values(SortDirectionType);

// Color modes
export enum ColorMode {
  Gradient = 'gradient',
  Threshold = 'threshold',
}

export const COLOR_MODES = Object.values(ColorMode);

// Battery icon levels
export const BATTERY_ICON_LEVELS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100] as const;

// Common filter presets to exclude entities by domain
export const FILTER_PRESETS = {
  'exclude-binary-sensors': {
    label: 'Exclude Binary Sensors',
    exclude: [{ name: 'entity_id', operator: 'matches', value: '^binary_sensor\\.' }],
  },
  'exclude-sensors': {
    label: 'Exclude Sensors',
    exclude: [{ name: 'entity_id', operator: 'matches', value: '^sensor\\.' }],
  },
  'exclude-device-trackers': {
    label: 'Exclude Device Trackers',
    exclude: [{ name: 'entity_id', operator: 'matches', value: '^device_tracker\\.' }],
  },
  'exclude-cameras': {
    label: 'Exclude Cameras',
    exclude: [{ name: 'entity_id', operator: 'matches', value: '^camera\\.' }],
  },
  'exclude-lights': {
    label: 'Exclude Lights',
    exclude: [{ name: 'entity_id', operator: 'matches', value: '^light\\.' }],
  },
  'exclude-switches': {
    label: 'Exclude Switches',
    exclude: [{ name: 'entity_id', operator: 'matches', value: '^switch\\.' }],
  },
} as const;

export const FILTER_PRESET_OPTIONS = Object.entries(FILTER_PRESETS).map(([value, preset]) => ({
  value,
  label: preset.label,
}));
