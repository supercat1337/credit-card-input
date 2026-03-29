---
title: 'Credit Card Input – API Reference'
version: '1.0.4'
tags: [credit-card, api, reference, constructor, methods, events, types]
category: 'reference'
---

# API Reference

## `CreditCardInput` Class

### Constructor

```typescript
new CreditCardInput(options: {
  cardInput: HTMLInputElement;
  expiryInput: HTMLInputElement;
  cvvInput: HTMLInputElement;
  formatCardNumber?: (input: HTMLInputElement) => void;
  formatExpiry?: (input: HTMLInputElement) => void;
  formatCvv?: (input: HTMLInputElement) => void;
  getCardType?: (digits: string) => string;
  ignoreCvvLength?: boolean;
  expiryMaxYears?: number;
})
```

#### Parameters

| Name               | Type                 | Default  | Description                                        |
| ------------------ | -------------------- | -------- | -------------------------------------------------- |
| `cardInput`        | `HTMLInputElement`   | required | Input field for card number                        |
| `expiryInput`      | `HTMLInputElement`   | required | Input field for expiry date                        |
| `cvvInput`         | `HTMLInputElement`   | required | Input field for CVV                                |
| `formatCardNumber` | `(input) => void`    | built‑in | Custom card number formatter                       |
| `formatExpiry`     | `(input) => void`    | built‑in | Custom expiry formatter                            |
| `formatCvv`        | `(input) => void`    | built‑in | Custom CVV formatter                               |
| `getCardType`      | `(digits) => string` | built‑in | Custom card type detector                          |
| `ignoreCvvLength`  | `boolean`            | `false`  | If `true`, CVV valid with 3 or 4 digits (any card) |
| `expiryMaxYears`   | `number`             | `10`     | Maximum future years allowed for expiry            |

---

### Instance Methods

#### `init()`

Starts listening to `input` events on the three fields. Must be called after setting up event subscriptions.

```javascript
creditCard.init();
```

#### `destroy()`

Removes all DOM event listeners and cleans up internal state. Call when the component is no longer needed (e.g., on page unload in an SPA).

```javascript
creditCard.destroy();
```

#### `formatCardNumber()`

Manually triggers formatting on the card input using the current formatter.

#### `formatExpiry()`

Manually triggers formatting on the expiry input.

#### `formatCvv()`

Manually triggers formatting on the CVV input.

#### `getCardType(digits: string): string`

Returns the card type for the given digits (e.g., `"Visa"`). Uses the detector provided in the constructor.

```javascript
const type = creditCard.getCardType('4111111111111111'); // "Visa"
```

---

### Event Subscription Methods

All subscription methods return an **unsubscribe function** that removes the listener when called.

#### `onInit(callback: (instance: CreditCardInput) => void): () => void`

Fired once after `init()` completes.

#### `onCardStatus(callback: (event: CardStatusEvent, instance: CreditCardInput) => void): () => void`

Fired whenever the card number field status changes.

#### `onExpiryStatus(callback: (event: ExpiryStatusEvent, instance: CreditCardInput) => void): () => void`

Fired whenever the expiry field status changes.

#### `onCvvStatus(callback: (event: CvvStatusEvent, instance: CreditCardInput) => void): () => void`

Fired whenever the CVV field status changes.

#### `onAllValid(callback: (event: AllValidEvent, instance: CreditCardInput) => void): () => void`

Fired when the combined validity of all three fields changes (all become valid, or not all valid).

#### `on(eventName: string, callback: (...args: any[]) => void): () => void`

Low-level subscription to any custom event name (rarely needed).

---

### Event Objects

#### `CardStatusEvent`

```typescript
{
    status: 'neutral' | 'valid' | 'invalid';
    value: string; // raw input value (with spaces)
    digits: string; // only digits
    type: string; // detected card type
    isAmex: boolean;
    isValid: boolean; // true if enough digits and Luhn passes
    maxDigits: number; // 15 for Amex, 16 for others
}
```

#### `ExpiryStatusEvent`

```typescript
{
    status: 'neutral' | 'valid' | 'invalid';
    value: string; // raw input value (with separator)
    digits: string; // only digits
    month: number | null; // 1-12 or null
    year: number | null; // full year (e.g., 2028) or null
}
```

#### `CvvStatusEvent`

```typescript
{
    status: 'neutral' | 'valid' | 'invalid';
    value: string; // raw input value
    digits: string; // only digits
    expectedLength: number; // 3 or 4 based on card type
    isAmex: boolean;
}
```

#### `AllValidEvent`

