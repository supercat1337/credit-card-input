---
title: 'Credit Card Input – Lifecycle Management (destroy)'
version: '1.0.4'
tags: [credit-card, lifecycle, destroy, cleanup, memory-leaks]
category: 'advanced'
---

# Lifecycle Management: `destroy()`

When you use the `CreditCardInput` component in a single‑page application (SPA) or any environment where components are dynamically created and removed, you must clean up event listeners to prevent memory leaks and unexpected behaviour.

The library provides a `destroy()` method that removes all DOM event listeners and releases internal references.

---

## Why `destroy()` is necessary

- The `init()` method adds `input` event listeners to the three input fields (`cardInput`, `expiryInput`, `cvvInput`).
- If you remove the DOM elements from the page or discard the `CreditCardInput` instance without calling `destroy()`, those event listeners remain attached (even if the inputs are gone, they may cause errors or retain memory).
- In SPAs (React, Vue, Svelte, etc.), components mount and unmount. Always call `destroy()` during the unmount phase.

---

## Usage

```javascript
// Create and initialise the component
const creditCard = new CreditCardInput({
    cardInput: document.getElementById('cardNumber'),
    expiryInput: document.getElementById('expiryDate'),
    cvvInput: document.getElementById('cvv'),
});
creditCard.init();

// ... later, when the component is no longer needed
creditCard.destroy();
```

After calling `destroy()`, the instance is no longer usable. The input fields will retain their values, but formatting and validation will stop.

---

## What `destroy()` does

- Removes the `input` event listeners from all three input fields.
- Nullifies internal references (`eventEmitter`, `#boundHandlers`, and the input fields themselves) to help garbage collection.
- Does **not** modify the input field values or their appearance.

---

## Example in a React Component (functional)

```jsx
import { useEffect, useRef } from 'react';
import { CreditCardInput } from '@supercat1337/credit-card-input';

function CreditCardForm() {
    const cardRef = useRef(null);
    const expiryRef = useRef(null);
    const cvvRef = useRef(null);
    const creditCardRef = useRef(null);

    useEffect(() => {
        if (cardRef.current && expiryRef.current && cvvRef.current) {
            const cc = new CreditCardInput({
                cardInput: cardRef.current,
                expiryInput: expiryRef.current,
                cvvInput: cvvRef.current,
            });
            cc.init();
            creditCardRef.current = cc;
        }

        return () => {
            if (creditCardRef.current) {
                creditCardRef.current.destroy();
            }
        };
    }, []);

    return (
        <form>
            <input ref={cardRef} placeholder="Card number" />
            <input ref={expiryRef} placeholder="MM / YY" />
            <input ref={cvvRef} placeholder="CVV" />
        </form>
    );
}
```

---

## Example in a Vue Component

```vue
<template>
    <div>
        <input ref="cardInput" placeholder="Card number" />
        <input ref="expiryInput" placeholder="MM / YY" />
        <input ref="cvvInput" placeholder="CVV" />
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { CreditCardInput } from '@supercat1337/credit-card-input';

const cardInput = ref(null);
const expiryInput = ref(null);
const cvvInput = ref(null);
let creditCard = null;

onMounted(() => {
    creditCard = new CreditCardInput({
        cardInput: cardInput.value,
        expiryInput: expiryInput.value,
        cvvInput: cvvInput.value,
    });
    creditCard.init();
});

onBeforeUnmount(() => {
    if (creditCard) creditCard.destroy();
});
</script>
```

---

## What happens if you don't call `destroy()`?

- In a traditional multi‑page app (full page reloads), it’s usually fine because the page is discarded completely.
- In an SPA, the event listeners will persist even after the component is removed. If the same input elements are re‑created later, you may end up with duplicate listeners, causing erratic behaviour (e.g., events firing multiple times).
- Memory usage may increase over time.

**Always call `destroy()` when you discard the component instance.**

---

## Interaction with other methods

- After `destroy()`, methods like `formatCardNumber()`, `getCardData()`, etc., will either throw errors (if they access nullified references) or silently fail. **Do not reuse a destroyed instance.**
- If you need to re‑initialise the same inputs later, create a new instance.

---

## Testing `destroy()`

You can verify that listeners are removed by checking that typing into the inputs no longer triggers formatting or validation after `destroy()`.

```javascript
const cc = new CreditCardInput({ cardInput, expiryInput, cvvInput });
cc.init();
cc.destroy();
// Now typing into the inputs will not format or validate.
```

---

## Next Steps

- Read about [limitations](./07-limitations.md) – maximum card length, expiry auto‑correction, and other edge cases.
- Explore [accessibility recommendations](./08-accessibility.md) for ARIA attributes.
- Review the [API reference](./02-api-reference.md) for complete method details.
