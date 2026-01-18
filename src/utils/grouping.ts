import { HomeAssistant } from '../ha-types/home-assistant';
import { GroupConfig } from '../types';
import { getBatteryLevel } from './battery-level';

export interface CollapsedGroup {
  entities: string[];
  min: number;
  max: number;
  count: number;
}

/**
 * Get entities from a Home Assistant group
 */
export function getGroupEntities(hass: HomeAssistant, groupEntityId: string): string[] {
  const group = hass.states[groupEntityId];
  if (!group) return [];

  const entities = group.attributes.entity_id;
  if (Array.isArray(entities)) {
    return entities.filter((id): id is string => typeof id === 'string');
  }
  if (typeof entities === 'string') return [entities];
  return [];
}

/**
 * Apply collapse threshold to entity list
 */
export function applyCollapseThreshold(
  hass: HomeAssistant,
  entities: string[],
  threshold?: number
): { visible: string[]; collapsed?: CollapsedGroup } {
  if (!threshold || entities.length <= threshold) {
    return { visible: entities };
  }

  const visible = entities.slice(0, threshold);
  const collapsed = entities.slice(threshold);

  if (collapsed.length === 0) {
    return { visible: entities };
  }

  const levels = collapsed.map((id) => getBatteryLevel(hass, id));
  const min = Math.min(...levels);
  const max = Math.max(...levels);

  return {
    visible,
    collapsed: {
      entities: collapsed,
      min,
      max,
      count: collapsed.length,
    },
  };
}

/**
 * Resolve HA group entities to individual entities
 */
export function resolveGroups(
  hass: HomeAssistant,
  groupConfigs?: GroupConfig[]
): Map<string, string[]> {
  const groups = new Map<string, string[]>();

  if (!groupConfigs) return groups;

  for (const config of groupConfigs) {
    const entities = getGroupEntities(hass, config.entity_id);
    const name =
      config.name || hass.states[config.entity_id]?.attributes.friendly_name || config.entity_id;
    groups.set(name, entities);
  }

  return groups;
}
