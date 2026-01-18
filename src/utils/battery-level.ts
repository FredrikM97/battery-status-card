import { HomeAssistant } from '../ha-types/home-assistant';

// Compute battery level from HA entity attributes/state
export function getBatteryLevel(hass: HomeAssistant, entityId: string): number {
  const entity = hass.states[entityId];
  if (!entity) return 0;

  const fromLevel = Number(entity.attributes.battery_level);
  if (!Number.isNaN(fromLevel)) {
    return fromLevel;
  }

  const fromBattery = Number(entity.attributes.battery);
  if (!Number.isNaN(fromBattery)) {
    return fromBattery;
  }

  const state = Number(entity.state);
  if (!Number.isNaN(state)) {
    return state;
  }

  return 0;
}
