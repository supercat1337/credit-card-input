---
title: 'Credit Card Input – Accessibility (ARIA)'
version: '1.0.4'
tags: [credit-card, accessibility, aria, a11y, screen-readers]
category: 'advanced'
---

# Accessibility (ARIA) Recommendations

The library does **not** automatically set ARIA attributes or manage focus. This is intentional – it keeps the library UI‑agnostic and avoids making assumptions about your styling or framework.

However, you can easily add accessibility features using the event callbacks. This document shows you how.

---

## Why ARIA matters

- **Screen readers** announce validation errors and field states only if you provide appropriate ARIA attributes.
- Users navigating with keyboards rely on focus management and clear error announcements.
- Adding ARIA improves compliance with WCAG (Web Content Accessibility Guidelines).

---

## Essential ARIA Attributes

| Attribute          | When to set                                          | Example value  |
| ------------------ | ---------------------------------------------------- | -------------- |
| `aria-invalid`     | Field status is `'invalid'`                          | `"true"`       |
| `aria-describedby` | Link to an element containing an error message       | `"card-error"` |
| `aria-live`        | Container that announces dynamic validation messages | `"polite"`     |

---

## Example: Adding `aria-invalid` and error messages

```javascript
import { CreditCardInput } from '@supercat1337/credit-card-input';

const cardInput = document.getElementById('cardNumber');
const expiryInput = document.getElementById('expiryDate');
const cvvInput = document.getElementById('cvv');

const cardErrorSpan = document.getElementById('cardError');
const expiryErrorSpan = document.getElementById('expiryError');
const cvvErrorSpan = document.getElementById('cvvError');

const creditCard = new CreditCardInput({ cardInput, expiryInput, cvvInput });

creditCard.onCardStatus(({ status }) => {
    // Set aria-invalid
    cardInput.setAttribute('aria-invalid', status === 'invalid' ? 'true' : 'false');

    // Update error message (if needed)
    const validation = creditCard.getCardValidationResult();
    if (validation.code !== 'valid') {
        cardErrorSpan.textContent = validation.message || '';
    } else {
        cardErrorSpan.textContent = '';
    }
});

creditCard.onExpiryStatus(({ status }) => {
    expiryInput.setAttribute('aria-invalid', status === 'invalid' ? 'true' : 'false');
    const validation = creditCard.getExpiryValidationResult();
    expiryErrorSpan.textContent = validation.code !== 'valid' ? validation.message || '' : '';
});

creditCard.onCvvStatus(({ status }) => {
    cvvInput.setAttribute('aria-invalid', status === 'invalid' ? 'true' : 'false');
    const validation = creditCard.getCvvValidationResult();
    cvvErrorSpan.textContent = validation.code !== 'valid' ? validation.message || '' : '';
});

creditCard.init();
```

**HTML structure with ARIA:**

```html
<div>
    <label for="cardNumber">Card Number</label>
    <input type="text" id="cardNumber" aria-describedby="cardError" />
    <span id="cardError" aria-live="polite" class="error-message"></span>
</div>
```

---

## Announce Validation Messages via `aria-live`

Wrap your error message container with `aria-live="polite"` so screen readers announce changes without interrupting the user.

```html
<div id="cardError" aria-live="polite"></div>
```

When the error message text changes (e.g., from `""` to `"Card number is invalid (Luhn check failed)"`), screen readers will announce the new message.

---

## Focus Management

While the library does not move focus automatically, you can implement it using event callbacks. This helps keyboard users navigate efficiently.

```javascript
creditCard.onCardStatus(({ status }) => {
    if (status === 'valid') {
        creditCard.expiryInput.focus();
    }
});

creditCard.onExpiryStatus(({ status }) => {
    if (status === 'valid') {
        creditCard.cvvInput.focus();
    }
});
```

**Note:** Be careful with auto‑focus – it can be disorienting for some users. Consider providing an option to enable/disable it.

---

## Full Accessible Example (with Bootstrap 5)

The [example in the repository](../examples/01/) includes ARIA attributes and focus management. Here's a snippet:

```javascript
creditCard.onCardStatus(({ status }) => {
    cardInput.setAttribute('aria-invalid', status === 'invalid' ? 'true' : 'false');
    if (status === 'valid') {
        expiryInput.focus();
    }
});
```

---

## Testing Accessibility

- Use **Chrome DevTools** → **Lighthouse** → Accessibility score.
- Use a screen reader (NVDA on Windows, VoiceOver on macOS/iOS).
- Navigate using only the **Tab** key – ensure focus order is logical and error messages are announced.

---

## Summary

| Feature                                | Implemented by library? | How to add manually                 |
| -------------------------------------- | ----------------------- | ----------------------------------- |
| `aria-invalid`                         | No                      | Set via `onCardStatus` etc.         |
| Error messages with `aria-describedby` | No                      | Update a separate span in callbacks |
| `aria-live` announcements              | No                      | Wrap error container                |
| Focus management                       | No                      | Call `.focus()` in callbacks        |

Adding these attributes is straightforward and ensures your payment form is usable by everyone.

---

## Next Steps

- Review the [API reference](./02-api-reference.md) for event details.
- See [limitations](./07-limitations.md) for other edge cases.
- Explore [customization](./05-customization.md) for advanced formatting.
