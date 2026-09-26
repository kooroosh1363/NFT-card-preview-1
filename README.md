# ChainFrame — Data-Driven NFT Preview Component

[![Quality](https://github.com/kooroosh1363/NFT-card-preview-1/actions/workflows/quality.yml/badge.svg)](https://github.com/kooroosh1363/NFT-card-preview-1/actions/workflows/quality.yml)

ChainFrame modernizes the original 2023 static NFT card exercise into a reusable, framework-free UI component with tested domain utilities and progressive interaction.

## What changed

The original repository was a single hard-coded card with placeholder copy, empty image alt text, `href="#"` links, external Google Fonts, no JavaScript behavior, no tests, and no CI.

The maintained version adds:

- data-driven rendering from explicit metadata
- exact `wei → ETH` formatting using `BigInt`
- deterministic countdown logic
- a live countdown in the component
- keyboard-friendly artwork preview with native `<dialog>`
- persisted favorite state using `localStorage`
- semantic NFT/creator/technical metadata
- descriptive image alternative text
- responsive layout
- automatic light/dark mode
- reduced-motion support
- zero runtime dependencies
- Node built-in tests
- static accessibility/hygiene checks
- deterministic static build
- GitHub Actions quality gate
- GitHub Pages deployment workflow

## Why use BigInt for Ethereum units?

Ethereum values are commonly represented in wei, where:

```text
1 ETH = 1,000,000,000,000,000,000 wei
```

JavaScript floating-point numbers cannot safely represent every integer at that scale.

ChainFrame keeps the price as a base-10 integer string, converts it to `BigInt`, and formats the ETH value without floating-point rounding.

Example:

```text
33000000000000000 wei -> 0.033 ETH
```

## Architecture

```text
nft-data.js
    │
    ▼
validateAsset()
    │
    ├── formatWei()
    ├── timeRemaining()
    └── favoriteStorageKey()
    │
    ▼
app.js
    │
    ▼
semantic HTML template
```

The pure functions in `assets/nft-core.js` contain the testable domain logic. DOM rendering and browser interaction stay in `assets/app.js`.

## Local run

Because this project uses ES modules, serve it through a local HTTP server instead of opening the file directly.

For example:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Quality checks

No package installation is required because there are no npm dependencies.

```bash
npm run check
```

That runs:

- JavaScript syntax checks
- Node built-in tests
- static accessibility/hygiene checks
- production static build

## Tests

```bash
npm test
```

The test suite covers:

- exact whole/fractional ETH formatting
- very large integer precision
- invalid wei rejection
- deterministic countdown output
- expired deadline behavior
- metadata validation
- token-scoped favorite persistence
- safe behavior when storage is unavailable

## Accessibility

The maintained component includes:

- semantic landmarks and article structure
- descriptive artwork alt text
- visible keyboard focus
- native dialog semantics
- Escape-key dialog close behavior from the browser
- polite countdown announcements
- meaningful button labels and pressed state
- reduced-motion handling
- no placeholder navigation links

## Scope and trust boundary

This is a **preview component**, not an NFT marketplace.

It does not:

- connect to a wallet
- query a blockchain
- verify ownership
- execute a smart contract
- place bids
- transfer assets
- claim the displayed metadata is on-chain

The interface explicitly labels its content as demo metadata.

## Build

```bash
npm run build
```

The deployable output is written to `dist/`.

## Deployment

The Pages workflow builds `dist/` and deploys it when `main` changes.

## License

No license is currently included.
