// @ts-check

import { CreditCardInput } from '../dist/credit-card-input.bundle.esm.js';

/**
 * @typedef {'neutral' | 'valid' | 'invalid'} Status
 */

/**
 * Updates the card number field UI based on validation status.
 * @param {Status} status
 */
function updateCardIcon(status) {
    const input = /** @type {HTMLInputElement} */ (document.getElementById('cardNumber'));
    const validIcon = document.getElementById('cardValidIcon');
    const invalidIcon = document.getElementById('cardInvalidIcon');

    // Remove all validation classes and hide both icons
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
    // neutral – do nothing
}

/**
 * Updates the expiry date field UI based on validation status.
 * @param {Status} status
 */
function updateExpiryIcon(status) {
    const input = /** @type {HTMLInputElement} */ (document.getElementById('expiryDate'));
    const validIcon = document.getElementById('expiryValidIcon');
    const invalidIcon = document.getElementById('expiryInvalidIcon');

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

/**
 * Updates the CVV field UI based on validation status.
 * @param {Status} status
 */
function updateCvvIcon(status) {
    const input = /** @type {HTMLInputElement} */ (document.getElementById('cvv'));
    const validIcon = document.getElementById('cvvValidIcon');
    const invalidIcon = document.getElementById('cvvInvalidIcon');

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

// ---------- Initialization ----------
const creditCard = new CreditCardInput({
    cardInput: /** @type {HTMLInputElement} */ (document.getElementById('cardNumber')),
    expiryInput: /** @type {HTMLInputElement} */ (document.getElementById('expiryDate')),
    cvvInput: /** @type {HTMLInputElement} */ (document.getElementById('cvv')),
});

// Subscribe to events and update UI
creditCard.onCardStatus(({ status, type, isAmex }) => {
    updateCardIcon(status);
    const cardTypeDisplay = document.getElementById('cardTypeDisplay');
    if (cardTypeDisplay) {
        cardTypeDisplay.textContent = type ? `Card type: ${type}` : '';
    }
    // Update CVV hint
    const cvvHelp = document.getElementById('cvvHelp');
    if (cvvHelp) {
        cvvHelp.textContent = isAmex ? '4 digits on the front' : '3 digits on the back';
    }
});

creditCard.onExpiryStatus(({ status }) => {
    updateExpiryIcon(status);
});

creditCard.onCvvStatus(({ status }) => {
    updateCvvIcon(status);
});

creditCard.onAllValid(({ isAllValid }) => {
    const submitButton = /** @type {HTMLButtonElement} */ (document.getElementById('submitButton'));
    submitButton.disabled = !isAllValid;
});

// Initially disable submit button
const submitButton = /** @type {HTMLButtonElement} */ (document.getElementById('submitButton'));
submitButton.disabled = true;

// Start listening to input events
creditCard.init();
