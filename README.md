# credit-card-input

A lightweight, framework-agnostic JavaScript library for smart credit card input formatting, validation, and card type detection. Built with vanilla JS (JSDoc annotated) and designed to be easily integrated with any UI library or framework (React, Vue, Angular, or plain HTML).

## ✨ Features

- **Smart formatting** – Automatically formats card numbers with dynamic grouping (4-4-4-4 for most cards, 4-6-5 for American Express).
- **Real-time validation** – Validates card number via Luhn algorithm, expiry date (not in the past, not more than X years in future), and CVV length (3 for most cards, 4 for Amex).
- **Card type detection** – Identifies major card brands: Visa, Mastercard, American Express, Discover, JCB, Diners Club, UnionPay.
- **Event-driven** – Emits detailed status events for each field, allowing you to easily update your UI.
- **Customizable formatting** – Pass your own formatter functions to override default behaviour (e.g., different date format, support for longer card numbers).
- **TypeScript support** – Includes full type definitions (`.d.ts`) generated from JSDoc.
- **Lightweight** – Only one small dependency: `@supercat1337/event-emitter` (~1 KB gzipped). No other external libraries.

## 📦 Installation

### npm

```bash
npm install https://github.com/supercat1337/credit-card-input
```

## 🚀 Quick Start

### HTML

```html
<div class="card-number-group">
    <label>Card Number</label>
    <div class="input-group">
        <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" />
        <span class="icon-group">
            <i class="valid-icon d-none">✓</i>
            <i class="invalid-icon d-none">✗</i>
        </span>
    </div>
    <div id="cardTypeDisplay"></div>
</div>

<div class="expiry-group">
    <label>Expiry Date</label>
    <div class="input-group">
        <input type="text" id="expiryDate" placeholder="MM / YY" />
        <span class="icon-group">
            <i class="valid-icon d-none">✓</i>
            <i class="invalid-icon d-none">✗</i>
        </span>
    </div>
</div>

<div class="cvv-group">
    <label>CVV</label>
    <div class="input-group">
        <input type="text" id="cvv" placeholder="123" />
        <span class="icon-group">
            <i class="valid-icon d-none">✓</i>
            <i class="invalid-icon d-none">✗</i>
        </span>
    </div>
    <div id="cvvHelp"></div>
</div>

<button id="submitButton" disabled>Pay Now</button>
```

### JavaScript

```javascript
import { CreditCardInput } from '@supercat1337/credit-card-input';

const creditCard = new CreditCardInput({
    cardInput: document.getElementById('cardNumber'),
    expiryInput: document.getElementById('expiryDate'),
    cvvInput: document.getElementById('cvv'),
});

// Update UI on status changes
creditCard.onCardStatus(({ status, type, isAmex }) => {
    updateIcon('card', status);
    document.getElementById('cardTypeDisplay').textContent = type ? `Card type: ${type}` : '';
    document.getElementById('cvvHelp').textContent = isAmex
        ? '4 digits on front'
        : '3 digits on back';
});

creditCard.onExpiryStatus(({ status }) => updateIcon('expiry', status));
creditCard.onCvvStatus(({ status }) => updateIcon('cvv', status));

creditCard.onAllValid(({ isAllValid }) => {
    document.getElementById('submitButton').disabled = !isAllValid;
});

// Helper function to update icons (customize for your UI)
function updateIcon(field, status) {
    const input = document.getElementById(
        field + (field === 'card' ? 'Number' : field === 'expiry' ? 'Date' : '')
    );
    const validIcon = document.getElementById(field + 'ValidIcon');
    const invalidIcon = document.getElementById(field + 'InvalidIcon');

    input.classList.remove('is-valid', 'is-invalid');
    validIcon?.classList.add('d-none');
    invalidIcon?.classList.add('d-none');

    if (status === 'valid') {
        input.classList.add('is-valid');
        validIcon?.classList.remove('d-none');
    } else if (status === 'invalid') {
        input.classList.add('is-invalid');
        invalidIcon?.classList.remove('d-none');
    }
}

// Initialize
creditCard.init();
```

### Custom Formatting Example

You can override the default formatting by passing custom functions to the constructor:

```javascript
const creditCard = new CreditCardInput({
    cardInput: document.getElementById('cardNumber'),
    expiryInput: document.getElementById('expiryDate'),
    cvvInput: document.getElementById('cvv'),
    // Custom expiry formatter: MM/YY without spaces
    formatExpiry: input => {
        let value = input.value.replace(/\D/g, '').substring(0, 4);
        if (value.length >= 3) {
            value = value.substring(0, 2) + '/' + value.substring(2);
        }
        input.value = value;
    },
    // Custom card type detector (e.g., always return "Visa")
    getCardType: digits => 'Visa',
});
```

