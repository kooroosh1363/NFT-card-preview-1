export const WEI_PER_ETH = 10n ** 18n;

export function validateAsset(asset) {
  const errors = [];

  if (!asset || typeof asset !== "object") {
    return ["Asset metadata must be an object."];
  }

  for (const field of ["title", "collection", "description", "mediaUrl", "mediaAlt", "creator", "tokenId", "chain", "priceWei", "endsAt"]) {
    if (typeof asset[field] !== "string" || asset[field].trim() === "") {
      errors.push(`${field} is required.`);
    }
  }

  if (typeof asset.priceWei === "string" && !/^\d+$/.test(asset.priceWei)) {
    errors.push("priceWei must contain only base-10 integer digits.");
  }

  if (typeof asset.endsAt === "string" && Number.isNaN(Date.parse(asset.endsAt))) {
    errors.push("endsAt must be a valid ISO-compatible date.");
  }

  return errors;
}

export function formatWei(weiValue) {
  const raw = String(weiValue);

  if (!/^\d+$/.test(raw)) {
    throw new TypeError("Wei value must be a non-negative integer string.");
  }

  const wei = BigInt(raw);
  const whole = wei / WEI_PER_ETH;
  const remainder = wei % WEI_PER_ETH;

  if (remainder === 0n) {
    return `${whole} ETH`;
  }

  const fraction = remainder
    .toString()
    .padStart(18, "0")
    .replace(/0+$/, "");

  return `${whole}.${fraction} ETH`;
}

export function timeRemaining(endsAt, nowMs = Date.now()) {
  const endMs = Date.parse(endsAt);

  if (Number.isNaN(endMs)) {
    throw new TypeError("endsAt must be a valid date.");
  }

  const totalSeconds = Math.max(0, Math.floor((endMs - nowMs) / 1000));
  const expired = totalSeconds === 0;

  if (expired) {
    return {
      expired: true,
      totalSeconds: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      label: "Ended",
      accessibleLabel: "Preview period ended",
    };
  }

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const parts = [];
  const accessible = [];

  if (days > 0) {
    parts.push(`${days}d`);
    accessible.push(`${days} day${days === 1 ? "" : "s"}`);
  }

  parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  accessible.push(`${hours} hour${hours === 1 ? "" : "s"}`);
  accessible.push(`${minutes} minute${minutes === 1 ? "" : "s"}`);

  return {
    expired: false,
    totalSeconds,
    days,
    hours,
    minutes,
    label: parts.join(" "),
    accessibleLabel: `${accessible.join(", ")} remaining`,
  };
}

export function favoriteStorageKey(tokenId) {
  const normalized = String(tokenId).trim();
  if (!normalized) {
    throw new TypeError("tokenId is required.");
  }

  return `nft-preview:favorite:${normalized}`;
}

export function readFavorite(storage, tokenId) {
  try {
    return storage.getItem(favoriteStorageKey(tokenId)) === "true";
  } catch {
    return false;
  }
}

export function writeFavorite(storage, tokenId, favorite) {
  try {
    storage.setItem(favoriteStorageKey(tokenId), favorite ? "true" : "false");
    return true;
  } catch {
    return false;
  }
}
