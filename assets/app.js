import {
  formatWei,
  readFavorite,
  timeRemaining,
  validateAsset,
  writeFavorite,
} from "./nft-core.js";
import { previewAsset } from "./nft-data.js";

const mount = document.querySelector("[data-card-mount]");
const template = document.querySelector("#nft-card-template");
const dialog = document.querySelector("#artwork-dialog");
const dialogImage = document.querySelector("#dialog-image");
const dialogCaption = document.querySelector("#dialog-caption");

const errors = validateAsset(previewAsset);

if (!mount || !template || errors.length > 0) {
  if (mount) {
    mount.textContent = errors.length > 0
      ? "Preview metadata could not be rendered."
      : "Preview component is unavailable.";
  }
  throw new Error(errors.join(" ") || "Required preview DOM is missing.");
}

const fragment = template.content.cloneNode(true);
const card = fragment.querySelector("[data-nft-card]");

const setText = (selector, value) => {
  const element = fragment.querySelector(selector);
  if (element) element.textContent = value;
};

setText("[data-collection]", previewAsset.collection);
setText("[data-title]", previewAsset.title);
setText("[data-description]", previewAsset.description);
setText("[data-price]", formatWei(previewAsset.priceWei));
setText("[data-creator]", previewAsset.creator);
setText("[data-creator-handle]", previewAsset.creatorHandle);
setText("[data-token-id]", `#${previewAsset.tokenId}`);
setText("[data-chain]", previewAsset.chain);
setText("[data-provenance]", previewAsset.provenance);

const artwork = fragment.querySelector("[data-artwork]");
if (artwork) {
  artwork.src = previewAsset.mediaUrl;
  artwork.alt = previewAsset.mediaAlt;
}

const deadline = fragment.querySelector("[data-deadline]");
if (deadline) {
  deadline.dateTime = previewAsset.endsAt;
}

const countdown = fragment.querySelector("[data-countdown]");
let countdownTimer;

const updateCountdown = () => {
  if (!countdown) return;

  const remaining = timeRemaining(previewAsset.endsAt);
  countdown.textContent = remaining.label;
  countdown.setAttribute("aria-label", remaining.accessibleLabel);

  if (remaining.expired && countdownTimer) {
    window.clearInterval(countdownTimer);
  }
};

updateCountdown();
countdownTimer = window.setInterval(updateCountdown, 60_000);

const favoriteButton = fragment.querySelector("[data-favorite]");
if (favoriteButton) {
  let favorite = readFavorite(window.localStorage, previewAsset.tokenId);

  const paintFavorite = () => {
    favoriteButton.setAttribute("aria-pressed", String(favorite));
    favoriteButton.querySelector("[data-favorite-label]").textContent =
      favorite ? "Saved" : "Save";
  };

  favoriteButton.addEventListener("click", () => {
    favorite = !favorite;
    writeFavorite(window.localStorage, previewAsset.tokenId, favorite);
    paintFavorite();
  });

  paintFavorite();
}

const previewButton = fragment.querySelector("[data-preview]");
if (previewButton && dialog && dialogImage && dialogCaption) {
  previewButton.addEventListener("click", () => {
    dialogImage.src = previewAsset.mediaUrl;
    dialogImage.alt = previewAsset.mediaAlt;
    dialogCaption.textContent = previewAsset.title;

    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
  });
}

mount.replaceChildren(fragment);

const closeDialog = document.querySelector("[data-close-dialog]");
if (closeDialog && dialog) {
  closeDialog.addEventListener("click", () => dialog.close());
}

if (dialog) {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });
}

window.addEventListener("pagehide", () => {
  if (countdownTimer) window.clearInterval(countdownTimer);
});

if (card) {
  document.documentElement.dataset.enhanced = "true";
}