## 📖 API Reference

### `CreditCardInput` Class

#### Constructor

```typescript
new CreditCardInput({
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

| Parameter                     | Description                                                                                     |
| ----------------------------- | ----------------------------------------------------------------------------------------------- |
| `cardInput`                   | Input element for card number                                                                   |
| `expiryInput`                 | Input element for expiry date                                                                   |
| `cvvInput`                    | Input element for CVV                                                                           |
| `formatCardNumber` (optional) | Custom card number formatter. Default uses `formatCardNumber` from library                      |
| `formatExpiry` (optional)     | Custom expiry formatter. Default uses `formatExpiry`                                            |
| `formatCvv` (optional)        | Custom CVV formatter. Default uses `formatCvv`                                                  |
| `getCardType` (optional)      | Custom card type detector. Default uses `getCardType`                                           |
| `ignoreCvvLength` (optional)  | If `true`, CVV is considered valid with 3 or 4 digits regardless of card type. Default `false`. |
| `expiryMaxYears` (optional)   | Maximum number of years a card can be valid from the current year. Default `10`.                |

#### Instance Methods

| Method                                                                   | Description                                                                                            |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `formatCardNumber()`                                                     | Triggers formatting on the card input using the current formatter.                                     |
| `formatExpiry()`                                                         | Triggers formatting on the expiry input.                                                               |
| `formatCvv()`                                                            | Triggers formatting on the CVV input.                                                                  |
| `getCardType(digits: string): string`                                    | Returns card type for the given digits using the current detector.                                     |
| `onCardStatus(callback: (event: CardStatusEvent, instance) => void)`     | Subscribe to card number status changes.                                                               |
| `onExpiryStatus(callback: (event: ExpiryStatusEvent, instance) => void)` | Subscribe to expiry date status changes.                                                               |
| `onCvvStatus(callback: (event: CvvStatusEvent, instance) => void)`       | Subscribe to CVV status changes.                                                                       |
| `onAllValid(callback: (event: AllValidEvent, instance) => void)`         | Subscribe to "all fields valid" state changes.                                                         |
| `on(eventName: string, callback: Function)`                              | Low-level subscription to any event.                                                                   |
| `getState()`                                                             | Returns the full state including basic statuses, validation details, and raw data for all fields.      |
| `getCardValidationResult(): object`                                      | Returns detailed validation status for the card number field.                                          |
| `getExpiryValidationResult(): object`                                    | Returns detailed validation status for the expiry date field.                                          |
| `getCvvValidationResult(): object`                                       | Returns detailed validation status for the CVV field.                                                  |
| `getValidationResults(): object`                                         | Returns validation results for all three fields combined.                                              |
| `getCardData(): object`                                                  | Returns current card number data (digits, type, completeness, etc.).                                   |
| `getExpiryData(): object`                                                | Returns current expiry data (month, year, etc.).                                                       |
| `getCvvData(): object`                                                   | Returns current CVV data (digits, expected length, etc.).                                              |
| `init()`                                                                 | Starts listening to input events. Call after setting up subscriptions.                                 |
| `destroy()`                                                              | Removes all DOM event listeners and cleans up internal state. Call when component is no longer needed. |

#### Event Objects

**`CardStatusEvent`**

```typescript
{
    status: 'neutral' | 'valid' | 'invalid';
    value: string; // raw input value (with spaces)
    digits: string; // only digits
    type: string; // e.g., "Visa", "Mastercard"
    isAmex: boolean;
    isValid: boolean; // Luhn result (if enough digits)
    maxDigits: number;
}
```

**`ExpiryStatusEvent`**

```typescript
{
    status: 'neutral' | 'valid' | 'invalid';
    value: string;
    digits: string;
    month: number | null;
    year: number | null;
}
```

**`CvvStatusEvent`**

```typescript
{
    status: 'neutral' | 'valid' | 'invalid';
    value: string;
    digits: string;
    expectedLength: number;
    isAmex: boolean;
}
```

**`AllValidEvent`**

```typescript
{
    isAllValid: boolean;
}
```

### Validation and Data Methods Return Types

#### `getCardValidationResult()`

```typescript
{
    status: 'valid' | 'invalid' | 'empty' | 'incomplete';
    code: 'valid' | 'empty' | 'incomplete' | 'invalid_luhn';
    message?: string;
}
```

- `status`: Overall status of the field.
- `code`: Specific reason for the status.
- `message`: Human-readable explanation (if not valid).

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

```typescript
{
    card: ReturnType<CreditCardInput['getCardValidationResult']>;
    expiry: ReturnType<CreditCardInput['getExpiryValidationResult']>;
    cvv: ReturnType<CreditCardInput['getCvvValidationResult']>;
    isAllValid: boolean;
}
```

#### `getCardData()`

```typescript
{
    value: string; // raw input value (with spaces)
    digits: string; // only digits
    type: string; // detected card type
    isAmex: boolean;
    maxDigits: number; // 15 for Amex, 16 for others
    isValid: boolean; // Luhn result if enough digits
    isComplete: boolean; // whether all required digits are entered
}
```

#### `getExpiryData()`

```typescript
{
    value: string;
    digits: string;
    month: number | null;
    year: number | null;
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

The `getState()` method now returns an extended object that includes all of the above information in addition to the legacy status fields. The full type is:

```typescript
{
    // Basic statuses (legacy)
    cardStatus: 'neutral' | 'valid' | 'invalid';
    expiryStatus: 'neutral' | 'valid' | 'invalid';
    cvvStatus: 'neutral' | 'valid' | 'invalid';
    cardType: string;
    isAmex: boolean;
    allValid: boolean;

    // Detailed validation results (new)
    cardValidation: ReturnType<CreditCardInput['getCardValidationResult']>;
    expiryValidation: ReturnType<CreditCardInput['getExpiryValidationResult']>;
    cvvValidation: ReturnType<CreditCardInput['getCvvValidationResult']>;

    // Raw data (new)
    cardData: ReturnType<CreditCardInput['getCardData']>;
    expiryData: ReturnType<CreditCardInput['getExpiryData']>;
    cvvData: ReturnType<CreditCardInput['getCvvData']>;
}
```

### Standalone Helper Functions

The library also exports the default formatters and validators for standalone use:

```javascript
import {
    formatCardNumber,
    formatExpiry,
    formatCvv,
    getCardType,
    isProbablyAmex,
    luhnValidate,
} from '@supercat1337/credit-card-input';
```

| Function                                    | Description                                 |
| ------------------------------------------- | ------------------------------------------- |
| `formatCardNumber(input: HTMLInputElement)` | Default card number formatter.              |
| `formatExpiry(input: HTMLInputElement)`     | Default expiry formatter (MM / YY).         |
| `formatCvv(input: HTMLInputElement)`        | Default CVV formatter (only digits, max 4). |
| `getCardType(digits: string): string`       | Default card type detector.                 |
| `isProbablyAmex(digits: string): boolean`   | Checks if number starts with 34 or 37.      |
| `luhnValidate(fullcode: string): boolean`   | Validates card number via Luhn algorithm.   |

## 📝 Notes on Default Formatters

### `formatExpiry`

- Allows only digits, maximum 4.
- Collapses multiple leading zeros (e.g., `00` → `0`).
- If the first two digits form a month > 12, it prepends a zero (e.g., `14` → `014` → `01 / 4`). This helps the user correct a mistyped month.
- The separator is `" / "` by default.

If you need different behaviour (strict validation, custom separator, etc.), pass your own `formatExpiry` function.

### `formatCardNumber`

- Supports up to 16 digits (15 for Amex). Longer numbers (e.g., UnionPay up to 19 digits) are truncated.
- To support longer card numbers, provide custom `formatCardNumber` and `getCardType` functions (see example below).

### Supporting longer card numbers (UnionPay, Maestro)

```javascript
const creditCard = new CreditCardInput({
    cardInput: document.getElementById('cardNumber'),
    expiryInput: document.getElementById('expiryDate'),
    cvvInput: document.getElementById('cvv'),
    getCardType: digits => {
        if (/^62/.test(digits)) return 'UnionPay';
        // fallback to default detection for other cards
        return defaultGetCardType(digits);
    },
    formatCardNumber: input => {
        let digits = input.value.replace(/\D/g, '');
        const isUnionPay = /^62/.test(digits);
        const maxDigits = isUnionPay ? 19 : isProbablyAmex(digits) ? 15 : 16;
        digits = digits.slice(0, maxDigits);
        let formatted = '';
        // simple 4-4-4-4-... grouping (adjust as needed)
        for (let i = 0; i < digits.length; i++) {
            if (i > 0 && i % 4 === 0) formatted += ' ';
            formatted += digits[i];
        }
        input.value = formatted;
    },
});
```

### Accessibility (ARIA)

The library does not automatically set ARIA attributes, but you can easily add them in event callbacks:

```javascript
creditCard.onCardStatus(({ status }) => {
    const input = document.getElementById('cardNumber');
    input.setAttribute('aria-invalid', status === 'invalid' ? 'true' : 'false');
});
```

## 🧪 Full Example with Bootstrap 5

A complete, working example with Bootstrap 5 styling is available in the [`/example`](./example) folder.

## 📄 License

MIT © Albert Bazaleev
