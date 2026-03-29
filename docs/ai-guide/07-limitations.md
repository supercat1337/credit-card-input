---
title: 'Credit Card Input – Limitations & Known Behaviours'
version: '1.0.4'
tags: [credit-card, limitations, known-issues, edge-cases]
category: 'reference'
---

# Limitations & Known Behaviours

This document outlines the current limitations of the library and explains some non‑obvious behaviours. Understanding these will help you avoid surprises and decide if the library fits your use case.

---

## 1. Maximum Card Number Length

| Card Type          | Max Digits (default) |
| ------------------ | -------------------- |
| American Express   | 15                   |
| All other detected | 16                   |

**What this means:**

- Cards requiring more than 16 digits (e.g., UnionPay up to 19, some Maestro cards) will be **truncated**.
- The validation methods (`getCardValidationResult`, `#updateCardStatus`) consider the card complete only when the digit count reaches the max for the detected type.

**Workaround:**  
Provide custom `formatCardNumber` and `getCardType` functions to support longer lengths. See [Customization – Supporting longer card numbers](./05-customization.md#supporting-longer-card-numbers-unionpay-maestro-up-to-19-digits).

---

## 2. Expiry Date Auto‑correction (`formatExpiry`)

The default `formatExpiry` function applies two automatic corrections:

- **Multiple leading zeros** are collapsed into a single zero (e.g., `00` → `0`).
- If the first two digits form a month **greater than 12**, it prepends a zero (e.g., `14` → `014` → `01 / 4`).

**Why?**  
These corrections help the user recover from typos without blocking input. However, they may be unexpected if you prefer strict validation.

**Workaround:**  
Pass your own `formatExpiry` function to the constructor. Example (strict, no auto‑correction):

```javascript
formatExpiry: input => {
    let digits = input.value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) {
        digits = digits.slice(0, 2) + '/' + digits.slice(2);
    }
    input.value = digits;
};
```

---

## 3. No Automatic ARIA Attributes

The library does **not** set accessibility attributes (`aria-invalid`, `aria-describedby`, etc.) automatically. This is by design – it stays UI‑agnostic.

**Workaround:**  
Use the event callbacks to add ARIA attributes manually. See [Accessibility recommendations](./08-accessibility.md) for examples.

---

## 4. Paste Handling

The library relies solely on the `input` event. Pasting content works because `input` fires, and the formatters will process the pasted value. However:

- **Expiry field:** Pasting `1325` will be auto‑corrected to `01 / 32` (month becomes `01` due to the >12 rule). This may be confusing.
- **CVV field:** Pasting more than 4 digits truncates to 4 digits.
- **Card number field:** Pasting a number longer than the max allowed digits will be truncated.

These behaviours are generally acceptable for most users, but be aware of them.

---

## 5. No Built‑in I18n (Internationalisation)

Error messages returned by `getCardValidationResult()`, `getExpiryValidationResult()`, and `getCvvValidationResult()` are in English only. If you need other languages, ignore the `message` property and map the `code` to your own translations.

Example:

```javascript
const messages = {
    invalid_luhn: '無効なカード番号',
    expired: 'カードの有効期限が切れています',
    // ...
};
const result = creditCard.getCardValidationResult();
const userMessage = messages[result.code] || result.message;
```

---

## 6. No Support for Right‑to‑Left (RTL) Layouts

The library does not apply any RTL‑specific formatting. Input direction is controlled by the browser and your CSS. For RTL languages, you may need to adjust the input styling manually.

---

## 7. Dependency on `@supercat1337/event-emitter`

The library depends on a tiny event emitter package. This is **not** bundled into the main file (unless you use the `*.bundle.esm.js` version). The dependency is lightweight (~1 KB gzipped) and well maintained.

If you use the non‑bundled version (`credit-card-input.esm.js`), you must ensure the dependency is available in your project.

---

## 8. Browser Support

The library uses modern JavaScript features (ES6+). It works in all modern browsers:

- Chrome / Edge (latest)
- Firefox (latest)
- Safari (latest)
- Opera (latest)

**Internet Explorer is not supported.** No polyfills are provided.

---

## 9. No Automatic Focus Management

The library does **not** automatically move focus between fields (e.g., from card number to expiry after completion). This is intentional – focus handling depends on your application’s UX.

If you want auto‑focus, implement it using event callbacks, as shown in the [example](../examples/01/index.js):

```javascript
creditCard.onCardStatus(({ status }) => {
    if (status === 'valid') creditCard.expiryInput.focus();
});
creditCard.onExpiryStatus(({ status }) => {
    if (status === 'valid') creditCard.cvvInput.focus();
});
```

---

## Summary

| Limitation                   | Impact   | Workaround Available      |
| ---------------------------- | -------- | ------------------------- |
| Card length ≤16 (≤15 Amex)   | Medium   | Yes (custom formatter)    |
| Expiry auto‑correction       | Low      | Yes (custom formatter)    |
| No ARIA attributes           | Low      | Yes (manual in callbacks) |
| Paste behaviour (truncation) | Low      | No (but acceptable)       |
| English only messages        | Medium   | Yes (map codes)           |
| RTL not tested               | Low      | CSS adjustments           |
| External dependency          | Very low | Use bundled version       |
| No IE support                | Depends  | Not possible              |
| No auto‑focus                | Very low | Yes (manual)              |

Most limitations have straightforward workarounds, and the library remains suitable for the vast majority of payment form use cases.

---

## Next Steps

- Read about [accessibility (ARIA)](./08-accessibility.md) to make your form usable for everyone.
- Review the [API reference](./02-api-reference.md) for complete method details.
- See [customization options](./05-customization.md) for advanced use cases.
