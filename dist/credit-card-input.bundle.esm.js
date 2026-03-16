// @ts-check

const ORIGINAL = Symbol('original');

/**
 * @template {string | symbol | Record<string|symbol, any[]>} [Events=string]
 */
class EventEmitterLite {
    /**
     * @type {Object.<Events extends string | symbol ? Events : keyof Events, Function[]>}
     */
    events = Object.create(null);

    /**
     * logErrors indicates whether errors thrown by listeners should be logged to the console.
     * @type {boolean}
     */
    logErrors = true;

    /**
     * on is used to add a callback function that's going to be executed when the event is triggered
     * @template {Events extends string | symbol ? Events : keyof Events} K
     * @param {K} event
     * @param {Function} listener
     * @returns {() => void}
     */
    on(event, listener) {
        if (!this.events[event]) this.events[event] = [];

        this.events[event].push(listener);
        let unsubscriber = () => this.removeListener(event, listener);
        return unsubscriber;
    }

    /**
     * Add a one-time listener
     * @template {Events extends string | symbol ? Events : keyof Events} K
     * @param {K} event
     * @param {Function} listener
     * @returns {()=>void}
     */
    once(event, listener) {
        const wrapper = (/** @type {...any} */ ...args) => {
            this.removeListener(event, wrapper);
            listener.apply(this, args);
        };
        wrapper[ORIGINAL] = listener;
        return this.on(event, wrapper);
    }

    /**
     * off is an alias for removeListener
     * @template {Events extends string | symbol ? Events : keyof Events} K
     * @param {K} event
     * @param {Function} listener
     */
    off(event, listener) {
        return this.removeListener(event, listener);
    }

    /**
     * Remove an event listener from an event
     * @template {Events extends string | symbol ? Events : keyof Events} K
     * @param {K} event
     * @param {Function} listener
     */
    removeListener(event, listener) {
        if (typeof listener !== 'function') return;

        const listeners = this.events[event];
        if (!listeners) return;

        // @ts-ignore
        const idx = listeners.findIndex(l => l === listener || l[ORIGINAL] === listener);
        if (idx > -1) {
            listeners.splice(idx, 1);
            if (listeners.length === 0) delete this.events[event];
        }
    }

    /**
     * emit is used to trigger an event
     * @template {Events extends string | symbol ? Events : keyof Events} K
     * @param {K} event
     * @param {...any} args
     */
    emit(event, ...args) {
        const listeners = this.events[event];
        if (!listeners) return;

        const queue = (this.events[event] || []).slice();
        var length = queue.length;

        for (let i = 0; i < length; i++) {
            try {
                queue[i].apply(this, args);
            } catch (e) {
                if (this.logErrors) {
                    console.error(`Error in listener for event "${String(event)}":`, e);
                }
            }
        }
    }
}

// @ts-check

/**
 * Detects the type of a credit card based on its number
 * @param {string} digits The credit card number as a string of digits
 * @returns {string} The type of the credit card (e.g. "Visa", "Mastercard", etc.)
 * @example
 * getCardType('4111111111111110') // returns "Visa"
 */
function getCardType(digits) {
    if (!digits || digits.length === 0) return '';
    const firstTwo = digits.substring(0, 2);
    const firstThree = digits.substring(0, 3);
    const firstFour = digits.substring(0, 4);

    // Visa
    if (digits[0] === '4') return 'Visa';
    // Mastercard (ranges: 51-55, 2221-2720)
    if (/^5[1-5]/.test(digits)) return 'Mastercard';
    if (parseInt(firstFour) >= 2221 && parseInt(firstFour) <= 2720) return 'Mastercard';
    // American Express
    if (firstTwo === '34' || firstTwo === '37') return 'American Express';
    // Discover
    if (
        firstFour === '6011' ||
        /^65/.test(digits) ||
        (parseInt(firstThree) >= 644 && parseInt(firstThree) <= 649)
    )
        return 'Discover';
    // JCB
    if (/^35/.test(digits)) return 'JCB';
    // Diners Club
    if (
        firstTwo === '36' ||
        firstTwo === '38' ||
        (parseInt(firstThree) >= 300 && parseInt(firstThree) <= 305)
    )
        return 'Diners Club';
    // UnionPay
    if (/^62/.test(digits)) return 'UnionPay';
    // Default
    return 'Unknown';
}


