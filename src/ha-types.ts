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
    sendMessagePromise(_msg: Record<string, unknown>): Promise<unknown>;
  };
}

export interface LovelaceCard extends HTMLElement {
  hass: HomeAssistant;
  setConfig(_config: unknown): void;
  getCardSize?(): number;
}

/**
 * A generic Lovelace card config object. Card-specific configs (e.g.
 * `CardConfig`) are structurally compatible with this type.
 */
export type LovelaceCardConfig = Record<string, unknown>;

/**
 * A suggestion returned by a card's `getEntitySuggestion` hook, used by the
 * "Add card" picker's "by entity" view to pre-fill a card config for the
 * selected entity.
 */
export interface CustomCardSuggestion {
  /** Optional label shown in the picker (defaults to the card name). */
  label?: string;
  /** The card config to pre-fill for the selected entity. */
  config: LovelaceCardConfig;
}

export type HaFormSchema =
  | { name: string; selector: { entity: { domain?: string } }; required?: boolean }
  | { name: string; selector: { text: Record<string, never> }; required?: boolean }
  | {
      name: string;
      selector: { select: { options: Array<{ value: string; label: string }> } };
      required?: boolean;
    }
  | { name: string; selector: { boolean: Record<string, never> }; required?: boolean };

export interface LovelaceCardEditor extends HTMLElement {
  hass?: HomeAssistant;
  setConfig(_config: unknown): void;
}

export interface CustomCardDeclaration {
  type: string;
  name: string;
  description: string;
  /**
   * When `true`, the card is offered in the "Add card" picker's preview
   * (the card is rendered with sample data in the picker).
   */
  preview?: boolean;
  /** URL shown as a "documentation" link in the card picker / editor. */
  documentationURL?: string;
  /**
   * Optional hook used by the "Add card" picker's "by entity" view: given the
   * selected entity, return a pre-filled card config suggestion, or `null`
   * when the card does not support the entity. Must be synchronous, total,
   * and non-throwing — throwing cards are dropped by the picker.
   */
  getEntitySuggestion?(
    hass: HomeAssistant,
    entityId: string
  ): CustomCardSuggestion | null;
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
