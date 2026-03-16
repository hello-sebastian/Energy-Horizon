import { css } from "lit";

export const energyHorizonCardStyles = css`
  :host {
    display: block;
  }

  .loading {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px;
  }

  .content {
    padding: 16px;
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
    height: 200px;
  }
`;

