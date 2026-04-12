import { describe, it, expect } from "vitest";
import { findTimelineSlotContainingInstant } from "../../src/card/axis/now-marker-slot";

describe("findTimelineSlotContainingInstant", () => {
  it("returns -1 for empty timeline", () => {
    expect(findTimelineSlotContainingInstant([], Date.now())).toBe(-1);
  });

  it("returns -1 when now is before first slot", () => {
    const t = [1000, 2000, 3000];
    expect(findTimelineSlotContainingInstant(t, 999)).toBe(-1);
  });

  it("hourly axis: picks hour 14 not slot 0", () => {
    const hourMs = 3600000;
    const day0 = Date.UTC(2026, 3, 11, 0, 0, 0, 0);
    const timeline = Array.from({ length: 24 }, (_, i) => day0 + i * hourMs);
    const nowMs = day0 + 14 * hourMs + 15 * 60 * 1000;
    expect(findTimelineSlotContainingInstant(timeline, nowMs)).toBe(14);
  });

  it("single month slot contains instant in that month", () => {
    const monthStart = Date.UTC(2026, 3, 1, 0, 0, 0, 0);
    const timeline = [monthStart];
    const nowMs = Date.UTC(2026, 3, 15, 12, 0, 0, 0);
    expect(findTimelineSlotContainingInstant(timeline, nowMs)).toBe(0);
  });

  it("two month slots: second month", () => {
    const m0 = Date.UTC(2026, 2, 1, 0, 0, 0, 0);
    const m1 = Date.UTC(2026, 3, 1, 0, 0, 0, 0);
    const timeline = [m0, m1];
    const nowMs = Date.UTC(2026, 3, 10, 8, 0, 0, 0);
    expect(findTimelineSlotContainingInstant(timeline, nowMs)).toBe(1);
  });

  it("daily axis: instant on that calendar day", () => {
    const d0 = Date.UTC(2026, 0, 1, 0, 0, 0, 0);
    const d1 = Date.UTC(2026, 0, 2, 0, 0, 0, 0);
    const d2 = Date.UTC(2026, 0, 3, 0, 0, 0, 0);
    const timeline = [d0, d1, d2];
    const nowMs = Date.UTC(2026, 0, 2, 18, 30, 0, 0);
    expect(findTimelineSlotContainingInstant(timeline, nowMs)).toBe(1);
  });

  it("last slot is open-ended toward +infinity", () => {
    const t = [5000, 6000];
    expect(findTimelineSlotContainingInstant(t, 9_000_000)).toBe(1);
  });

  it("boundary: instant at slot start belongs to that slot", () => {
    const t = [1000, 2000, 3000];
    expect(findTimelineSlotContainingInstant(t, 2000)).toBe(1);
  });

  it("boundary: instant exactly at last slot start", () => {
    const t = [1000, 2000];
    expect(findTimelineSlotContainingInstant(t, 2000)).toBe(1);
  });
});
