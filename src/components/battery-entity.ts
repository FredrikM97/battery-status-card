import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { HomeAssistant, HassEntity, ActionHandlerEvent } from '../ha-types/home-assistant';
import { showMoreInfo, actionHandler } from '../utils/action-handler';
import { BatteryStatusCardConfig, SecondaryInfoItem } from '../types';
import { getBatteryColor } from '../utils/colors';
import { getBatteryLevel } from '../utils/battery-level';
import { SecondaryInfoType } from '../constants';

@customElement('battery-entity')
export class BatteryEntity extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property() public entityId!: string;
  @property({ attribute: false }) public config!: BatteryStatusCardConfig;

  private _handleAction = (_ev: ActionHandlerEvent): void => {
    showMoreInfo(this, this.entityId);
  };

  private _getEntityName(): string {
    const entity = this.hass.states[this.entityId];
    if (!entity) return this.entityId;

    // Try to get device name first
    const entityReg = this.hass.entities?.[this.entityId];
    if (entityReg?.device_id) {
      const deviceReg = this.hass.devices?.[entityReg.device_id];
      if (deviceReg?.name) {
        return deviceReg.name;
      }
    }

    // Fallback to entity friendly name
    const friendlyName = entity.attributes.friendly_name;
    let name = (typeof friendlyName === 'string' ? friendlyName : undefined) || this.entityId;

    name = name.replace(/ battery$/i, '');
    name = name.replace(/ level$/i, '');

    return name;
  }

  private _getIcon(level: number): string {
    const entity = this.hass.states[this.entityId];
    const icon = entity ? entity.attributes.icon : undefined;
    if (icon && typeof icon === 'string') {
      return icon;
    }

    const isCharging = this._isCharging();
    const bucket = Math.max(0, Math.min(100, Math.round(level / 10) * 10));

    if (isCharging) {
      if (bucket < 10) return 'mdi:battery-charging-outline';
      return `mdi:battery-charging-${String(bucket)}`;
    }

    if (bucket === 100) return 'mdi:battery';
    if (bucket < 10) return 'mdi:battery-outline';
    return `mdi:battery-${String(bucket)}`;
  }

  private _isCharging(): boolean {
    const entity = this.hass.states[this.entityId];
    if (!entity) return false;

    const attrs = entity.attributes;

    // Check various charging state attributes
    const checkCharging = (val: unknown): boolean => {
      return val === true || val === 'true' || val === 'on';
    };

    return (
      checkCharging(attrs.charging) ||
      checkCharging(attrs.is_charging) ||
      checkCharging(attrs.battery_charging)
    );
  }

  private _getSecondaryInfo(): string {
    if (this.config.show_secondary_info !== true) return '';

    const entity = this.hass.states[this.entityId];
    if (!entity) return '';

    const { secondary_info } = this.config;
    const itemsRaw = Array.isArray(secondary_info) ? secondary_info : [];
    const items: SecondaryInfoItem[] = itemsRaw
      .map((entry) => (typeof entry === 'string' ? entry : undefined))
      .filter((v): v is SecondaryInfoItem => Boolean(v));

    if (items.length === 0) return '';

    const parts = items
      .map((item) => this._resolveSecondaryItem(entity, item))
      .filter((v): v is string => Boolean(v));

    return parts.join(' • ');
  }

  private _relativeFrom(dateString: string): string {
    const then = new Date(dateString).getTime();
    const now = Date.now();
    const diffSec = Math.max(0, Math.floor((now - then) / 1000));
    if (diffSec >= 86400) return String(Math.floor(diffSec / 86400)) + 'd ago';
    if (diffSec >= 3600) return String(Math.floor(diffSec / 3600)) + 'h ago';
    if (diffSec >= 60) return String(Math.floor(diffSec / 60)) + 'm ago';
    return 'Just now';
  }

  private _resolveSecondaryItem(entity: HassEntity, item: SecondaryInfoItem): string | null {
    switch (item) {
      case SecondaryInfoType.LastChanged: {
        return this._relativeFrom(entity.last_changed);
      }
      case SecondaryInfoType.LastUpdated: {
        return this._relativeFrom(entity.last_updated);
      }
      case SecondaryInfoType.Area: {
        // First check entity attributes (rare, but possible)
        const areaNameAttr = entity.attributes['area'];
        if (typeof areaNameAttr === 'string') {
          return areaNameAttr;
        }

        // Get entity registry entry
        const entityReg = this.hass.entities?.[entity.entity_id];

        // Try entity's area_id first
        let areaId = entityReg?.area_id;

        // If no area on entity, check the device's area
        if (!areaId && entityReg?.device_id) {
          const deviceReg = this.hass.devices?.[entityReg.device_id];
          areaId = deviceReg?.area_id;
        }

        // Fallback to entity attributes
        if (!areaId) {
          areaId = entity.attributes['area_id'];
        }

        // Lookup area name from area registry
        const areaName = areaId && this.hass.areas ? this.hass.areas[areaId]?.name : undefined;

        return areaName || null;
      }
      case SecondaryInfoType.Floor: {
        // First check entity attributes (rare, but possible)
        const floorNameAttr = entity.attributes['floor'];
        if (typeof floorNameAttr === 'string') {
          return floorNameAttr;
        }

        // Get entity registry entry
        const entityReg = this.hass.entities?.[entity.entity_id];

        // Try entity's floor_id first
        let floorId = entityReg?.floor_id;

        // If no floor on entity, check the device's floor
        if (!floorId && entityReg?.device_id) {
          const deviceReg = this.hass.devices?.[entityReg.device_id];
          floorId = deviceReg?.floor_id;
        }

        // Fallback to entity attributes
        if (!floorId) {
          floorId = entity.attributes['floor_id'];
        }

        // Lookup floor name from floor registry
        const floorName = floorId && this.hass.floors ? this.hass.floors[floorId]?.name : undefined;

        return floorName || null;
      }
      default:
        return null;
    }
  }

  private _formatLevel(level: number): string {
    const roundTo = this.config.round !== undefined ? this.config.round : 0;
    if (roundTo === 0) {
      return Math.round(level).toString();
    }
    return level.toFixed(roundTo);
  }

  protected render() {
    if (!this.entityId) {
      return html``;
    }

    const level = getBatteryLevel(this.hass, this.entityId);
    const color = getBatteryColor(level, this.config.colors);
    const isCharging = this._isCharging();
    const secondaryInfo = this._getSecondaryInfo();
    const icon = this._getIcon(level);

    return html`
      <div class="entity-row" @action=${this._handleAction} .actionHandler=${actionHandler()}>
        <div class="icon-container" style="--icon-color: ${color}">
          <ha-icon icon="${icon}"></ha-icon>
          ${isCharging && this.config.show_charging
            ? html`<ha-icon class="charging-indicator" icon="mdi:lightning-bolt"></ha-icon>`
            : ''}
        </div>
        <div class="entity-info">
          <span class="entity-name">${this._getEntityName()}</span>
          ${secondaryInfo ? html`<span class="entity-secondary">${secondaryInfo}</span>` : ''}
        </div>
        <div class="entity-state" style="color: ${color}">${this._formatLevel(level)}%</div>
      </div>
    `;
  }

  static styles = css`
    :host {
      display: block;
    }

    .entity-row {
      display: flex;
      align-items: center;
      padding: 8px 0;
      cursor: pointer;
      transition: background 0.2s;
      border-radius: 8px;
      padding: 8px 12px;
    }

    .entity-row:hover {
      background: var(--secondary-background-color);
    }

    .icon-container {
      position: relative;
      margin-right: 16px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon-container ha-icon {
      --mdc-icon-size: 24px;
      color: var(--icon-color);
    }

    .charging-indicator {
      position: absolute;
      bottom: 0;
      right: 0;
      --mdc-icon-size: 12px !important;
      color: var(--warning-color) !important;
      background: var(--card-background-color);
      border-radius: 50%;
    }

    .entity-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .entity-name {
      font-weight: 500;
      color: var(--primary-text-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .entity-secondary {
      font-size: 0.85em;
      color: var(--secondary-text-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .entity-state {
      font-weight: 500;
      font-size: 1.1em;
      margin-left: 16px;
      white-space: nowrap;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'battery-entity': BatteryEntity;
  }
}
