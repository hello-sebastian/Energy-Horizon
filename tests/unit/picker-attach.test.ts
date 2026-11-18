import { describe, expect, it, vi } from "vitest";
import type { HomeAssistant } from "../../src/ha-types";
import type {
  CardConfig,
  CardState,
  ReadyState,
  MergedTimeWindowConfig
} from "../../src/card/types";
import { buildMergedTimeWindowConfig } from "../../src/card/time-windows";
import {
  attachPicker,
  buildPickerDemoState,
  type PickerController,
  type PickerHost
} from "../../src/card/picker/attach-picker";

const ENTITY_ID = "sensor.energy";
const NOW = new Date("2025-06-15T12:00:00Z");

/** LTS fixture: one 999 kWh bucket in the current window. */
const ltsResponse = {
  results: {
    [ENTITY_ID]: [
      { start: "2025-01-01T00:00:00Z", change: 999, unit_of_measurement: "kWh" }
    ]
  }
};

const DEFAULT_MERGED: MergedTimeWindowConfig = buildMergedTimeWindowConfig({
  comparison_preset: "year_over_year"
});

function makeHass(
  states: Record<
    string,
    { state: string; attributes: Record<string, unknown> }
  > = {},
  send: (msg: Record<string, unknown>) => Promise<unknown> = async () => ({})
): HomeAssistant {
  return {
    language: "en",
    locale: { language: "en", number_format: "language" },
    config: { time_zone: "UTC" },
    states,
    connection: { sendMessagePromise: send }
  } as unknown as HomeAssistant;
}

function makeConfig(overrides: Partial<CardConfig> = {}): CardConfig {
  return {
    type: "custom:energy-horizon-card",
    entity: ENTITY_ID,
    comparison_preset: "year_over_year",
    interpretation: "consumption",
    neutral_threshold: 2,
    ...overrides
  } as CardConfig;
}

const kWhState = { state: "42", attributes: { unit_of_measurement: "kWh" } };

/**
 * Fake element host: mirrors the element wiring — `onState` writes the live
 * `state`, so `fireRealDataQuery` reads the demo state it just reported.
 */
function makeFakeHost(
  opts: {
    hass?: HomeAssistant;
    preview?: boolean;
    cardConfig?: CardConfig | undefined;
  } = {}
) {
  const hass = opts.hass ?? makeHass();
  const preview = opts.preview ?? true;
  let cardConfig = opts.cardConfig;
  let state: CardState = { status: "loading" };
  let loadGeneration = 0;
  const onState = vi.fn((s: CardState) => {
    state = s;
  });
  const host: PickerHost = {
    get hass() {
      return hass;
    },
    get preview() {
      return preview;
    },
    get cardConfig() {
      return cardConfig;
    },
    get state() {
      return state;
    },
    get mergedTimeWindow() {
      return DEFAULT_MERGED;
    },
    get loadGeneration() {
      return loadGeneration;
    },
    bumpLoadGeneration() {
      loadGeneration += 1;
    }
  };
  return {
    host,
    onState,
    controller: (config?: CardConfig): PickerController =>
      attachPicker(host, config, onState),
    setCardConfig: (config: CardConfig | undefined) => {
      cardConfig = config;
    },
    getState: (): CardState => state,
    getLoadGeneration: (): number => loadGeneration
  };
}

/** Let pending real-data promises settle (well inside the 2.5 s query timeout). */
async function settle(ms = 50): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

