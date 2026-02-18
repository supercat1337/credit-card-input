// @ts-check

import { EventEmitterLite } from '@supercat1337/event-emitter';
import {
    formatExpiry as defaultFormatExpiry,
    formatCvv as defaultFormatCvv,
    formatCardNumber as defaultFormatCardNumber,
} from './format.js';
import { getCardType as defaultGetCardType, isProbablyAmex, luhnValidate } from './helpers.js';

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
    /**
     * @param {Object} options
     * @param {HTMLInputElement} options.cardInput - Card number input field
     * @param {HTMLInputElement} options.expiryInput - Expiry date input field
     * @param {HTMLInputElement} options.cvvInput - CVV input field
     * @param {function(HTMLInputElement): void} [options.formatCardNumber] - Custom card number formatter
     * @param {function(HTMLInputElement): void} [options.formatExpiry] - Custom expiry formatter
     * @param {function(HTMLInputElement): void} [options.formatCvv] - Custom CVV formatter
     * @param {function(string): string} [options.getCardType] - Custom card type detector
     */
    constructor({
        cardInput,
        expiryInput,
        cvvInput,
        formatCardNumber = defaultFormatCardNumber,
        formatExpiry = defaultFormatExpiry,
        formatCvv = defaultFormatCvv,
        getCardType = defaultGetCardType,
    }) {
        this.cardInput = cardInput;
        this.expiryInput = expiryInput;
        this.cvvInput = cvvInput;

        // Instance-specific formatters
        this._formatCardNumber = formatCardNumber;
        this._formatExpiry = formatExpiry;
        this._formatCvv = formatCvv;
        this._getCardType = getCardType;

        this.eventEmitter = new EventEmitterLite();

        // Internal states
        /** @type {Status} */ this._cardStatus = 'neutral';
        /** @type {Status} */ this._expiryStatus = 'neutral';
        /** @type {Status} */ this._cvvStatus = 'neutral';
        /** @type {string} */ this._cardType = '';
        /** @type {boolean} */ this._isAmex = false;
        /** @type {boolean} */ this._allValid = false;
    }
    // Public methods to trigger formatting (can also be called directly)
    formatCardNumber() {
        this._formatCardNumber(this.cardInput);
    }

    formatExpiry() {
        this._formatExpiry(this.expiryInput);
    }

    formatCvv() {
        this._formatCvv(this.cvvInput);
    }

    /**
     * Get the card type based on the given digits.
     * @param {string} digits - Digits of the card number
     * @returns {string} - Card type (Visa, Mastercard, etc.)
     */
    getCardType(digits) {
        return this._getCardType(digits);
    }

    // ---------- Public subscription methods ----------

    /**
     * Subscribe to card number status change event.
     * @param {function(CardStatusEvent, CreditCardInput): void} callback
     * @returns {() => void} Unsubscribe function
     */
    onCardStatus(callback) {
        return this.eventEmitter.on('cardStatusChange', callback);
    }

    /**
     * Subscribe to expiry date status change event.
     * @param {function(ExpiryStatusEvent, CreditCardInput): void} callback
     * @returns {() => void}
     */
    onExpiryStatus(callback) {
        return this.eventEmitter.on('expiryStatusChange', callback);
    }

    /**
     * Subscribe to CVV status change event.
     * @param {function(CvvStatusEvent, CreditCardInput): void} callback
     * @returns {() => void}
     */
    onCvvStatus(callback) {
        return this.eventEmitter.on('cvvStatusChange', callback);
    }

    /**
     * Subscribe to event when all three fields become valid or invalid.
     * @param {function(AllValidEvent, CreditCardInput): void} callback
     * @returns {() => void}
     */
    onAllValid(callback) {
        return this.eventEmitter.on('allValid', callback);
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
            cardStatus: this._cardStatus,
            expiryStatus: this._expiryStatus,
            cvvStatus: this._cvvStatus,
            cardType: this._cardType,
            isAmex: this._isAmex,
            allValid: this._allValid,
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
            this._updateCardStatus();
            this._updateCvvStatus(); // CVV depends on card type
        });

        this.expiryInput.addEventListener('input', () => {
            this.formatExpiry();
            this._updateExpiryStatus();
        });

        this.cvvInput.addEventListener('input', () => {
            this.formatCvv();
            this._updateCvvStatus();
        });

        // Initial update
        this._updateCardStatus();
        this._updateExpiryStatus();
        this._updateCvvStatus();

        this.emit('init');
    }

    /**
     * Emit event (internal use).
     * @param {string} event
     * @param {...any} args
     */
    emit(event, ...args) {
        this.eventEmitter.emit(event, ...args, this);
    }

    // ---------- Private methods ----------

    _updateCardStatus() {
        const value = this.cardInput.value;
        const digits = value.replace(/\D/g, '');
        const isAmex = isProbablyAmex(digits);
        const maxDigits = isAmex ? 15 : 16;
        const type = this.getCardType(digits);

        this._cardType = type;
        this._isAmex = isAmex;

        /** @type {Status} */
        let status = 'neutral';
        let isValid = false;

        if (digits.length >= maxDigits) {
            isValid = luhnValidate(digits);
            status = isValid ? 'valid' : 'invalid';
        }

        // Always emit event, as other fields (type, isAmex) may change
        this._cardStatus = status;
        this.emit('cardStatusChange', {
            status,
            value,
            digits,
            type,
            isAmex,
            isValid,
            maxDigits,
        });

        this._checkAllValid();
    }

    _updateExpiryStatus() {
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

        this._expiryStatus = status;
        this.emit('expiryStatusChange', {
            status,
            value,
            digits,
            month,
            year,
        });

        this._checkAllValid();
    }

    _updateCvvStatus() {
        const value = this.cvvInput.value;
        const digits = value.replace(/\D/g, '');
        const isAmex = this._isAmex;
        const expectedLength = isAmex ? 4 : 3;

        /** @type {Status} */
        let status = 'neutral';

        if (digits.length > 0) {
            status = digits.length === expectedLength ? 'valid' : 'invalid';
        }

        this._cvvStatus = status;
        this.emit('cvvStatusChange', {
            status,
            value,
            digits,
            expectedLength,
            isAmex,
        });

        this._checkAllValid();
    }

    /**
     * Checks if all fields are valid and emits allValid event on change.
     */
    _checkAllValid() {
        const allValidNow =
            this._cardStatus === 'valid' &&
            this._expiryStatus === 'valid' &&
            this._cvvStatus === 'valid';
        if (this._allValid !== allValidNow) {
            this._allValid = allValidNow;
            this.emit('allValid', { isAllValid: allValidNow });
        }
    }
}
