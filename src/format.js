// @ts-check

import { isProbablyAmex } from './helpers.js';

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
 * Formats an expiry date input field to MM / YY.
 * - Only digits are allowed, maximum 4 digits.
 * - Prevents entering "00" as month by collapsing multiple leading zeros into one.
 * - If the entered month is greater than 12, it prepends a zero (e.g., "14" -> "014" -> "01 / 4").
 * - Handles cursor position correctly, especially after auto-correction.
 *
 * @param {HTMLInputElement} input - The input element to format.
 * @param {string} [dateSeparator=' / '] - Separator between month and year.
 */
export function formatExpiry(input, dateSeparator = ' / ') {
    // Save current cursor position and old value
    const cursorPos = input.selectionStart || 0;
    const oldValue = input.value;

    // Extract only digits, limit to 4 characters
    let digits = oldValue.replace(/\D/g, '').substring(0, 4);
    
    // Count how many digits were before the cursor in the old value
    const digitsBeforeCursor = oldValue.slice(0, cursorPos).replace(/\D/g, '').length;

    // --- Apply correction rules ---

    // 1. Prevent "00" month: replace multiple leading zeros with a single zero
    digits = digits.replace(/^0+/g, '0');

    // 2. If the first two digits form a month > 12, prepend a zero and keep only 4 digits
    const month = parseInt(digits.slice(0, 2), 10);
    if (month > 12) {
        digits = ('0' + digits).slice(0, 4);
    }

    // --- Format the digits ---
    let formatted = '';
    if (digits.length > 0) {
        if (digits.length <= 2) {
            // Only month part is visible
            formatted = digits;
        } else {
            // Insert separator between month and year
            formatted = digits.substring(0, 2) + dateSeparator + digits.substring(2, 4);
        }
    }

    // Update input value
    input.value = formatted;

    // --- Restore cursor position ---
    let newCursorPos;

    // If cursor was at the end of the old value (typical when typing),
    // set it to the end of the formatted string.
    if (cursorPos === oldValue.length) {
        newCursorPos = formatted.length;
    } else {
        // Otherwise, compute new position based on digit count before cursor.
        // This handles cases like deleting or inserting in the middle.
        let digitCount = 0;
        newCursorPos = 0;
        while (newCursorPos < formatted.length && digitCount < digitsBeforeCursor) {
            if (/\d/.test(formatted[newCursorPos])) {
                digitCount++;
            }
            newCursorPos++;
        }
        // If we couldn't find all expected digits, put cursor at the end.
        if (digitCount < digitsBeforeCursor) {
            newCursorPos = formatted.length;
        }
    }

    // Set the cursor to the calculated position
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
