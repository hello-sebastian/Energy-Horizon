import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "../helpers/setup-dom";
import "../../src/index";
import type { HomeAssistant } from "../../src/ha-types";
import type { CardState } from "../../src/card/types";

// The card creates a real EChartsRenderer when it reaches the "ready" state, and
// zrender cannot paint in jsdom (no canvas). Stub the renderer module so the
// integration test exercises the load lifecycle without touching the chart.
vi.mock("../../src/card/echarts-renderer", () => ({
  EChartsRenderer: class {
    update = vi.fn();
  }
}));

type CardEl = import("../../src/card/cumulative-comparison-chart").EnergyHorizonCard & {
  setConfig: (c: unknown) => void;
  hass: HomeAssistant;
  _state: CardState;
  updateComplete: Promise<boolean>;
};

/**
 * The load-lifecycle fields are `private` on the card; redeclaring them in the `CardEl`
 * intersection would reduce it to `never`. Access them through this cast instead (types
 * are erased at runtime, so the cast is a no-op).
 */
type LoadInternals = { _loadGeneration: number; _inFlightGeneration: number | null };
const internals = (c: CardEl): LoadInternals => c as unknown as LoadInternals;

interface Deferred {
  resolve: (v: unknown) => void;
  reject: (e: unknown) => void;
  promise: Promise<unknown>;
}

function makeDeferred(): Deferred {
  let resolve!: (v: unknown) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<unknown>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { resolve, reject, promise };
}

/** Flush pending microtasks (e.g. a `_loadData` continuation after a deferred resolves). */
const flush = () => new Promise<void>((r) => setTimeout(r, 0));

/**
 * Build a valid LTS `statistics_during_period` response for `entityId` whose per-bucket
 * `change` values are `values`. The cumulative total of the resulting series is
 * `values.reduce((a, b) => a + b, 0)`.
 */
function ltsResponse(entityId: string, values: number[], unit = "kWh"): unknown {
  const start = Date.UTC(2024, 0, 1);
  const points = values.map((v, i) => ({
    start: new Date(start + i * 86_400_000).toISOString(),
    end: new Date(start + (i + 1) * 86_400_000).toISOString(),
    sum: null,
    state: null,
    mean: null,
    min: null,
    max: null,
    change: v,
    unit_of_measurement: unit
  }));
  return { results: { [entityId]: points } };
}

function makeHass(sendMessagePromise: () => Promise<unknown>): HomeAssistant {
  return {
    language: "en",
    locale: { language: "en", number_format: "language" },
    config: { time_zone: "UTC" },
    states: {
      "sensor.energy": {
        state: "10",
        attributes: { friendly_name: "Energy", unit_of_measurement: "kWh" }
      }
    },
    connection: { sendMessagePromise }
  } as unknown as HomeAssistant;
}

