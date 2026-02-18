# credit-card-input

A lightweight, framework-agnostic JavaScript library for smart credit card input formatting, validation, and card type detection. Built with vanilla JS and designed to be easily integrated with any UI library or framework (React, Vue, Angular, or plain HTML).

## ✨ Features

- **Smart formatting** – Automatically formats card numbers with dynamic grouping (4-4-4-4 for most cards, 4-6-5 for American Express).
- **Real-time validation** – Validates card number via Luhn algorithm, expiry date (not in the past, not more than 10 years in future), and CVV length (3 for most cards, 4 for Amex).
- **Card type detection** – Identifies major card brands: Visa, Mastercard, American Express, Discover, JCB, Diners Club, UnionPay.
- **Event-driven** – Emits detailed status events for each field, allowing you to easily update your UI.
- **Customizable formatting** – Pass your own formatter functions to override default behaviour (e.g., different date format).
- **TypeScript support** – Includes full type definitions (`.d.ts`).
- **No dependencies** – Only relies on a tiny event emitter (`@supercat1337/event-emitter`), which is bundled with the library.

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
})
```

| Parameter                     | Description                                                                |
| ----------------------------- | -------------------------------------------------------------------------- |
| `cardInput`                   | Input element for card number                                              |
| `expiryInput`                 | Input element for expiry date                                              |
| `cvvInput`                    | Input element for CVV                                                      |
| `formatCardNumber` (optional) | Custom card number formatter. Default uses `formatCardNumber` from library |
| `formatExpiry` (optional)     | Custom expiry formatter. Default uses `formatExpiry`                       |
| `formatCvv` (optional)        | Custom CVV formatter. Default uses `formatCvv`                             |
| `getCardType` (optional)      | Custom card type detector. Default uses `getCardType`                      |

#### Instance Methods

| Method                                                                   | Description                                                            |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| `formatCardNumber()`                                                     | Triggers formatting on the card input using the current formatter.     |
| `formatExpiry()`                                                         | Triggers formatting on the expiry input.                               |
| `formatCvv()`                                                            | Triggers formatting on the CVV input.                                  |
| `getCardType(digits: string): string`                                    | Returns card type for the given digits using the current detector.     |
| `onCardStatus(callback: (event: CardStatusEvent, instance) => void)`     | Subscribe to card number status changes.                               |
| `onExpiryStatus(callback: (event: ExpiryStatusEvent, instance) => void)` | Subscribe to expiry date status changes.                               |
| `onCvvStatus(callback: (event: CvvStatusEvent, instance) => void)`       | Subscribe to CVV status changes.                                       |
| `onAllValid(callback: (event: AllValidEvent, instance) => void)`         | Subscribe to "all fields valid" state changes.                         |
| `on(eventName: string, callback: Function)`                              | Low-level subscription to any event.                                   |
| `getState()`                                                             | Returns current state of all fields.                                   |
| `init()`                                                                 | Starts listening to input events. Call after setting up subscriptions. |

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

## 🧪 Full Example with Bootstrap 5

A complete, working example with Bootstrap 5 styling is available in the [`/example`](./example) folder.

## 📄 License

MIT © supercat1337
