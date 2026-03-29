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
     * @param {boolean} [options.ignoreCvvLength] -  Allow CVV with 3 or 4 digits for any card.
     * @param {number} [options.expiryMaxYears = 10] - Maximum number of years a card can be valid from the current year
     */
    constructor({ cardInput, expiryInput, cvvInput, formatCardNumber: formatCardNumber$1, formatExpiry: formatExpiry$1, formatCvv: formatCvv$1, getCardType: getCardType$1, ignoreCvvLength, expiryMaxYears, }: {
        cardInput: HTMLInputElement;
        expiryInput: HTMLInputElement;
        cvvInput: HTMLInputElement;
        formatCardNumber?: (arg0: HTMLInputElement) => void;
        formatExpiry?: (arg0: HTMLInputElement) => void;
        formatCvv?: (arg0: HTMLInputElement) => void;
        getCardType?: (arg0: string) => string;
        ignoreCvvLength?: boolean;
        expiryMaxYears?: number;
    });
    cardInput: HTMLInputElement;
    expiryInput: HTMLInputElement;
    cvvInput: HTMLInputElement;
    expiryMaxYears: number;
    /** @type {EventEmitterLite<string|symbol >} */
    eventEmitter: EventEmitterLite<string | symbol>;
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
     * Subscribe to initialization event.
     * @param {function(CreditCardInput): void} callback - Callback to be called when CreditCardInput is initialized
     * @returns {() => void} Unsubscribe function
     */
    onInit(callback: (arg0: CreditCardInput) => void): () => void;
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
     * Initialize event handlers.
     * Call after setting up subscriptions.
     */
    init(): void;
    /**
     * Returns detailed validation result for the card number field.
     * @returns {{
     *   status: 'valid' | 'invalid' | 'empty' | 'incomplete',
     *   code: 'valid' | 'empty' | 'incomplete' | 'invalid_luhn',
     *   message?: string
     * }}
     */
    getCardValidationResult(): {
        status: "valid" | "invalid" | "empty" | "incomplete";
        code: "valid" | "empty" | "incomplete" | "invalid_luhn";
        message?: string;
    };
    /**
     * Returns detailed validation result for the expiry date field.
     * @returns {{
     *   status: 'valid' | 'invalid' | 'empty' | 'incomplete',
     *   code: 'valid' | 'empty' | 'incomplete' | 'invalid_month' | 'expired' | 'future_too_far',
     *   message?: string
     * }}
     */
    getExpiryValidationResult(): {
        status: "valid" | "invalid" | "empty" | "incomplete";
        code: "valid" | "empty" | "incomplete" | "invalid_month" | "expired" | "future_too_far";
        message?: string;
    };
    /**
     * Returns detailed validation result for the CVV field.
     * @returns {{
     *   status: 'valid' | 'invalid' | 'empty' | 'incomplete',
     *   code: 'valid' | 'empty' | 'incomplete' | 'invalid_length',
     *   message?: string
     * }}
     */
    getCvvValidationResult(): {
        status: "valid" | "invalid" | "empty" | "incomplete";
        code: "valid" | "empty" | "incomplete" | "invalid_length";
        message?: string;
    };
    /**
     * Returns validation results for all three fields.
     * @returns {{
     *   card: ReturnType<CreditCardInput['getCardValidationResult']>,
     *   expiry: ReturnType<CreditCardInput['getExpiryValidationResult']>,
     *   cvv: ReturnType<CreditCardInput['getCvvValidationResult']>,
     *   isAllValid: boolean
     * }}
     */
    getValidationResults(): {
        card: ReturnType<CreditCardInput["getCardValidationResult"]>;
        expiry: ReturnType<CreditCardInput["getExpiryValidationResult"]>;
        cvv: ReturnType<CreditCardInput["getCvvValidationResult"]>;
        isAllValid: boolean;
    };
    /**
     * Returns current card data.
     * @returns {{
     *   value: string,
     *   digits: string,
     *   type: string,
     *   isAmex: boolean,
     *   maxDigits: number,
     *   isValid: boolean,
     *   isComplete: boolean
     * }}
     */
    getCardData(): {
        value: string;
        digits: string;
        type: string;
        isAmex: boolean;
        maxDigits: number;
        isValid: boolean;
        isComplete: boolean;
    };
    /**
     * Returns current expiry data.
     * @returns {{
     *   value: string,
     *   digits: string,
     *   month: number | null,
     *   year: number | null,
     *   isValid: boolean
     * }}
     */
    getExpiryData(): {
        value: string;
        digits: string;
        month: number | null;
        year: number | null;
        isValid: boolean;
    };
    /**
     * Returns current CVV data.
     * @returns {{
     *   value: string,
     *   digits: string,
     *   expectedLength: number,
     *   isAmex: boolean,
     *   isValid: boolean
     * }}
     */
    getCvvData(): {
        value: string;
        digits: string;
        expectedLength: number;
        isAmex: boolean;
        isValid: boolean;
    };
    /**
     * Returns the full state of the component, including validation details and raw data.
     * @returns {{
     *   cardStatus: Status,
     *   expiryStatus: Status,
     *   cvvStatus: Status,
     *   cardType: string,
     *   isAmex: boolean,
     *   allValid: boolean,
     *   cardValidation: ReturnType<CreditCardInput['getCardValidationResult']>,
     *   expiryValidation: ReturnType<CreditCardInput['getExpiryValidationResult']>,
     *   cvvValidation: ReturnType<CreditCardInput['getCvvValidationResult']>,
     *   cardData: ReturnType<CreditCardInput['getCardData']>,
     *   expiryData: ReturnType<CreditCardInput['getExpiryData']>,
     *   cvvData: ReturnType<CreditCardInput['getCvvData']>
     * }}
     */
    getState(): {
        cardStatus: Status;
        expiryStatus: Status;
        cvvStatus: Status;
        cardType: string;
        isAmex: boolean;
        allValid: boolean;
        cardValidation: ReturnType<CreditCardInput["getCardValidationResult"]>;
        expiryValidation: ReturnType<CreditCardInput["getExpiryValidationResult"]>;
        cvvValidation: ReturnType<CreditCardInput["getCvvValidationResult"]>;
        cardData: ReturnType<CreditCardInput["getCardData"]>;
        expiryData: ReturnType<CreditCardInput["getExpiryData"]>;
        cvvData: ReturnType<CreditCardInput["getCvvData"]>;
    };
    /**
     * Destroy the instance: remove all DOM event listeners and clean up internal state.
     * Call this when the component is no longer needed (e.g., in SPA page unload).
     */
    destroy(): void;
    #private;
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
 * Formats an expiry date input field to MM / YY.
 * - Only digits are allowed, maximum 4 digits.
 * - Prevents entering "00" as month by collapsing multiple leading zeros into one.
 * - If the entered month is greater than 12, it prepends a zero (e.g., "14" -> "014" -> "01 / 4").
 * - Handles cursor position correctly, especially after auto-correction.
 *
 * @param {HTMLInputElement} input - The input element to format.
 * @param {string} [dateSeparator=' / '] - Separator between month and year.
 */