// ---- Luhn algorithm ----

/**
 * Calculates the checksum of a card number using the Luhn algorithm
 * @param {string} code - the card number as a string
 * @returns {number} - the checksum of the card number
 * @example
 * luhnChecksum('4111111111111110') // returns 0
 */
function luhnChecksum(code) {
    var len = code.length;
    var parity = len % 2;
    var sum = 0;
    for (let i = len - 1; i >= 0; i--) {
        let d = parseInt(code.charAt(i));
        if (i % 2 == parity) {
            d *= 2;
        }
        if (d > 9) {
            d -= 9;
        }
        sum += d;
    }
    return sum % 10;
}

/**
 * Validate a card number using the Luhn algorithm
 * @param {string} fullcode - the full card number as a string
 * @returns {boolean} - true if the card number is valid, false otherwise
 */
function luhnValidate(fullcode) {
    fullcode = fullcode.replace(/[^0-9]/g, '');
    if (fullcode.length < 2) {
        return false;
    }
    return luhnChecksum(fullcode) === 0;
}

// ---- Amex detection ----

/**
 * Checks if a given card number is probably an American Express card
 * @param {string} digits - the card number as a string
 * @returns {boolean} - true if the card number is probably an American Express card, false otherwise
 */
function isProbablyAmex(digits) {
    return digits.length >= 2 && (digits.startsWith('34') || digits.startsWith('37'));
}

// @ts-check


// ---- Format CVV: only digits ----

/**
 * Format CVV input: only allow 4 digits
 * @param {HTMLInputElement} input - The input element to be formatted
 * @returns {void}
 */
