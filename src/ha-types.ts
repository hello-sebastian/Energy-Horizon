export interface HomeAssistant {
  language: string;
  locale?: {
    language: string;
    number_format?: "comma" | "decimal" | "language" | "system";
  };
  config?: {
    time_zone?: string;
  };
  states?: Record<string, { state: string; attributes: Record<string, unknown> }>;
  connection: {
    sendMessagePromise<T = unknown>(_msg: Record<string, unknown>): Promise<T>;
  };
}

export interface LovelaceCard extends HTMLElement {
  hass: HomeAssistant;
  setConfig(_config: unknown): void;
  getCardSize?(): number;
}

