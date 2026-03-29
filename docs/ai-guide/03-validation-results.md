---
title: 'Credit Card Input – Validation Results'
version: '1.0.4'
tags: [credit-card, validation, error-codes, status]
category: 'reference'
---

# Validation Results

The library provides detailed validation results for each field. Unlike the simple `status` field in events (`neutral`, `valid`, `invalid`), these methods give you specific **reason codes** and human‑readable messages. This is useful for displaying localized error messages, debugging, or conditional logic.

## Methods

All three methods can be called at any time (even before `init()`).

- `getCardValidationResult()`
- `getExpiryValidationResult()`
- `getCvvValidationResult()`

Each returns an object with:

| Property  | Type                                              | Description                                                           |
| --------- | ------------------------------------------------- | --------------------------------------------------------------------- |
| `status`  | `'valid' \| 'invalid' \| 'empty' \| 'incomplete'` | Overall status of the field                                           |
| `code`    | `string`                                          | Specific reason code (see tables below)                               |
| `message` | `string \| undefined`                             | Human‑readable explanation (English); present only when not `'valid'` |

---

## `getCardValidationResult()` – Card Number

Possible `code` values:

| Code             | Status         | Meaning                                                                           |
| ---------------- | -------------- | --------------------------------------------------------------------------------- |
| `'valid'`        | `'valid'`      | Card number is complete and passes Luhn check.                                    |
| `'empty'`        | `'empty'`      | No digits entered.                                                                |
| `'incomplete'`   | `'incomplete'` | Digits length < required max for detected card type (15 for Amex, 16 for others). |
| `'invalid_luhn'` | `'invalid'`    | All required digits are present, but Luhn check fails.                            |

**Example:**

```javascript
const result = creditCard.getCardValidationResult();
if (result.code === 'invalid_luhn') {
    showError('Invalid card number – please check the digits.');
}
```

---

## `getExpiryValidationResult()` – Expiry Date

Possible `code` values:

| Code               | Status         | Meaning                                                                     |
| ------------------ | -------------- | --------------------------------------------------------------------------- |
| `'valid'`          | `'valid'`      | Month 1‑12, year not expired, and not more than `expiryMaxYears` in future. |
| `'empty'`          | `'empty'`      | No digits entered.                                                          |
| `'incomplete'`     | `'incomplete'` | Fewer than 4 digits entered.                                                |
| `'invalid_month'`  | `'invalid'`    | Month is not between 1 and 12 (e.g., 13, 00).                               |
| `'expired'`        | `'invalid'`    | Date is before current month/year.                                          |
| `'future_too_far'` | `'invalid'`    | Date is more than `expiryMaxYears` (default 10) in the future.              |

**Example:**

```javascript
const expiry = creditCard.getExpiryValidationResult();
if (expiry.code === 'expired') {
    expiryInput.setCustomValidity('Card has expired');
} else {
    expiryInput.setCustomValidity('');
}
```

---

## `getCvvValidationResult()` – CVV

Possible `code` values:

| Code               | Status         | Meaning                                                                                                           |
| ------------------ | -------------- | ----------------------------------------------------------------------------------------------------------------- |
| `'valid'`          | `'valid'`      | Length matches expected length (3 for non‑Amex, 4 for Amex) OR, if `ignoreCvvLength` is `true`, length is 3 or 4. |
| `'empty'`          | `'empty'`      | No digits entered.                                                                                                |
| `'incomplete'`     | `'incomplete'` | Digits length < expected length (or <3 if `ignoreCvvLength`).                                                     |
| `'invalid_length'` | `'invalid'`    | Digits length > expected length (or >4 if `ignoreCvvLength`).                                                     |

**Note:** The CVV field’s expected length depends on the current card type (`isAmex`). If `ignoreCvvLength` is `true`, both 3 and 4 digits are considered valid regardless of card type.

**Example:**

```javascript
const cvvResult = creditCard.getCvvValidationResult();
if (cvvResult.code === 'invalid_length') {
    cvvHelp.textContent = cvvResult.message; // e.g., "CVV must be 3 digits"
}
```

---

## Combined Validation – `getValidationResults()`

This method returns an object containing all three individual results plus a combined flag.

```typescript
{
  card: ReturnType<CreditCardInput['getCardValidationResult']>,
  expiry: ReturnType<CreditCardInput['getExpiryValidationResult']>,
  cvv: ReturnType<CreditCardInput['getCvvValidationResult']>,
  isAllValid: boolean
}
```

**Example:**

```javascript
const all = creditCard.getValidationResults();
if (!all.isAllValid) {
    if (all.card.code === 'invalid_luhn') {
        // focus card field
    } else if (all.expiry.code === 'expired') {
        // focus expiry
    }
}
```

---

## Use Case: Internationalisation (i18n)

The built‑in `message` property is in English. If you need different languages, ignore `message` and map the `code` to your own translations.

```javascript
const errorMessages = {
    invalid_luhn: 'Numéro de carte invalide',
    expired: 'Carte expirée',
    // ...
};

const result = creditCard.getCardValidationResult();
const userMessage = errorMessages[result.code] || result.message;
```

---

## Relationship with Event Statuses

The events (`onCardStatus`, `onExpiryStatus`, `onCvvStatus`) give you only `'neutral'/'valid'/'invalid'`. Use the validation result methods when you need more detail:

- `neutral` → no validation yet (e.g., incomplete field, not enough digits).
- `valid` → `code === 'valid'`.
- `invalid` → any other `code` (e.g., `'invalid_luhn'`, `'expired'`, `'invalid_length'`).

---

## Next Steps

- Learn how to [customize formatters and validation behaviour](./05-customization.md).
- See [lifecycle management with `destroy()`](./06-destroy-cleanup.md) to clean up when the component is removed.
- Check [limitations](./07-limitations.md) like maximum card length and expiry auto‑correction.
