// @ts-check

import { isProbablyAmex } from "./helpers.js";

// ---- Format CVV: only digits ----

/**
 * Format CVV input: only allow 4 digits
 * @param {HTMLInputElement} input - The input element to be formatted
 * @returns {void}
 */
export function formatCvv(input) {
    const oldValue = input.value;
    const cursorPos = input.selectionStart || 0;
    const digits = oldValue.replace(/\D/g, '');
    const newValue = digits.substring(0, 4);
    input.value = newValue;

    if (cursorPos <= newValue.length) {
        input.setSelectionRange(cursorPos, cursorPos);
    } else {
        input.setSelectionRange(newValue.length, newValue.length);
    }
}

// ---- Format expiry as MM / YY ----

/**
 * Format expiry date input: only allow MM / YY (4 digits)
 * @param {HTMLInputElement} input - The input element to be formatted
 * @returns {void}
 */
export function formatExpiry(input) {
    const cursorPos = input.selectionStart || 0;
    const oldValue = input.value;

    let digits = oldValue.replace(/\D/g, '').substring(0, 4);
    const digitsBeforeCursor = oldValue.slice(0, cursorPos).replace(/\D/g, '').length;

    let formatted = '';
    if (digits.length > 0) {
        if (digits.length <= 2) {
            formatted = digits;
        } else {
            formatted = digits.substring(0, 2) + ' / ' + digits.substring(2, 4);
        }
    }

    input.value = formatted;

    let newCursorPos = 0;
    let digitCount = 0;
    while (newCursorPos < formatted.length && digitCount < digitsBeforeCursor) {
        if (/\d/.test(formatted[newCursorPos])) {
            digitCount++;
        }
        newCursorPos++;
    }
    if (digitCount < digitsBeforeCursor) {
        newCursorPos = formatted.length;
    }
    input.setSelectionRange(newCursorPos, newCursorPos);
}

// ---- Format card number with dynamic grouping ----

/**
 * Format card number input: dynamic grouping based on card type
 * @param {HTMLInputElement} input - The input element to be formatted
 * @returns {void}
 */
export function formatCardNumber(input) {
    const oldValue = input.value;
    const cursorPos = input.selectionStart || 0;

    let digits = oldValue.replace(/\D/g, '');
    const isAmex = isProbablyAmex(digits);
    const maxDigits = isAmex ? 15 : 16;
    digits = digits.substring(0, maxDigits);
    const digitsBeforeCursor = oldValue.slice(0, cursorPos).replace(/\D/g, '').length;

    let formatted = '';
    if (isAmex) {
        const groups = [4, 6, 5];
        let digitIndex = 0;
        for (let i = 0; i < groups.length; i++) {
            const groupSize = groups[i];
            for (let j = 0; j < groupSize; j++) {
                if (digitIndex < digits.length) {
                    formatted += digits[digitIndex];
                    digitIndex++;
                }
            }
            if (digitIndex < digits.length && i < groups.length - 1) {
                formatted += ' ';
            }
        }
    } else {
        for (let i = 0; i < digits.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formatted += ' ';
            }
            formatted += digits[i];
        }
    }

    input.value = formatted;

    let newCursorPos = 0;
    let digitCount = 0;
    while (newCursorPos < formatted.length && digitCount < digitsBeforeCursor) {
        if (/\d/.test(formatted[newCursorPos])) {
            digitCount++;
        }
        newCursorPos++;
    }
    if (digitCount < digitsBeforeCursor) {
        newCursorPos = formatted.length;
    }
    input.setSelectionRange(newCursorPos, newCursorPos);
}