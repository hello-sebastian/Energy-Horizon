export interface HomeAssistant {
  language: string;
  locale?: {
    language: string;
    number_format?: "comma" | "decimal" | "language" | "system";
    /** Home Assistant user setting: `"12"` | `"24"` | `"language"` */
    time_format?: string;
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

export type HaFormSchema =
  | { name: string; selector: { entity: { domain?: string } }; required?: boolean }
  | { name: string; selector: { text: Record<string, never> }; required?: boolean }
  | {
      name: string;
      selector: { select: { options: Array<{ value: string; label: string }> } };
      required?: boolean;
    };

export interface LovelaceCardEditor extends HTMLElement {
  hass?: HomeAssistant;
  setConfig(_config: unknown): void;
}

export interface CustomCardDeclaration {
  type: string;
  name: string;
  description: string;
}

declare global {
  interface Window {
    jsyaml?: {
      dump(obj: unknown, options?: Record<string, unknown>): string;
      load(str: string): unknown;
    };
    customCards?: CustomCardDeclaration[];
  }
}
