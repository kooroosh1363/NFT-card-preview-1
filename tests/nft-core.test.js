import test from "node:test";
import assert from "node:assert/strict";

import {
  favoriteStorageKey,
  formatWei,
  readFavorite,
  timeRemaining,
  validateAsset,
  writeFavorite,
} from "../assets/nft-core.js";

test("formatWei preserves exact integer precision", () => {
  assert.equal(formatWei("0"), "0 ETH");
  assert.equal(formatWei("1000000000000000000"), "1 ETH");
  assert.equal(formatWei("33000000000000000"), "0.033 ETH");
  assert.equal(formatWei("1234567890123456789"), "1.234567890123456789 ETH");
});

test("formatWei rejects non-integer input", () => {
  assert.throws(() => formatWei("1.5"), TypeError);
  assert.throws(() => formatWei("-1"), TypeError);
  assert.throws(() => formatWei("abc"), TypeError);
});

test("timeRemaining produces deterministic day/hour/minute labels", () => {
  const result = timeRemaining("2027-01-03T03:30:00Z", Date.parse("2027-01-01T00:00:00Z"));

  assert.equal(result.expired, false);
  assert.equal(result.days, 2);
  assert.equal(result.hours, 3);
  assert.equal(result.minutes, 30);
  assert.equal(result.label, "2d 3h 30m");
  assert.match(result.accessibleLabel, /2 days/);
});

test("timeRemaining clamps expired deadlines to zero", () => {
  const result = timeRemaining("2026-01-01T00:00:00Z", Date.parse("2026-01-02T00:00:00Z"));

  assert.equal(result.expired, true);
  assert.equal(result.totalSeconds, 0);
  assert.equal(result.label, "Ended");
});

test("asset validation reports malformed metadata", () => {
  const errors = validateAsset({
    title: "",
    collection: "Collection",
    description: "Description",
    mediaUrl: "./image.jpg",
    mediaAlt: "Description",
    creator: "Creator",
    tokenId: "1",
    chain: "Ethereum",
    priceWei: "1.2",
    endsAt: "not-a-date",
  });

  assert.ok(errors.some((error) => error.includes("title")));
  assert.ok(errors.some((error) => error.includes("priceWei")));
  assert.ok(errors.some((error) => error.includes("endsAt")));
});

test("favorite state uses a token-scoped storage key", () => {
  const values = new Map();
  const storage = {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
  };

  assert.equal(favoriteStorageKey("5677"), "nft-preview:favorite:5677");
  assert.equal(readFavorite(storage, "5677"), false);
  assert.equal(writeFavorite(storage, "5677", true), true);
  assert.equal(readFavorite(storage, "5677"), true);
  assert.equal(readFavorite(storage, "9999"), false);
});

test("favorite persistence fails safely when storage is unavailable", () => {
  const blockedStorage = {
    getItem() {
      throw new Error("blocked");
    },
    setItem() {
      throw new Error("blocked");
    },
  };

  assert.equal(readFavorite(blockedStorage, "5677"), false);
  assert.equal(writeFavorite(blockedStorage, "5677", true), false);
});
