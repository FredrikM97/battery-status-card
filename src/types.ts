import { ActionConfig, CardConfig } from './ha-types/home-assistant';
import {
  FILTER_OPERATORS,
  FILTER_PRESETS,
  SecondaryInfoType,
  ColorMode,
  SortByType,
  SortDirectionType,
} from './constants';

// Infrastructure/utility types
export type ConfigValue = string | boolean | number | undefined;

export type FilterUpdateValue = string | number | undefined;

export type ColorThresholdUpdateValue = string | number;

export type NestedPropertyValue = unknown;

export type DynamicObject = Record<string, unknown>;

/**
 * Generic event detail for config changes
 * Use this with generic parameter for type safety
 * Example: ConfigChangedEventDetail<BatteryStatusCardConfig>
 * T defaults to DynamicObject for maximum flexibility
 */
export interface ConfigChangedEventDetail<T extends DynamicObject = DynamicObject> {
  config: T;
}

export interface ValueChangeTarget extends HTMLElement {
  configValue?: string;
  value?: string;
}

export interface TypedCustomEvent<T> extends CustomEvent<T> {
  detail: T;
}

export type ComparisonFunction = (actual: unknown, expected: unknown) => boolean;

// Filter operators type
export type FilterOperator = (typeof FILTER_OPERATORS)[number];

// Filter configuration
export interface FilterConfig {
  name: string;
  operator: FilterOperator;
  value?: string | number;
}

// Sort configuration
export type SortBy = SortByType;
export type SortDirection = SortDirectionType;

export interface SortConfig {
  by: SortBy;
  direction: SortDirection;
}

// Color configuration
export interface ColorThreshold {
  value: number;
  color: string;
}

export interface ColorConfig {
  mode: ColorMode;
  thresholds: ColorThreshold[];
}

// Group configuration
export interface GroupConfig {
  entity_id: string;
  name?: string;
}

// Battery status card configuration
export type SecondaryInfoItem = SecondaryInfoType;

export interface BatteryStatusCardConfig extends CardConfig {
  title?: string;
  include?: FilterConfig[];
  exclude?: FilterConfig[];
  filter_presets?: (keyof typeof FILTER_PRESETS)[];
  sort?: SortConfig;
  colors?: ColorConfig;
  collapse_threshold?: number;
  groups?: GroupConfig[];
  show_charging?: boolean;
  show_secondary_info?: boolean;
  secondary_info?: SecondaryInfoItem[];
  tap_action?: ActionConfig;
  round?: number;
}
