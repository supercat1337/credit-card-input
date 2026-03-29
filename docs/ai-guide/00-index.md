---
title: 'Credit Card Input – AI Documentation Index'
version: '1.0.4'
tags: [credit-card, input, validation, formatting, index]
category: 'overview'
---

# Credit Card Input

A lightweight, framework-agnostic JavaScript library for smart credit card input formatting, validation, and card type detection. Built with vanilla JS (JSDoc annotated) and designed to be easily integrated with any UI library or framework (React, Vue, Angular, or plain HTML).

## Core Features

- **Smart formatting** – Automatic card number grouping (4-4-4-4 for most cards, 4-6-5 for American Express).
- **Real-time validation** – Luhn algorithm for card number, expiry date (not expired, not too far future), CVV length (3 or 4 digits based on card type).
- **Card type detection** – Visa, Mastercard, American Express, Discover, JCB, Diners Club, UnionPay.
- **Event-driven** – Detailed status events for each field (`onCardStatus`, `onExpiryStatus`, `onCvvStatus`, `onAllValid`).
- **Customizable** – Pass your own formatters and card type detector.
- **TypeScript support** – Full type definitions (`.d.ts`) generated from JSDoc.
- **Lightweight** – Only one small dependency: `@supercat1337/event-emitter` (~1 KB gzipped).

## When to Use This Library

- You need a client‑side credit card input component with formatting and validation.
- You want to avoid heavy frameworks or monolithic UI libraries.
- You require detailed validation feedback (empty, incomplete, invalid Luhn, expired, etc.).
- You are building a payment form in a vanilla JS project or any modern framework.

## Documentation Files in This Guide

| File                                                   | Description                                                                                                                       |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| [01-installation.md](./01-installation.md)             | Installation, import, basic usage example.                                                                                        |
| [02-api-reference.md](./02-api-reference.md)           | Full API: constructor, methods, events, event objects, helper functions.                                                          |
| [03-validation-results.md](./03-validation-results.md) | Detailed validation result codes and messages (`getCardValidationResult`, `getExpiryValidationResult`, `getCvvValidationResult`). |
| [04-data-methods.md](./04-data-methods.md)             | Data retrieval methods: `getCardData`, `getExpiryData`, `getCvvData`, `getState`.                                                 |
| [05-customization.md](./05-customization.md)           | Overriding default formatters, custom card type detection, supporting longer card numbers.                                        |
| [06-destroy-cleanup.md](./06-destroy-cleanup.md)       | Lifecycle management: `destroy()` method, removing event listeners, preventing memory leaks.                                      |
| [07-limitations.md](./07-limitations.md)               | Known limitations (max card length, expiry auto‑correction behaviour) and how to work around them.                                |
| [08-accessibility.md](./08-accessibility.md)           | ARIA attributes, accessibility recommendations with examples.                                                                     |

## Quick Example

```javascript
import { CreditCardInput } from '@supercat1337/credit-card-input';

const cc = new CreditCardInput({
    cardInput: document.getElementById('cardNumber'),
    expiryInput: document.getElementById('expiryDate'),
    cvvInput: document.getElementById('cvv'),
});

cc.onCardStatus(({ status, type }) => console.log(`Card: ${status} (${type})`));
cc.onAllValid(({ isAllValid }) => console.log(`Form valid: ${isAllValid}`));

cc.init();
```

## License

MIT © supercat1337
