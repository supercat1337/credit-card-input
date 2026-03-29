---
title: 'Credit Card Input – Data Retrieval Methods'
version: '1.0.4'
tags: [credit-card, data, state, getters, types]
category: 'reference'
---

# Data Retrieval Methods

These methods give you direct access to the current raw values, parsed data, and full component state without waiting for events. They are useful for form submission, logging, or implementing custom UI logic.

All methods can be called at any time (even before `init()`).

---

## `getCardData()`

Returns an object with information about the card number field.

```typescript
{
    value: string; // Raw input value (with spaces, e.g., "4111 1111 1111 1111")
    digits: string; // Only digits (e.g., "4111111111111111")
    type: string; // Detected card type (e.g., "Visa", "Mastercard", "American Express")
    isAmex: boolean; // True if card type is American Express
    maxDigits: number; // 15 for Amex, 16 for others
    isValid: boolean; // True if enough digits and Luhn passes
    isComplete: boolean; // True if digits.length === maxDigits
}
```

**Example:**

```javascript
const cardData = creditCard.getCardData();
if (cardData.isComplete && cardData.isValid) {
    console.log(`Valid ${cardData.type} card: ${cardData.digits}`);
}
```

---

## `getExpiryData()`

Returns an object with information about the expiry date field.

```typescript
{
    value: string; // Raw input value (e.g., "12 / 28" or "12/28")
    digits: string; // Only digits (e.g., "1228")
    month: number | null; // Parsed month (1-12) or null if incomplete
    year: number | null; // Full year (e.g., 2028) or null if incomplete
    isValid: boolean; // True if month 1-12, not expired, not too far in future
}
```

**Example:**

```javascript
const expiry = creditCard.getExpiryData();
if (expiry.isValid) {
    const formatted = `${expiry.month}/${expiry.year}`;
    sendToServer(formatted);
}
```

---

## `getCvvData()`

Returns an object with information about the CVV field.

```typescript
{
    value: string; // Raw input value (e.g., "123")
    digits: string; // Only digits (e.g., "123")
    expectedLength: number; // 3 for non‑Amex, 4 for Amex (based on current card type)
    isAmex: boolean; // Current Amex flag (from card number)
    isValid: boolean; // True if length matches expectedLength (or 3/4 if ignoreCvvLength)
}
```

**Example:**

```javascript
const cvv = creditCard.getCvvData();
if (!cvv.isValid) {
    showError(`CVV must be ${cvv.expectedLength} digits`);
}
```

---

## `getState()`

Returns the complete state of the component, combining basic statuses, detailed validation results, and raw data for all three fields.

```typescript
{
    // Basic statuses (also available via event callbacks)
    cardStatus: 'neutral' | 'valid' | 'invalid';
    expiryStatus: 'neutral' | 'valid' | 'invalid';
    cvvStatus: 'neutral' | 'valid' | 'invalid';
    cardType: string;
    isAmex: boolean;
    allValid: boolean;

    // Detailed validation results (see validation-results.md)
    cardValidation: ReturnType<CreditCardInput['getCardValidationResult']>;
    expiryValidation: ReturnType<CreditCardInput['getExpiryValidationResult']>;
    cvvValidation: ReturnType<CreditCardInput['getCvvValidationResult']>;

    // Raw data (this file)
    cardData: ReturnType<CreditCardInput['getCardData']>;
    expiryData: ReturnType<CreditCardInput['getExpiryData']>;
    cvvData: ReturnType<CreditCardInput['getCvvData']>;
}
```

**Example (form submission):**

```javascript
function onSubmit() {
    const state = creditCard.getState();
    if (!state.allValid) {
        alert('Please correct the form before submitting');
        return;
    }

    const payload = {
        cardNumber: state.cardData.digits,
        expiryMonth: state.expiryData.month,
        expiryYear: state.expiryData.year,
        cvv: state.cvvData.digits,
    };
    // send to server...
}
```

**Example (debug logging):**

```javascript
console.log(creditCard.getState());
// Outputs everything: validation codes, parsed values, etc.
```

---

## Use Case: Auto‑saving Form Data

You can use `getCardData()`, `getExpiryData()`, and `getCvvData()` to periodically save partial form data to `localStorage` without waiting for validation.

```javascript
function autoSave() {
    const data = {
        card: creditCard.getCardData().value,
        expiry: creditCard.getExpiryData().value,
        cvv: creditCard.getCvvData().value,
    };
    localStorage.setItem('savedPayment', JSON.stringify(data));
}

// Call autoSave on input events (or use a debounced version)
creditCard.onCardStatus(autoSave);
creditCard.onExpiryStatus(autoSave);
creditCard.onCvvStatus(autoSave);
```

---

## Relationship with Event Data

Event callbacks (`onCardStatus`, `onExpiryStatus`, `onCvvStatus`) already provide some of the same data (e.g., `event.digits`, `event.status`). However, using the getter methods is more convenient when you need the data outside of an event handler or when you want the absolute latest state without subscribing to events.

---

## Next Steps

- Learn about [customization](./05-customization.md) – overriding formatters, card type detection, and supporting longer card numbers.
- Read about [lifecycle management](./06-destroy-cleanup.md) to properly clean up the component.
- Check [limitations](./07-limitations.md) for known constraints.
