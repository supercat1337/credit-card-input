// @ts-check

import { EventEmitterLite } from '@supercat1337/event-emitter';
import {
    formatExpiry as defaultFormatExpiry,
    formatCvv as defaultFormatCvv,
    formatCardNumber as defaultFormatCardNumber,
} from './format.js';
import { getCardType as defaultGetCardType, isProbablyAmex, luhnValidate } from './helpers.js';

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

export class CreditCardInput {
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
     * @param {boolean} [options.ignoreCvvLength] -  Allow CVV with 3 or 4 digits for any card.
     * @param {number} [options.expiryMaxYears = 10] - Maximum number of years a card can be valid from the current year
     */
    constructor({
        cardInput,
        expiryInput,
        cvvInput,
        formatCardNumber = defaultFormatCardNumber,
        formatExpiry = defaultFormatExpiry,
        formatCvv = defaultFormatCvv,
        getCardType = defaultGetCardType,
        ignoreCvvLength = false,
        expiryMaxYears = 10,
    }) {
        this.cardInput = cardInput;
        this.expiryInput = expiryInput;
        this.cvvInput = cvvInput;

        // Instance-specific formatters
        this.#formatCardNumber = formatCardNumber;
        this.#formatExpiry = formatExpiry;
        this.#formatCvv = formatCvv;
        this.#getCardType = getCardType;

        this.expiryMaxYears = expiryMaxYears;

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
                const maxTotal = (currentYear + this.expiryMaxYears) * 12 + currentMonth;

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
