---
title: 'Credit Card Input – Customization'
version: '1.0.4'
tags: [credit-card, customization, formatters, card-detection, advanced]
category: 'advanced'
---

# Customization

The library is designed to be flexible. You can override default formatting, card type detection, and validation behaviour by passing your own functions to the constructor.

---

## Overriding Formatters

You can replace any of the default formatters (`formatCardNumber`, `formatExpiry`, `formatCvv`) with your own implementation.

### Custom Expiry Formatter (MM/YY without spaces)

```javascript
const creditCard = new CreditCardInput({
    cardInput: document.getElementById('cardNumber'),
    expiryInput: document.getElementById('expiryDate'),
    cvvInput: document.getElementById('cvv'),
    formatExpiry: input => {
        let digits = input.value.replace(/\D/g, '').slice(0, 4);
        if (digits.length >= 3) {
            digits = digits.slice(0, 2) + '/' + digits.slice(2);
        }
        input.value = digits;
    },
});
```

### Custom CVV Formatter (allow only 3 digits, no 4‑digit support)

```javascript
formatCvv: input => {
    const digits = input.value.replace(/\D/g, '').slice(0, 3);
    input.value = digits;
};
```

### Custom Card Number Formatter (e.g., no spaces, only digits)

```javascript
formatCardNumber: input => {
    const digits = input.value.replace(/\D/g, '').slice(0, 16);
    input.value = digits;
};
```

---

## Custom Card Type Detection

You can provide your own `getCardType` function. This is useful if you need to support additional card brands or override existing detection logic.

```javascript
const creditCard = new CreditCardInput({
    cardInput,
    expiryInput,
    cvvInput,
    getCardType: digits => {
        // Custom logic: detect "MyCustomCard"
        if (digits.startsWith('123')) return 'MyCustomCard';
        // Fall back to default detection for others
        return defaultGetCardType(digits);
    },
});
```

**Note:** You need to import `defaultGetCardType` from the library if you want to fall back:

```javascript
import { getCardType as defaultGetCardType } from '@supercat1337/credit-card-input';
```

---

## Supporting Longer Card Numbers (UnionPay, Maestro up to 19 digits)

By default, the library supports up to 16 digits (15 for Amex). To support cards like UnionPay (16–19 digits) or Maestro (up to 19), you need to provide **both** a custom `formatCardNumber` and a custom `getCardType` that returns the correct max length.

### Step 1: Detect the card type and its maximum length

```javascript
import { getCardType as defaultGetCardType } from '@supercat1337/credit-card-input';

function customGetCardType(digits) {
    if (/^62/.test(digits)) return 'UnionPay';
    // Add more long‑card patterns here
    return defaultGetCardType(digits);
}
```

### Step 2: Create a custom formatter that respects the max length

```javascript
function customFormatCardNumber(input) {
    let digits = input.value.replace(/\D/g, '');

    // Determine max length based on card type
    let maxDigits = 16; // default
    if (/^62/.test(digits))
        maxDigits = 19; // UnionPay
    else if (digits.startsWith('34') || digits.startsWith('37')) maxDigits = 15; // Amex

    digits = digits.slice(0, maxDigits);

    // Format with groups of 4 (simple example)
    let formatted = '';
    for (let i = 0; i < digits.length; i++) {
        if (i > 0 && i % 4 === 0) formatted += ' ';
        formatted += digits[i];
    }
    input.value = formatted;
}
```

### Step 3: Use them in the constructor

```javascript
const creditCard = new CreditCardInput({
    cardInput,
    expiryInput,
    cvvInput,
    getCardType: customGetCardType,
    formatCardNumber: customFormatCardNumber,
});
```

**Important:** The library’s validation (`getCardValidationResult`, `#updateCardStatus`) still uses a hardcoded `maxDigits` based on `isProbablyAmex` (15 for Amex, 16 otherwise). If you need proper validation for longer cards, you must also override the validation logic or simply rely on your custom formatter and treat the field as valid when enough digits are entered. For full validation support, consider extending the class or using the standalone helpers.

---

## Changing Expiry Validation Range (`expiryMaxYears`)

You can set how many years into the future an expiry date is allowed to be.

```javascript
const creditCard = new CreditCardInput({
    cardInput,
    expiryInput,
    cvvInput,
    expiryMaxYears: 5, // Allow only up to 5 years from now
});
```

Default is `10`.

---

## Ignoring CVV Length Validation

If you want to accept both 3‑digit and 4‑digit CVV codes for any card type, set `ignoreCvvLength: true`.

```javascript
const creditCard = new CreditCardInput({
    cardInput,
    expiryInput,
    cvvInput,
    ignoreCvvLength: true,
});
```

This is useful for some payment gateways that allow 4‑digit CVV on non‑Amex cards.

---

## Combining Multiple Customisations

You can mix and match all options:

```javascript
const creditCard = new CreditCardInput({
    cardInput,
    expiryInput,
    cvvInput,
    formatCardNumber: myCardFormatter,
    formatExpiry: myExpiryFormatter,
    formatCvv: myCvvFormatter,
    getCardType: myCardDetector,
    ignoreCvvLength: true,
    expiryMaxYears: 8,
});
```

---

## Advanced: Extending the Class

For complex customisations (e.g., changing validation rules), you can extend the `CreditCardInput` class and override private methods. However, this is not officially supported and may break with future updates. Prefer using the provided constructor options.

---

## Next Steps

- Read about [lifecycle management with `destroy()`](./06-destroy-cleanup.md) to avoid memory leaks.
- Check [limitations](./07-limitations.md) to understand known constraints.
- See [accessibility recommendations](./08-accessibility.md) for ARIA attributes.
