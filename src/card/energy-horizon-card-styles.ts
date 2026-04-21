import { css } from "lit";

export const energyHorizonCardStyles = css`
  :host {
    display: block;
    height: 100%;
    /* Figma colors/accent/ehorizon — override via Card Mod or YAML primary_color / ha-* */
    --eh-series-current: #119894;
    --ebc-header-gap: 19px;
  }

  .loading {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px;
  }

  .content {
    padding: var(--ebc-pad, 24px);
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: var(--ebc-gap, 16px);
  }

  .ebc-card {
    height: 100%;
    box-sizing: border-box;
  }

  .ebc-section--header {
    flex-shrink: 0;
  }

  .ebc-header-row {
    display: flex;
    align-items: center;
    gap: var(--ebc-header-gap, 19px);
  }

  .ebc-header-icon-wrap {
    flex-shrink: 0;
    width: 42px;
    height: 42px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: color-mix(
      in srgb,
      var(--divider-color) 35%,
      var(--card-background-color, var(--ha-card-background, transparent))
    );
  }

  .ebc-icon {
    display: inline-flex;
    --mdc-icon-size: 24px;
    color: var(--primary-text-color);
  }

  .ebc-header-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .ebc-header-title {
    font-weight: 700;
    font-size: 1rem;
    line-height: 1.25;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--primary-text-color);
  }

  .ebc-header-entity {
    font-size: 0.8rem;
    line-height: 1.2;
    color: var(
      --disabled-text-color,
      var(--secondary-text-color)
    );
    word-break: break-all;
  }

  .ebc-section--comparison,
  .ebc-section--forecast-total {
    flex-shrink: 0;
  }

  /* Figma: Data series info — Container / Surface Container (surface-1) */
  .ebc-section--comparison {
    padding: 16px;
    border-radius: 16px;
    background-color: color-mix(
      in srgb,
      var(--divider-color) 22%,
      var(--card-background-color, var(--ha-card-background, transparent))
    );
  }

  .ebc-comparison-grid,
  .ebc-surface-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    align-items: start;
    gap: 0 24px;
    padding: 0 8px;
    box-sizing: border-box;
  }

  .ebc-comparison-col,
  .ebc-surface-col {
    min-width: 0;
  }

  .ebc-comparison-divider {
    width: 1px;
    align-self: stretch;
    min-height: 48px;
    background-color: var(--divider-color);
    opacity: 0.85;
  }

  /* Figma: Series label — Medium 12, ~5% tracking (§4.3 specs/001-figma-ui-rollout/figma-ui-project-source.md) */
  .ebc-series-caption {
    display: flex;
    align-items: center;
    gap: 11px;
    padding-bottom: 8px;
  }

  .ebc-series-swatch {
    flex-shrink: 0;
    width: 12px;
    height: 3px;
    border-radius: 2px;
    background-color: var(--eh-series-current);
  }

  .ebc-series-swatch--reference {
    background-color: color-mix(
      in srgb,
      var(--secondary-text-color) 55%,
      var(--card-background-color, var(--ha-card-background, transparent))
    );
  }

  .ebc-series-caption-text {
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.05em;
    line-height: 1.2;
    color: var(--primary-text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ebc-caption {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--secondary-text-color);
    margin-bottom: 8px;
    line-height: 1.3;
  }

  .ebc-caption--strong {
    font-weight: 600;
  }

  .ebc-value-row {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 4px;
  }

  .ebc-value {
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.2;
    color: var(--primary-text-color);
  }

  /* Figma Data status: Current — large value; Reference — medium + secondary tone */
  .ebc-value-num--current {
    font-size: 2.5rem;
    font-weight: 700;
    line-height: 1;
    color: var(--primary-text-color);
  }

  .ebc-value-num--reference {
    font-size: 2rem;
    font-weight: 500;
    line-height: 1;
    color: var(--secondary-text-color);
  }

  .ebc-value-unit {
    font-size: 1rem;
    font-weight: 400;
    line-height: 1;
    color: var(--secondary-text-color);
  }

  .ebc-value--reference {
    font-weight: 500;
    color: var(--secondary-text-color);
  }

  .ebc-delta-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    padding: 4px 8px;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    width: fit-content;
    max-width: 100%;
    flex-wrap: wrap;
    box-sizing: border-box;
  }

  .ebc-delta-sep {
    opacity: 0.45;
    font-weight: 500;
  }

  .ebc-trend--negative {
    color: var(--error-color);
    background-color: color-mix(in srgb, var(--error-color) 10%, transparent);
  }

  .ebc-trend--positive {
    color: var(--success-color);
    background-color: color-mix(in srgb, var(--success-color) 10%, transparent);
  }

  .ebc-trend--neutral {
    color: var(--secondary-text-color);
    background-color: color-mix(
      in srgb,
      var(--divider-color) 40%,
      var(--card-background-color, var(--ha-card-background, transparent))
    );
  }

  .ebc-trend--unknown {
    color: var(--secondary-text-color);
    background-color: color-mix(
      in srgb,
      var(--divider-color) 35%,
      var(--card-background-color, var(--ha-card-background, transparent))
    );
  }

  .ebc-trend--insufficient {
    color: var(--disabled-text-color);
    background-color: color-mix(
      in srgb,
      var(--divider-color) 25%,
      var(--card-background-color, var(--ha-card-background, transparent))
    );
  }

  .ebc-section--forecast-total {
    padding: 16px;
    border-radius: 16px;
    background-color: color-mix(
      in srgb,
      var(--divider-color) 22%,
      var(--card-background-color, var(--ha-card-background, transparent))
    );
  }

  .ebc-surface-value-row {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 4px;
  }

  /* Figma Data status Default: 16px Bold value + 16px Regular unit (pixel parity vs HA root rem). */
  .ebc-surface-value-num {
    font-size: 16px;
    font-weight: 700;
    line-height: 1;
    color: var(--primary-text-color);
  }

  .ebc-surface-value-num--muted {
    font-weight: 500;
    color: var(--secondary-text-color);
  }

  .ebc-surface-value-unit {
    font-size: 16px;
    font-weight: 400;
    line-height: 1;
    color: var(--secondary-text-color);
  }

  .ebc-forecast-confidence {
    margin-top: 8px;
    font-size: 0.6875rem;
    line-height: 1.35;
    color: var(--secondary-text-color);
    text-align: left;
    width: 100%;
  }

  .ebc-section--chart {
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .chart-container {
    position: relative;
    flex: 1 1 auto;
    min-height: 240px;
  }

  .ebc-section--comment {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    flex-shrink: 0;
    padding: 16px;
    border-radius: 16px;
    background-color: color-mix(
      in srgb,
      var(--divider-color) 22%,
      var(--card-background-color, var(--ha-card-background, transparent))
    );
  }

  /* Figma Inteligent comment — 40px icon hit area, MDI 24px (§3 specs/001-figma-ui-rollout/figma-ui-project-source.md) */
  .ebc-comment-icon-wrap {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    overflow: visible;
  }

  /* Strip HA default square/paper background so only the circular wrap is visible. */
  .ebc-comment-icon-wrap ha-icon {
    background: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
  }

  .ebc-comment-icon-wrap.ebc-trend--negative {
    background-color: color-mix(
      in srgb,
      var(--error-color) 16%,
      transparent
    );
  }

  .ebc-comment-icon-wrap.ebc-trend--positive {
    background-color: color-mix(
      in srgb,
      var(--success-color) 16%,
      transparent
    );
  }

  .ebc-comment-icon-wrap.ebc-trend--neutral,
  .ebc-comment-icon-wrap.ebc-trend--unknown {
    background-color: color-mix(
      in srgb,
      var(--divider-color) 35%,
      var(--card-background-color, var(--ha-card-background, transparent))
    );
  }

  .ebc-comment-icon-wrap.ebc-trend--insufficient {
    background-color: color-mix(
      in srgb,
      var(--divider-color) 22%,
      var(--card-background-color, var(--ha-card-background, transparent))
    );
  }

  .ebc-comment-icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    --mdc-icon-size: 24px;
    background: transparent !important;
    border-radius: 0;
    box-shadow: none !important;
  }

  .ebc-comment-icon.ebc-trend--negative {
    color: var(--error-color);
  }

  .ebc-comment-icon.ebc-trend--positive {
    color: var(--success-color);
  }

  .ebc-comment-icon.ebc-trend--neutral,
  .ebc-comment-icon.ebc-trend--unknown {
    color: var(--secondary-text-color);
  }

  .ebc-comment-icon.ebc-trend--insufficient {
    color: var(--disabled-text-color);
  }

  .ebc-comment-text {
    font-size: 0.9rem;
    line-height: 1.45;
    color: var(--primary-text-color);
  }

  .ebc-comment-text--muted {
    color: var(--secondary-text-color);
  }

  .ebc-comment-emphasis {
    font-weight: 700;
    color: var(--primary-text-color);
  }

  .ebc-section--warning {
    flex-shrink: 0;
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 8px 16px;
    border-radius: 16px;
    font-size: 0.8rem;
    line-height: 1.45;
    color: var(--primary-text-color);
    background-color: color-mix(in srgb, var(--warning-color) 8%, transparent);
  }

  .ebc-warning-icon {
    flex-shrink: 0;
    margin-top: 1px;
    --mdc-icon-size: 18px;
    color: var(--warning-color);
  }
`;