function formatCvv(input) {
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
function formatExpiry(input, dateSeparator = ' / ') {
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
function formatCardNumber(input) {
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

// @ts-check


const initEvent = 'init';
const cardStatusChangeEvent = Symbol(); //'cardStatusChange';
const expiryStatusChangeEvent = Symbol(); //'expiryStatusChange';
const cvvStatusChangeEvent = Symbol(); //'cvvStatusChange';
const allValidEvent = Symbol(); // 'allValid';
/**
 * @typedef {'neutral' | 'valid' | 'invalid'} Status
 */

/**
 * @typedef {Object} CardStatusEvent
 * @property {Status} status - Current status of the card field
 * @property {string} value - Raw field value (with spaces)
 * @property {string} digits - Only digits of the card number
 * @property {string} type - Detected card type (Visa, Mastercard, ...)
 * @property {boolean} isAmex - Whether the card is American Express
 * @property {boolean} isValid - Luhn validation result (true/false if enough digits)
 * @property {number} maxDigits - Maximum length for this card type (15 for Amex, 16 for others)
 */

/**
 * @typedef {Object} ExpiryStatusEvent
 * @property {Status} status - Expiry field status
 * @property {string} value - Raw value (MM / YY)
 * @property {string} digits - Only digits
 * @property {number|null} month - Month (number) or null if insufficient digits
 * @property {number|null} year - Year (full, 20xx) or null
 */

/**
 * @typedef {Object} CvvStatusEvent
 * @property {Status} status - CVV field status
 * @property {string} value - Raw value
 * @property {string} digits - Only digits
 * @property {number} expectedLength - Expected length (3 or 4)
 * @property {boolean} isAmex - Amex flag (determined from card number)
 */

/**
 * @typedef {Object} AllValidEvent
 * @property {boolean} isAllValid - true if all fields are valid
 */

class CreditCardInput {
    #formatCardNumber;
    #formatExpiry;
    #formatCvv;
    #getCardType;
    /** @type {Status} */
    #cardStatus;
    /** @type {Status} */
    #expiryStatus;
    /** @type {Status} */
    #cvvStatus;
    #cardType;
    #isAmex;
    #allValid;
    #ignoreCvvLength;

    /**
     * @param {Object} options
     * @param {HTMLInputElement} options.cardInput - Card number input field
     * @param {HTMLInputElement} options.expiryInput - Expiry date input field
     * @param {HTMLInputElement} options.cvvInput - CVV input field
     * @param {function(HTMLInputElement): void} [options.formatCardNumber] - Custom card number formatter
     * @param {function(HTMLInputElement): void} [options.formatExpiry] - Custom expiry formatter
     * @param {function(HTMLInputElement): void} [options.formatCvv] - Custom CVV formatter
     * @param {function(string): string} [options.getCardType] - Custom card type detector
     * @param {boolean} [options.ignoreCvvLength] - Allow CVV with 3 or 4 digits
     */
    constructor({
        cardInput,
        expiryInput,
        cvvInput,
        formatCardNumber: formatCardNumber$1 = formatCardNumber,
        formatExpiry: formatExpiry$1 = formatExpiry,
        formatCvv: formatCvv$1 = formatCvv,
        getCardType: getCardType$1 = getCardType,
        ignoreCvvLength = false,
    }) {
        this.cardInput = cardInput;
        this.expiryInput = expiryInput;
        this.cvvInput = cvvInput;

        // Instance-specific formatters
        this.#formatCardNumber = formatCardNumber$1;
        this.#formatExpiry = formatExpiry$1;
        this.#formatCvv = formatCvv$1;
        this.#getCardType = getCardType$1;

        /** @type {EventEmitterLite<string|symbol >} */
        this.eventEmitter = new EventEmitterLite();

        // Internal states
        /** @type {Status} */ this.#cardStatus = 'neutral';
        /** @type {Status} */ this.#expiryStatus = 'neutral';
        /** @type {Status} */ this.#cvvStatus = 'neutral';
        /** @type {string} */ this.#cardType = '';
        /** @type {boolean} */ this.#isAmex = false;
        /** @type {boolean} */ this.#allValid = false;
        /** @type {boolean} */ this.#ignoreCvvLength = ignoreCvvLength;
    }
    // Public methods to trigger formatting (can also be called directly)
    formatCardNumber() {
        this.#formatCardNumber(this.cardInput);
    }

    formatExpiry() {
        this.#formatExpiry(this.expiryInput);
    }

    formatCvv() {
        this.#formatCvv(this.cvvInput);
    }

    /**
     * Get the card type based on the given digits.
     * @param {string} digits - Digits of the card number
     * @returns {string} - Card type (Visa, Mastercard, etc.)
     */
    getCardType(digits) {
        return this.#getCardType(digits);
    }

    // ---------- Public subscription methods ----------

    /**
     * Subscribe to initialization event.
     * @param {function(CreditCardInput): void} callback - Callback to be called when CreditCardInput is initialized
     * @returns {() => void} Unsubscribe function
     */
    onInit(callback) {
        return this.eventEmitter.on('init', callback);
    }

    /**
     * Subscribe to card number status change event.
     * @param {function(CardStatusEvent, CreditCardInput): void} callback
     * @returns {() => void} Unsubscribe function
     */
    onCardStatus(callback) {
        return this.eventEmitter.on(cardStatusChangeEvent, callback);
    }

    /**
     * Subscribe to expiry date status change event.
     * @param {function(ExpiryStatusEvent, CreditCardInput): void} callback
     * @returns {() => void}
     */
    onExpiryStatus(callback) {
        return this.eventEmitter.on(expiryStatusChangeEvent, callback);
    }

    /**
     * Subscribe to CVV status change event.
     * @param {function(CvvStatusEvent, CreditCardInput): void} callback
     * @returns {() => void}
     */
    onCvvStatus(callback) {
        return this.eventEmitter.on(cvvStatusChangeEvent, callback);
    }

    /**
     * Subscribe to event when all three fields become valid or invalid.
     * @param {function(AllValidEvent, CreditCardInput): void} callback
     * @returns {() => void}
     */
    onAllValid(callback) {
        return this.eventEmitter.on(allValidEvent, callback);
    }

    /**
     * Subscribe to any event (low-level method).
     * @param {string} eventName
     * @param {function(...any): void} callback
     * @returns {() => void}
     */
    on(eventName, callback) {
        return this.eventEmitter.on(eventName, callback);
    }

    /**
     * Get current state.
     * @returns {{
     *   cardStatus: Status,
     *   expiryStatus: Status,
     *   cvvStatus: Status,
     *   cardType: string,
     *   isAmex: boolean,
     *   allValid: boolean
     * }}
     */
    getState() {
        return {
            cardStatus: this.#cardStatus,
            expiryStatus: this.#expiryStatus,
            cvvStatus: this.#cvvStatus,
            cardType: this.#cardType,
            isAmex: this.#isAmex,
            allValid: this.#allValid,
        };
    }

    /**
     * Initialize event handlers.
     * Call after setting up subscriptions.
     */
    init() {
        // Input event handlers
        this.cardInput.addEventListener('input', () => {
            this.formatCardNumber();
            this.#updateCardStatus();
            this.#updateCvvStatus(); // CVV depends on card type
        });

        this.expiryInput.addEventListener('input', () => {
            this.formatExpiry();
            this.#updateExpiryStatus();
        });

        this.cvvInput.addEventListener('input', () => {
            this.formatCvv();
            this.#updateCvvStatus();
        });

        // Initial update
        this.#updateCardStatus();
        this.#updateExpiryStatus();
        this.#updateCvvStatus();

        this.#emit(initEvent);
    }

    /**
     * Emit event (internal use).
     * @param {string|symbol} event
     * @param {...any} args
     */
    #emit(event, ...args) {
        this.eventEmitter.emit(event, ...args, this);
    }

    // ---------- Private methods ----------

    #updateCardStatus() {
        const value = this.cardInput.value;
        const digits = value.replace(/\D/g, '');
        const isAmex = isProbablyAmex(digits);
        const maxDigits = isAmex ? 15 : 16;
        const type = this.getCardType(digits);

        this.#cardType = type;
        this.#isAmex = isAmex;

        /** @type {Status} */
        let status = 'neutral';
        let isValid = false;

        if (digits.length >= maxDigits) {
            isValid = luhnValidate(digits);
            status = isValid ? 'valid' : 'invalid';
        }

        // Always emit event, as other fields (type, isAmex) may change
        this.#cardStatus = status;
        this.#emit(cardStatusChangeEvent, {
            status,
            value,
            digits,
            type,
            isAmex,
            isValid,
            maxDigits,
        });

        this.#checkAllValid();
    }

    #updateExpiryStatus() {
        const value = this.expiryInput.value;
        const digits = value.replace(/\D/g, '');
        /** @type {Status} */
        let status = 'neutral';
        let month = null;
        let year = null;

        if (digits.length === 4) {
            month = parseInt(digits.substring(0, 2), 10);
            year = parseInt(digits.substring(2, 4), 10) + 2000;

            if (month < 1 || month > 12) {
                status = 'invalid';
            } else {
                const now = new Date();
                const currentYear = now.getFullYear();
                const currentMonth = now.getMonth() + 1;

                const currentTotal = currentYear * 12 + currentMonth;
                const inputTotal = year * 12 + month;
                const maxTotal = (currentYear + 10) * 12 + currentMonth;

                if (inputTotal < currentTotal || inputTotal > maxTotal) {
                    status = 'invalid';
                } else {
                    status = 'valid';
                }
            }
        }

        this.#expiryStatus = status;
        this.#emit(expiryStatusChangeEvent, {
            status,
            value,
            digits,
            month,
            year,
        });

        this.#checkAllValid();
    }

    #updateCvvStatus() {
        const value = this.cvvInput.value;
        const digits = value.replace(/\D/g, '');
        const isAmex = this.#isAmex;
        const expectedLength = isAmex ? 4 : 3;

        /** @type {Status} */
        let status = 'neutral';

        if (digits.length > 0) {
            if (this.#ignoreCvvLength) {
                status = digits.length === 3 || digits.length === 4 ? 'valid' : 'invalid';
            } else {
                status = digits.length === expectedLength ? 'valid' : 'invalid';
            }
        }

        this.#cvvStatus = status;
        this.#emit(cvvStatusChangeEvent, {
            status,
            value,
            digits,
            expectedLength,
            isAmex,
        });

        this.#checkAllValid();
    }

    /**
     * Checks if all fields are valid and emits allValid event on change.
     */
    #checkAllValid() {
        const allValidNow =
            this.#cardStatus === 'valid' &&
            this.#expiryStatus === 'valid' &&
            this.#cvvStatus === 'valid';

        if (this.#allValid !== allValidNow) {
            this.#allValid = allValidNow;
            this.#emit(allValidEvent, { isAllValid: allValidNow });
        }
    }
}

export { CreditCardInput, formatCardNumber, formatCvv, formatExpiry, getCardType, isProbablyAmex, luhnChecksum, luhnValidate };
