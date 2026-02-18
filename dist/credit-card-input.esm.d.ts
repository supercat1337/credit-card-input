export type Status = "neutral" | "valid" | "invalid";
export type CardStatusEvent = {
    /**
     * - Current status of the card field
     */
    status: Status;
    /**
     * - Raw field value (with spaces)
     */
    value: string;
    /**
     * - Only digits of the card number
     */
    digits: string;
    /**
     * - Detected card type (Visa, Mastercard, ...)
     */
    type: string;
    /**
     * - Whether the card is American Express
     */
    isAmex: boolean;
    /**
     * - Luhn validation result (true/false if enough digits)
     */
    isValid: boolean;
    /**
     * - Maximum length for this card type (15 for Amex, 16 for others)
     */
    maxDigits: number;
};
export type ExpiryStatusEvent = {
    /**
     * - Expiry field status
     */
    status: Status;
    /**
     * - Raw value (MM / YY)
     */
    value: string;
    /**
     * - Only digits
     */
    digits: string;
    /**
     * - Month (number) or null if insufficient digits
     */
    month: number | null;
    /**
     * - Year (full, 20xx) or null
     */
    year: number | null;
};
export type CvvStatusEvent = {
    /**
     * - CVV field status
     */
    status: Status;
    /**
     * - Raw value
     */
    value: string;
    /**
     * - Only digits
     */
    digits: string;
    /**
     * - Expected length (3 or 4)
     */
    expectedLength: number;
    /**
     * - Amex flag (determined from card number)
     */
    isAmex: boolean;
};
export type AllValidEvent = {
    /**
     * - true if all fields are valid
     */
    isAllValid: boolean;
};
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
    constructor({ cardInput, expiryInput, cvvInput, formatCardNumber: formatCardNumber$1, formatExpiry: formatExpiry$1, formatCvv: formatCvv$1, getCardType: getCardType$1, }: {
        cardInput: HTMLInputElement;
        expiryInput: HTMLInputElement;
        cvvInput: HTMLInputElement;
        formatCardNumber?: (arg0: HTMLInputElement) => void;
        formatExpiry?: (arg0: HTMLInputElement) => void;
        formatCvv?: (arg0: HTMLInputElement) => void;
        getCardType?: (arg0: string) => string;
    });
    cardInput: HTMLInputElement;
    expiryInput: HTMLInputElement;
    cvvInput: HTMLInputElement;
    _formatCardNumber: (arg0: HTMLInputElement) => void;
    _formatExpiry: (arg0: HTMLInputElement) => void;
    _formatCvv: (arg0: HTMLInputElement) => void;
    _getCardType: (arg0: string) => string;
    eventEmitter: EventEmitterLite<string>;
    /** @type {Status} */ _cardStatus: Status;
    /** @type {Status} */ _expiryStatus: Status;
    /** @type {Status} */ _cvvStatus: Status;
    /** @type {string} */ _cardType: string;
    /** @type {boolean} */ _isAmex: boolean;
    /** @type {boolean} */ _allValid: boolean;
    formatCardNumber(): void;
    formatExpiry(): void;
    formatCvv(): void;
    /**
     * Get the card type based on the given digits.
     * @param {string} digits - Digits of the card number
     * @returns {string} - Card type (Visa, Mastercard, etc.)
     */
    getCardType(digits: string): string;
    /**
     * Subscribe to card number status change event.
     * @param {function(CardStatusEvent, CreditCardInput): void} callback
     * @returns {() => void} Unsubscribe function
     */
    onCardStatus(callback: (arg0: CardStatusEvent, arg1: CreditCardInput) => void): () => void;
    /**
     * Subscribe to expiry date status change event.
     * @param {function(ExpiryStatusEvent, CreditCardInput): void} callback
     * @returns {() => void}
     */
    onExpiryStatus(callback: (arg0: ExpiryStatusEvent, arg1: CreditCardInput) => void): () => void;
    /**
     * Subscribe to CVV status change event.
     * @param {function(CvvStatusEvent, CreditCardInput): void} callback
     * @returns {() => void}
     */
    onCvvStatus(callback: (arg0: CvvStatusEvent, arg1: CreditCardInput) => void): () => void;
    /**
     * Subscribe to event when all three fields become valid or invalid.
     * @param {function(AllValidEvent, CreditCardInput): void} callback
     * @returns {() => void}
     */
    onAllValid(callback: (arg0: AllValidEvent, arg1: CreditCardInput) => void): () => void;
    /**
     * Subscribe to any event (low-level method).
     * @param {string} eventName
     * @param {function(...any): void} callback
     * @returns {() => void}
     */
    on(eventName: string, callback: (...args: any[]) => void): () => void;
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
    getState(): {
        cardStatus: Status;
        expiryStatus: Status;
        cvvStatus: Status;
        cardType: string;
        isAmex: boolean;
        allValid: boolean;
    };
    /**
     * Initialize event handlers.
     * Call after setting up subscriptions.
     */
    init(): void;
    /**
     * Emit event (internal use).
     * @param {string} event
     * @param {...any} args
     */
    emit(event: string, ...args: any[]): void;
    _updateCardStatus(): void;
    _updateExpiryStatus(): void;
    _updateCvvStatus(): void;
    /**
     * Checks if all fields are valid and emits allValid event on change.
     */
    _checkAllValid(): void;
}
/**
 * Format card number input: dynamic grouping based on card type
 * @param {HTMLInputElement} input - The input element to be formatted
 * @returns {void}
 */
export function formatCardNumber(input: HTMLInputElement): void;
/**
 * Format CVV input: only allow 4 digits
 * @param {HTMLInputElement} input - The input element to be formatted
 * @returns {void}
 */
export function formatCvv(input: HTMLInputElement): void;
/**
 * Format expiry date input: only allow MM / YY (4 digits)
 * @param {HTMLInputElement} input - The input element to be formatted
 * @returns {void}
 */
export function formatExpiry(input: HTMLInputElement): void;
/**
 * Detects the type of a credit card based on its number
 * @param {string} digits The credit card number as a string of digits
 * @returns {string} The type of the credit card (e.g. "Visa", "Mastercard", etc.)
 * @example
 * getCardType('4111111111111110') // returns "Visa"
 */
export function getCardType(digits: string): string;
/**
 * Checks if a given card number is probably an American Express card
 * @param {string} digits - the card number as a string
 * @returns {boolean} - true if the card number is probably an American Express card, false otherwise
 */
export function isProbablyAmex(digits: string): boolean;
/**
 * Calculates the checksum of a card number using the Luhn algorithm
 * @param {string} code - the card number as a string
 * @returns {number} - the checksum of the card number
 * @example
 * luhnChecksum('4111111111111110') // returns 0
 */
export function luhnChecksum(code: string): number;
/**
 * Validate a card number using the Luhn algorithm
 * @param {string} fullcode - the full card number as a string
 * @returns {boolean} - true if the card number is valid, false otherwise
 */
export function luhnValidate(fullcode: string): boolean;
import { EventEmitterLite } from '@supercat1337/event-emitter';
