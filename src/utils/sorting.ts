import { HomeAssistant } from '../ha-types/home-assistant';
import { SortConfig } from '../types';
import { SortByType, SortDirectionType } from '../constants';
import { getBatteryLevel } from './battery-level';

/**
 * Get the friendly name of an entity
 */
function getEntityName(hass: HomeAssistant, entityId: string): string {
  const entity = hass.states[entityId];
  if (!entity) return entityId;

  return entity.attributes.friendly_name || entityId;
}

/**
 * Compare two values for sorting
 */
function compare(a: number | string, b: number | string, ascending: boolean): number {
  let result: number;

  if (typeof a === 'number' && typeof b === 'number') {
    result = a - b;
  } else {
    result = String(a).localeCompare(String(b));
  }

  return ascending ? result : -result;
}

/**
 * Sort entities based on configuration
 */
export function sortEntities(
  hass: HomeAssistant,
  entityIds: string[],
  sortConfig?: SortConfig
): string[] {
  if (!sortConfig) return entityIds;

  const sorted = [...entityIds];
  const ascending = sortConfig.direction === SortDirectionType.Asc;

  sorted.sort((a, b) => {
    if (sortConfig.by === SortByType.State) {
      const levelA = getBatteryLevel(hass, a);
      const levelB = getBatteryLevel(hass, b);
      return compare(levelA, levelB, ascending);
    } else {
      const nameA = getEntityName(hass, a);
      const nameB = getEntityName(hass, b);
      return compare(nameA, nameB, ascending);
    }
  });

  return sorted;
}
