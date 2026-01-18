/**
 * Local type definitions for Home Assistant
 * Based on home-assistant-js-websocket and HA frontend types
 */

/**
 * Generic card configuration object
 * Represents the configuration structure passed to custom card components
 * All cards receive a type property and may have additional custom properties
 */
export interface CardConfig {
  type: string;
  [key: string]: unknown;
}

export interface HassEntity {
  entity_id: string;
  state: string;
  last_changed: string;
  last_updated: string;
  attributes: {
    friendly_name?: string;
    device_class?: string;
    battery?: number;
    battery_level?: number;
    battery_charging?: boolean;
    icon?: string;
    area?: string;
    area_id?: string;
    floor?: string;
    floor_id?: string;
    [key: string]: unknown;
  };
  context: {
    id: string;
    parent_id?: string;
    user_id?: string;
  };
}

export interface HomeAssistant {
  states: Partial<Record<string, HassEntity>>;
  callService: (
    domain: string,
    service: string,
    serviceData?: object,
    target?: { entity_id?: string | string[] }
  ) => Promise<void>;
  // Entity registry: entity_id -> entity registry entry
  entities?: Partial<
    Record<string, { area_id?: string | null; device_id?: string | null; floor_id?: string | null }>
  >;
  // Device registry: device_id -> device registry entry
  devices?: Partial<
    Record<string, { area_id?: string | null; floor_id?: string | null; name?: string }>
  >;
  // Registry lookups by ID (e.g., area_id -> area name, floor_id -> floor name)
  areas?: Partial<Record<string, { name?: string }>>;
  floors?: Partial<Record<string, { name?: string }>>;
}

export interface LovelaceCard<Config extends CardConfig = CardConfig> extends HTMLElement {
  hass?: HomeAssistant;
  setConfig(config: Config): void;
  getCardSize?(): number;
}

export interface LovelaceCardEditor extends HTMLElement {
  hass?: HomeAssistant;
  setConfig(config: CardConfig): void;
}

export interface ActionConfig {
  action: 'none' | 'toggle' | 'call-service' | 'navigate' | 'url' | 'more-info';
  service?: string;
  service_data?: object;
  target?: {
    entity_id?: string | string[];
  };
  navigation_path?: string;
  url_path?: string;
  confirmation?: {
    text?: string;
    exemptions?: { user: string }[];
  };
}

export interface ActionHandlerEvent extends Event {
  detail: {
    action: 'hold' | 'tap' | 'double_tap';
  };
}