export function formatExpiry(input: HTMLInputElement, dateSeparator?: string): void;
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
/**
 * @template {string | symbol | Record<string|symbol, any[]>} [Events=string]
 */
declare class EventEmitterLite<Events extends string | symbol | Record<string | symbol, any[]> = string> {
    /**
     * @type {Object.<Events extends string | symbol ? Events : keyof Events, Function[]>}
     */
    events: any;
    /**
     * logErrors indicates whether errors thrown by listeners should be logged to the console.
     * @type {boolean}
     */
    logErrors: boolean;
    /**
     * on is used to add a callback function that's going to be executed when the event is triggered
     * @template {Events extends string | symbol ? Events : keyof Events} K
     * @param {K} event
     * @param {Function} listener
     * @returns {() => void}
     */
    on<K extends Events extends string | symbol ? Events : keyof Events>(event: K, listener: Function): () => void;
    /**
     * Add a one-time listener
     * @template {Events extends string | symbol ? Events : keyof Events} K
     * @param {K} event
     * @param {Function} listener
     * @returns {()=>void}
     */
    once<K extends Events extends string | symbol ? Events : keyof Events>(event: K, listener: Function): () => void;
    /**
     * off is an alias for removeListener
     * @template {Events extends string | symbol ? Events : keyof Events} K
     * @param {K} event
     * @param {Function} listener
     */
    off<K extends Events extends string | symbol ? Events : keyof Events>(event: K, listener: Function): void;
    /**
     * Remove an event listener from an event
     * @template {Events extends string | symbol ? Events : keyof Events} K
     * @param {K} event
     * @param {Function} listener
     */
    removeListener<K extends Events extends string | symbol ? Events : keyof Events>(event: K, listener: Function): void;
    /**
     * emit is used to trigger an event
     * @template {Events extends string | symbol ? Events : keyof Events} K
     * @param {K} event
     * @param {...any} args
     */
    emit<K extends Events extends string | symbol ? Events : keyof Events>(event: K, ...args: any[]): void;
}
export {};
