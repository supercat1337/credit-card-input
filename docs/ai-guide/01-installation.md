---
title: 'Credit Card Input – Installation & Basic Usage'
version: '1.0.4'
tags: [credit-card, input, installation, npm, github, quick-start]
category: 'getting-started'
---

# Installation & Basic Usage

## Installation

### Using npm from GitHub

```bash
npm install https://github.com/supercat1337/credit-card-input
```

This will install the package directly from the GitHub repository.

### Direct download

You can also download the files from the [dist](./dist) folder and serve them yourself.

### Local ESM import (using import map)

If you have the library files locally (e.g., in `node_modules` after install, or a local copy), you can use an import map:

```html
<script type="importmap">
    {
        "imports": {
            "@supercat1337/credit-card-input": "./node_modules/@supercat1337/credit-card-input/dist/credit-card-input.esm.js"
        }
    }
</script>
```

Then in your module script:

```javascript
import { CreditCardInput } from '@supercat1337/credit-card-input';
```

Alternatively, import directly from the bundled version (includes the event emitter dependency):

```javascript
import { CreditCardInput } from './node_modules/@supercat1337/credit-card-input/dist/credit-card-input.bundle.esm.js';
```

## Basic HTML Structure

Create three input fields (card number, expiry, CVV) in your HTML:

```html
<div>
    <label>Card Number</label>
    <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" />
</div>

<div>
    <label>Expiry Date</label>
    <input type="text" id="expiryDate" placeholder="MM / YY" />
</div>

<div>
    <label>CVV</label>
    <input type="text" id="cvv" placeholder="123" />
</div>

<button id="submitBtn" disabled>Pay</button>
```

## Basic JavaScript Usage

```javascript
import { CreditCardInput } from '@supercat1337/credit-card-input';

// Get references to the input elements
const cardInput = document.getElementById('cardNumber');
const expiryInput = document.getElementById('expiryDate');
const cvvInput = document.getElementById('cvv');
const submitBtn = document.getElementById('submitBtn');

// Create an instance
const creditCard = new CreditCardInput({
    cardInput,
    expiryInput,
    cvvInput,
});

// Subscribe to status changes (optional)
creditCard.onCardStatus((event, instance) => {
    console.log('Card status:', event.status, event.type);
    // Update UI accordingly
});

creditCard.onExpiryStatus(event => {
    console.log('Expiry status:', event.status);
});

creditCard.onCvvStatus(event => {
    console.log('CVV status:', event.status);
});

creditCard.onAllValid(({ isAllValid }) => {
    submitBtn.disabled = !isAllValid;
    console.log('All fields valid:', isAllValid);
});

// Start listening to input events
creditCard.init();
```

## Minimal Example Without Subscriptions

If you only need formatting and don't care about UI updates, you can still call formatters manually:

```javascript
import { formatCardNumber } from '@supercat1337/credit-card-input';

const cardInput = document.getElementById('cardNumber');
cardInput.addEventListener('input', () => {
    formatCardNumber(cardInput);
});
```

But using the `CreditCardInput` class with events gives you validation and type detection out of the box.

## Next Steps

- Learn the [full API reference](./02-api-reference.md) to understand all methods and events.
- See how to handle [validation results](./03-validation-results.md) with detailed error codes.
- Explore [customization options](./05-customization.md) for advanced use cases (e.g., supporting longer card numbers).
