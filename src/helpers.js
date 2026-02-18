// @ts-check

/**
 * Detects the type of a credit card based on its number
 * @param {string} digits The credit card number as a string of digits
 * @returns {string} The type of the credit card (e.g. "Visa", "Mastercard", etc.)
 * @example
 * getCardType('4111111111111110') // returns "Visa"
 */
export function getCardType(digits) {
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
export function luhnChecksum(code) {
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
export function luhnValidate(fullcode) {
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
export function isProbablyAmex(digits) {
    return digits.length >= 2 && (digits.startsWith('34') || digits.startsWith('37'));
}