```typescript
{
    isAllValid: boolean; // true if all three fields are valid
}
```

---

### Validation & Data Retrieval Methods

These methods can be called at any time (even before `init()`) to inspect the current state.

#### `getCardValidationResult()`

Returns detailed status for the card number field.

```typescript
{
  status: 'valid' | 'invalid' | 'empty' | 'incomplete';
  code: 'valid' | 'empty' | 'incomplete' | 'invalid_luhn';
  message?: string;
}
```

#### `getExpiryValidationResult()`

```typescript
{
  status: 'valid' | 'invalid' | 'empty' | 'incomplete';
  code: 'valid' | 'empty' | 'incomplete' | 'invalid_month' | 'expired' | 'future_too_far';
  message?: string;
}
```

#### `getCvvValidationResult()`

```typescript
{
  status: 'valid' | 'invalid' | 'empty' | 'incomplete';
  code: 'valid' | 'empty' | 'incomplete' | 'invalid_length';
  message?: string;
}
```

#### `getValidationResults()`

Returns an object containing the three individual results plus a combined flag.

```typescript
{
    card: ReturnType<CreditCardInput['getCardValidationResult']>;
    expiry: ReturnType<CreditCardInput['getExpiryValidationResult']>;
    cvv: ReturnType<CreditCardInput['getCvvValidationResult']>;
    isAllValid: boolean;
}
```

#### `getCardData()`

Returns raw card number data.

```typescript
{
    value: string; // raw input value (with spaces)
    digits: string; // only digits
    type: string; // detected card type
    isAmex: boolean;
    maxDigits: number; // 15 or 16
    isValid: boolean; // Luhn result if enough digits
    isComplete: boolean; // digits.length === maxDigits
}
```

#### `getExpiryData()`

```typescript
{
    value: string; // raw input value
    digits: string; // only digits
    month: number | null;
    year: number | null; // full year (e.g., 2030)
    isValid: boolean;
}
```

#### `getCvvData()`

```typescript
{
    value: string;
    digits: string;
    expectedLength: number;
    isAmex: boolean;
    isValid: boolean;
}
```

#### `getState()`

Returns the complete current state, combining all of the above.

```typescript
{
    // Basic statuses (legacy)
    cardStatus: 'neutral' | 'valid' | 'invalid';
    expiryStatus: 'neutral' | 'valid' | 'invalid';
    cvvStatus: 'neutral' | 'valid' | 'invalid';
    cardType: string;
    isAmex: boolean;
    allValid: boolean;

    // Detailed validation results
    cardValidation: ReturnType<CreditCardInput['getCardValidationResult']>;
    expiryValidation: ReturnType<CreditCardInput['getExpiryValidationResult']>;
    cvvValidation: ReturnType<CreditCardInput['getCvvValidationResult']>;

    // Raw data
    cardData: ReturnType<CreditCardInput['getCardData']>;
    expiryData: ReturnType<CreditCardInput['getExpiryData']>;
    cvvData: ReturnType<CreditCardInput['getCvvData']>;
}
```

---

### Standalone Helper Functions

These functions are also exported and can be used independently.

```typescript
import {
    formatCardNumber,
    formatExpiry,
    formatCvv,
    getCardType,
    isProbablyAmex,
    luhnChecksum,
    luhnValidate,
} from '@supercat1337/credit-card-input';
```

#### `formatCardNumber(input: HTMLInputElement): void`

Default formatter: groups digits 4-4-4-4 (or 4-6-5 for Amex).

#### `formatExpiry(input: HTMLInputElement, dateSeparator?: string): void`

Default expiry formatter: `MM / YY`. Auto‑corrects month >12 by adding a leading zero.

#### `formatCvv(input: HTMLInputElement): void`

Allows only digits, max length 4.

#### `getCardType(digits: string): string`

Returns card type based on BIN patterns. Returns `'Unknown'` if not recognized.

#### `isProbablyAmex(digits: string): boolean`

Returns `true` if the first two digits are `34` or `37`.

#### `luhnChecksum(code: string): number`

Calculates Luhn checksum (0–9).

#### `luhnValidate(fullcode: string): boolean`

Validates card number using Luhn algorithm (ignores non‑digits).

---

## TypeScript Support

The library includes a `.d.ts` file with all types. No additional `@types/` package needed. The types are generated from JSDoc comments in the source code.

---

## Next Steps

- Learn about [detailed validation result codes](./03-validation-results.md) to handle specific error messages.
- See how to [customize formatters and detection](./05-customization.md).
- Read about [lifecycle management with `destroy()`](./06-destroy-cleanup.md).