describe("energy-horizon-card load coalescing (issue #58)", () => {
  let el: CardEl;

  beforeEach(() => {
    el = document.createElement("energy-horizon-card") as CardEl;
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

  it("coalesces hass updates during an in-flight load into a single query batch", async () => {
    if (typeof el.setConfig !== "function") return;

    const calls: Deferred[] = [];
    const sendMessagePromise = () => {
      const d = makeDeferred();
      calls.push(d);
      return d.promise;
    };

    el.setConfig({
      type: "custom:energy-horizon-card",
      entity: "sensor.energy",
      comparison_preset: "year_over_year"
    });
    el.hass = makeHass(sendMessagePromise);
    await el.updateComplete;

    // First load (gen 1) is in flight; it issued one batch of N window queries.
    const windowCount = calls.length;
    expect(windowCount).toBeGreaterThan(0);

    // Simulate several `hass` updates arriving while the load is still in flight
    // (each a fresh object so `changedProps.has("hass")` is true).
    for (let i = 0; i < 5; i++) {
      el.hass = makeHass(sendMessagePromise);
      await el.updateComplete;
    }

    // Coalescing: no additional query batch was started for the same generation.
    expect(calls.length).toBe(windowCount);
    expect(internals(el)._inFlightGeneration).toBe(internals(el)._loadGeneration);

    // Clean up: resolve the in-flight load so it settles to a terminal state.
    for (const d of calls) d.resolve(ltsResponse("sensor.energy", [10, 20]));
    await flush();
    await el.updateComplete;
  });

  it("discards a stale in-flight load when the config changes mid-load (regression)", async () => {
    if (typeof el.setConfig !== "function") return;

    const calls: Deferred[] = [];
    const sendMessagePromise = () => {
      const d = makeDeferred();
      calls.push(d);
      return d.promise;
    };

    // Generation 1: config A.
    el.setConfig({
      type: "custom:energy-horizon-card",
      entity: "sensor.energy",
      comparison_preset: "year_over_year"
    });
    el.hass = makeHass(sendMessagePromise);
    await el.updateComplete;

    const gen1Count = calls.length;
    expect(gen1Count).toBeGreaterThan(0);
    const gen1 = internals(el)._loadGeneration;

    // Generation 2: config B while gen 1's load is still in flight.
    el.setConfig({
      type: "custom:energy-horizon-card",
      entity: "sensor.energy",
      comparison_preset: "month_over_year"
    });
    await el.updateComplete;

    // A second batch was started for the new generation.
    expect(internals(el)._loadGeneration).toBe(gen1 + 1);
    expect(calls.length).toBeGreaterThan(gen1Count);
    const gen2Count = calls.length - gen1Count;

    // Resolve ONLY the stale gen-1 load (config A data, total = 30).
    for (let i = 0; i < gen1Count; i++) {
      calls[i]!.resolve(ltsResponse("sensor.energy", [10, 20]));
    }
    await flush();
    await el.updateComplete;

    // The stale load must NOT have written its result: the card is still loading
    // (gen 2 is in flight), not ready with config A's data.
    expect(el._state.status).not.toBe("ready");
    expect(el._state.status).toBe("loading");

    // Now resolve the current gen-2 load (config B data, total = 300).
    for (let i = gen1Count; i < gen1Count + gen2Count; i++) {
      calls[i]!.resolve(ltsResponse("sensor.energy", [100, 200]));
    }
    await flush();
    await el.updateComplete;

    // Final state reflects the NEW config (gen 2), not the stale gen-1 data.
    expect(el._state.status).toBe("ready");
    expect(el._state.comparisonSeries?.current.total).toBe(300);
  });

  it("does not write an error state from a stale in-flight load after a config change", async () => {
    if (typeof el.setConfig !== "function") return;

    const calls: Deferred[] = [];
    const sendMessagePromise = () => {
      const d = makeDeferred();
      calls.push(d);
      return d.promise;
    };

    el.setConfig({
      type: "custom:energy-horizon-card",
      entity: "sensor.energy",
      comparison_preset: "year_over_year"
    });
    el.hass = makeHass(sendMessagePromise);
    await el.updateComplete;

    const gen1Count = calls.length;
    const gen1 = internals(el)._loadGeneration;

    // Change config while gen 1 is in flight.
    el.setConfig({
      type: "custom:energy-horizon-card",
      entity: "sensor.energy",
      comparison_preset: "month_over_year"
    });
    await el.updateComplete;
    const gen2Count = calls.length - gen1Count;

    // Make the stale gen-1 load REJECT (simulating an API error).
    for (let i = 0; i < gen1Count; i++) {
      calls[i]!.reject(new Error("boom"));
    }
    await flush();
    await el.updateComplete;

    // The stale gen-1 rejection must NOT have written an error state: the card is
    // still loading (gen 2 is in flight), not error.
    expect(el._state.status).not.toBe("error");
    expect(el._state.status).toBe("loading");

    // Resolve gen 2 successfully.
    for (let i = gen1Count; i < gen1Count + gen2Count; i++) {
      calls[i]!.resolve(ltsResponse("sensor.energy", [5, 5]));
    }
    await flush();
    await el.updateComplete;

    expect(el._state.status).toBe("ready");
    expect(internals(el)._loadGeneration).toBe(gen1 + 1);
  });
});
