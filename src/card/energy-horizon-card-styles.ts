import { css } from "lit";

export const energyHorizonCardStyles = css`
  :host {
    display: block;
    height: 100%;
  }

  .loading {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px;
  }

  .content {
    padding: 16px;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
  }

  .heading {
    margin-bottom: 12px;
    font-weight: 500;
  }

  .summary {
    margin-bottom: 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 0.9rem;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    gap: 8px;
  }

  .summary-row .label {
    color: var(--secondary-text-color);
  }

  .summary-row .value {
    font-weight: 500;
  }

  .summary-note {
    margin-top: 4px;
    font-size: 0.8rem;
    color: var(--secondary-text-color);
  }

  .forecast {
    margin-bottom: 12px;
    font-size: 0.9rem;
  }

  .chart-container {
    position: relative;
    flex: 1 1 auto;
    /* ECharts requires a non-zero container height.
       In Home Assistant cards, percentage heights are often not resolved,
       so a plain min-height: 0 can collapse the chart to 0px. */
    min-height: 240px;
  }

  .ebc-card {
    height: 100%;
    box-sizing: border-box;
  }

  .ebc-title-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  .ebc-title {
    font-weight: 500;
    color: var(--primary-text-color);
  }

  .ebc-icon {
    display: inline-flex;
    --mdc-icon-size: 24px;
  }
`;

