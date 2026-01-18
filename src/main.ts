import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, LovelaceCard } from './ha-types/home-assistant';
import { BatteryStatusCardConfig, ColorThreshold, FilterConfig } from './types';
import {
  CARD_TYPE,
  DEFAULT_SECONDARY_INFO,
  ColorMode,
  SortByType,
  SortDirectionType,
} from './constants';
import { generateConfigFormSchema } from './config-form';
import { DEFAULT_COLOR_THRESHOLDS } from './utils/colors';
import { discoverBatteryEntities, filterEntities } from './utils/filters';
import { sortEntities } from './utils/sorting';
import { applyCollapseThreshold, CollapsedGroup } from './utils/grouping';
import { FILTER_PRESETS } from './constants';
import './components/battery-entity';

@customElement('battery-status-card')
export class BatteryStatusCard extends LitElement implements LovelaceCard<BatteryStatusCardConfig> {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private _config?: BatteryStatusCardConfig;
  @state() private _showCollapsed = false;

  public static getConfigForm(): ReturnType<typeof generateConfigFormSchema> {
    return generateConfigFormSchema();
  }

  public static getStubConfig(_hass: HomeAssistant): BatteryStatusCardConfig {
    return {
      type: CARD_TYPE,
      collapse_threshold: 0,
      sort: {
        by: SortByType.State,
        direction: SortDirectionType.Asc,
      },
      colors: {
        mode: ColorMode.Gradient,
        thresholds: DEFAULT_COLOR_THRESHOLDS as ColorThreshold[],
      },
      show_charging: true,
      show_secondary_info: true,
      secondary_info: DEFAULT_SECONDARY_INFO as unknown as string[],
      round: 0,
    } as BatteryStatusCardConfig;
  }

  public setConfig(config: BatteryStatusCardConfig): void {
    this._config = config;
  }

  public getCardSize(): number {
    if (!this._config) return 1;
    const entities = this._getFilteredEntities();
    const threshold =
      this._config.collapse_threshold !== undefined ? this._config.collapse_threshold : 0;
    const visibleCount = this._showCollapsed
      ? entities.length
      : Math.min(entities.length, threshold || entities.length);
    return (this._config.title ? 1 : 0) + Math.ceil(visibleCount / 2) + 1;
  }

  private _getFilteredEntities(): string[] {
    if (!this.hass || !this._config) return [];

    let entities: string[] = discoverBatteryEntities(this.hass);

    // Apply presets by merging their exclude rules
    const presets = this._config.filter_presets || [];
    const presetExclude: FilterConfig[] = presets.flatMap((p) => {
      const preset = FILTER_PRESETS[p];
      return preset.exclude.map((f) => ({ ...f }));
    });

    const include = this._config.include || [];
    const exclude: FilterConfig[] = [...(this._config.exclude || []), ...presetExclude];

    entities = filterEntities(this.hass, entities, include, exclude);

    entities = sortEntities(this.hass, entities, this._config.sort);

    return entities;
  }

  private _toggleCollapsed = (): void => {
    this._showCollapsed = !this._showCollapsed;
  };

  private _renderCollapsedGroup(group: CollapsedGroup): ReturnType<typeof html> {
    const expandedEntities = this._renderCollapsedEntities(group);

    return html`
      <div class="collapsed-group" @click=${this._toggleCollapsed}>
        <div class="collapsed-info">
          <span class="collapsed-label">
            ${this._showCollapsed ? 'Hide' : 'Show'} ${group.count} more
            ${group.count === 1 ? 'entity' : 'entities'}
          </span>
          <span class="collapsed-range"> ${group.min}% - ${group.max}% </span>
        </div>
        <ha-icon icon="${this._showCollapsed ? 'mdi:chevron-up' : 'mdi:chevron-down'}"></ha-icon>
      </div>
      ${expandedEntities}
    `;
  }

  private _renderCollapsedEntities(group: CollapsedGroup): ReturnType<typeof html> {
    if (!this._showCollapsed) {
      return html``;
    }

    return html`${group.entities.map(
      (entityId) => html`
        <battery-entity
          .hass=${this.hass}
          .entityId=${entityId}
          .config=${this._config}
        ></battery-entity>
      `
    )}`;
  }

  protected render() {
    if (!this._config || !this.hass) {
      return html``;
    }

    const entities = this._getFilteredEntities();
    const { visible, collapsed } = applyCollapseThreshold(
      this.hass,
      entities,
      this._config.collapse_threshold
    );

    return html`
      <ha-card .header=${this._config.title}>
        <div class="card-content">${this._renderContent(visible, collapsed)}</div>
      </ha-card>
    `;
  }

  private _renderContent(visible: string[], collapsed?: CollapsedGroup): ReturnType<typeof html> {
    if (!visible.length) {
      return html`<div class="warning">No battery entities found</div>`;
    }

    return html`
      ${visible.map(
        (entityId) => html`
          <battery-entity
            .hass=${this.hass}
            .entityId=${entityId}
            .config=${this._config}
          ></battery-entity>
        `
      )}
      ${collapsed ? this._renderCollapsedGroup(collapsed) : ''}
    `;
  }

  static styles = css`
    :host {
      display: block;
    }

    .card-content {
      padding: 16px;
    }

    .warning {
      display: block;
      color: var(--error-color);
      padding: 8px;
    }

    .collapsed-group {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px;
      margin-top: 8px;
      background: var(--secondary-background-color);
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .collapsed-group:hover {
      background: var(--divider-color);
    }

    .collapsed-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .collapsed-label {
      font-weight: 500;
      color: var(--primary-text-color);
    }

    .collapsed-range {
      font-size: 0.9em;
      color: var(--secondary-text-color);
    }

    ha-icon {
      color: var(--secondary-text-color);
    }
  `;
}

// Register card with Home Assistant

declare global {
  interface Window {
    customCards?: Array<{
      type: string;
      name: string;
      description: string;
      preview?: boolean;
    }>;
  }
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'battery-status-card',
  name: 'Battery Status Card',
  preview: false,
  description: 'Display battery levels with auto-discovery and visual configuration',
});