describe("buildPickerDemoState", () => {
  const hass = makeHass({ [ENTITY_ID]: kWhState });

  it("is deterministic (no Math.random, no clock reads)", () => {
    const config = makeConfig();
    const a = buildPickerDemoState(hass, config, DEFAULT_MERGED, NOW);
    const b = buildPickerDemoState(hass, config, DEFAULT_MERGED, NOW);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("builds a ready state with a demo current and reference series and two windows", () => {
    const state = buildPickerDemoState(hass, makeConfig(), DEFAULT_MERGED, NOW);
    expect(state.status).toBe("ready");
    const ready = state as ReadyState;
    expect(ready.comparisonSeries.current.points.length).toBeGreaterThan(0);
    expect(ready.comparisonSeries.reference?.points.length).toBeGreaterThan(0);
    expect(ready.resolvedWindows?.length).toBe(2);
    expect(ready.chartTime?.timeline.length).toBeGreaterThan(0);
  });

  it("uses the entity's supported unit for the demo series", () => {
    const state = buildPickerDemoState(hass, makeConfig(), DEFAULT_MERGED, NOW);
    expect((state as ReadyState).comparisonSeries.current.unit).toBe("kWh");
  });

  it('falls back to "kWh" for an unsupported unit', () => {
    const tempHass = makeHass({
      [ENTITY_ID]: { state: "21", attributes: { unit_of_measurement: "°C" } }
    });
    const state = buildPickerDemoState(tempHass, makeConfig(), DEFAULT_MERGED, NOW);
    expect((state as ReadyState).comparisonSeries.current.unit).toBe("kWh");
  });

  it('falls back to "kWh" when the entity is absent from hass.states', () => {
    const state = buildPickerDemoState(
      makeHass(),
      makeConfig(),
      DEFAULT_MERGED,
      NOW
    );
    expect((state as ReadyState).comparisonSeries.current.unit).toBe("kWh");
  });
});

describe("attachPicker", () => {
  it("reports the deterministic demo state synchronously, then upgrades to real data", async () => {
    const send = vi.fn(async () => ltsResponse);
    const fake = makeFakeHost({ hass: makeHass({ [ENTITY_ID]: kWhState }, send) });
    const controller = fake.controller(makeConfig());

    controller.startSession(NOW);
    // Demo-first: one synchronous report, ready state, demo unit.
    expect(fake.onState).toHaveBeenCalledTimes(1);
    expect(fake.getState().status).toBe("ready");
    expect((fake.getState() as ReadyState).comparisonSeries.current.unit).toBe(
      "kWh"
    );

    await settle();
    // The time-limited query fired (two windows → two LTS queries) and
    // succeeded → the preview was upgraded in place to the real data.
    expect(send).toHaveBeenCalledTimes(2);
    expect(fake.onState).toHaveBeenCalledTimes(2);
    const upgraded = fake.getState() as ReadyState;
    expect(upgraded.comparisonSeries.current.total).toBe(999);
    expect(upgraded.summary.current_cumulative).toBe(999);
  });

  it("keeps the demo state when the real-data query rejects", async () => {
    const send = vi.fn(async () => {
      throw new Error("boom");
    });
    const fake = makeFakeHost({ hass: makeHass({}, send) });
    fake.setCardConfig(makeConfig());
    fake.controller().startSession(NOW);
    expect(fake.onState).toHaveBeenCalledTimes(1);
    await settle();
    expect(fake.onState).toHaveBeenCalledTimes(1);
    expect((fake.getState() as ReadyState).comparisonSeries.current.unit).toBe(
      "kWh"
    );
  });

  it("keeps the demo state when the real-data response has no usable points", async () => {
    const send = vi.fn(async () => ({ results: { [ENTITY_ID]: [] } }));
    const fake = makeFakeHost({ hass: makeHass({}, send) });
    fake.setCardConfig(makeConfig());
    fake.controller().startSession(NOW);
    expect(fake.onState).toHaveBeenCalledTimes(1);
    await settle();
    expect(fake.onState).toHaveBeenCalledTimes(1);
    expect((fake.getState() as ReadyState).comparisonSeries.current.unit).toBe(
      "kWh"
    );
  });

  it("fires the real-data query at most once per controller", async () => {
    const send = vi.fn(async () => {
      throw new Error("boom");
    });
    const fake = makeFakeHost({ hass: makeHass({}, send) });
    fake.setCardConfig(makeConfig());
    const controller = fake.controller();
    controller.startSession(NOW);
    await settle();
    expect(send).toHaveBeenCalledTimes(2);
    controller.startSession(NOW);
    await settle();
    // The second startSession re-reports the demo state…
    expect(fake.onState).toHaveBeenCalledTimes(2);
    // …but never re-fires the real-data query.
    expect(send).toHaveBeenCalledTimes(2);
  });

  it("discards a stale real-data result when the load generation changes in flight", async () => {
    const send = vi.fn(
      () =>
        new Promise<unknown>((resolve) =>
          setTimeout(() => resolve(ltsResponse), 40)
        )
    );
    const fake = makeFakeHost({ hass: makeHass({ [ENTITY_ID]: kWhState }, send) });
    fake.setCardConfig(makeConfig());
    const controller = fake.controller();
    controller.startSession(NOW);
    expect(fake.onState).toHaveBeenCalledTimes(1);
    // Config changed while the query is in flight → the result must be discarded.
    fake.host.bumpLoadGeneration();
    await settle(120);
    expect(fake.onState).toHaveBeenCalledTimes(1);
    expect((fake.getState() as ReadyState).comparisonSeries.current.total).not.toBe(999);
  });

  it("bumps the host's load generation on disconnect", () => {
    const fake = makeFakeHost();
    const controller = fake.controller();
    const before = fake.getLoadGeneration();
    controller.onDisconnected();
    expect(fake.getLoadGeneration()).toBe(before + 1);
  });

  it("reports the demo state but skips the real-data query when preview is false", async () => {
    const send = vi.fn(async () => ltsResponse);
    const fake = makeFakeHost({ hass: makeHass({}, send), preview: false });
    fake.setCardConfig(makeConfig());
    fake.controller().startSession(NOW);
    expect(fake.onState).toHaveBeenCalledTimes(1);
    expect(fake.getState().status).toBe("ready");
    await settle();
    expect(send).not.toHaveBeenCalled();
    expect(fake.onState).toHaveBeenCalledTimes(1);
  });

  it("reports the demo state but skips the query when the config has no entity", async () => {
    const send = vi.fn(async () => ltsResponse);
    const fake = makeFakeHost({ hass: makeHass({}, send) });
    fake.controller(makeConfig({ entity: "" })).startSession(NOW);
    expect(fake.onState).toHaveBeenCalledTimes(1);
    expect(fake.getState().status).toBe("ready");
    await settle();
    expect(send).not.toHaveBeenCalled();
  });

  it("does nothing when neither the host nor the mount provide a config", async () => {
    const send = vi.fn(async () => ltsResponse);
    const fake = makeFakeHost({ hass: makeHass({}, send), cardConfig: undefined });
    fake.controller(undefined).startSession(NOW);
    expect(fake.onState).not.toHaveBeenCalled();
    await settle();
    expect(send).not.toHaveBeenCalled();
  });

  it("falls back to the mount-time config when the host's cardConfig is absent", () => {
    const fake = makeFakeHost({ hass: makeHass() });
    const controller = fake.controller(makeConfig());
    controller.startSession(NOW);
    expect(fake.onState).toHaveBeenCalledTimes(1);
    expect((fake.getState() as ReadyState).comparisonSeries.current.unit).toBe(
      "kWh"
    );
  });

  it("prefers the host's live cardConfig over the mount-time fallback", () => {
    const hass = makeHass({
      "sensor.mwh": { state: "1", attributes: { unit_of_measurement: "MWh" } }
    });
    const fake = makeFakeHost({ hass });
    const controller = fake.controller(makeConfig({ entity: "sensor.missing" }));
    controller.startSession(NOW);
    // Missing entity → the "kWh" demo fallback.
    expect((fake.getState() as ReadyState).comparisonSeries.current.unit).toBe(
      "kWh"
    );
    fake.setCardConfig(makeConfig({ entity: "sensor.mwh" }));
    controller.startSession(NOW);
    expect(fake.onState).toHaveBeenCalledTimes(2);
    // The live config now drives the demo series unit.
    expect((fake.getState() as ReadyState).comparisonSeries.current.unit).toBe(
      "MWh"
    );
  });

  it("starts an independent session per controller (per element instance)", async () => {
    const make = () =>
      makeFakeHost({
        hass: makeHass({ [ENTITY_ID]: kWhState }, vi.fn(async () => ltsResponse))
      });
    const a = make();
    const b = make();
    a.setCardConfig(makeConfig());
    b.setCardConfig(makeConfig());
    const controllerA = a.controller();
    const controllerB = b.controller();
    controllerA.startSession(NOW);
    controllerB.startSession(NOW);
    await settle();
    // Both sessions upgrade independently — the "fired once" flag is per
    // controller, not shared across element instances.
    expect(a.onState).toHaveBeenCalledTimes(2);
    expect(b.onState).toHaveBeenCalledTimes(2);
    expect((a.getState() as ReadyState).summary.current_cumulative).toBe(999);
    expect((b.getState() as ReadyState).summary.current_cumulative).toBe(999);
  });
});
