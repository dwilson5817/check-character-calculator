/*!
 *   Check Character Calculator - Find check character of a location
 *   Copyright (C) 2020 Dylan Wilson
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

// An array of the phonetic representations of the letters of the alphabet from A to Z.
const letters = ["ALPHA", "BRAVO", "CHARLIE", "DELTA", "ECHO", "FOXTROT", "GOLF", "HOTEL", "INDIA", "JULIET",
    "KILO", "LIMA", "MIKE", "NOVEMBER", "OSCAR", "PAPA", "QUEBEC", "ROMEO", "SIERRA", "TANGO", "UNIFORM", "VICTOR",
    "WHISKEY", "X-RAY", "YANKEE", "ZULU"];

// An array of the phonetic representations of each number from 0 to 9.
const numbers = ["ZERO", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE"];

// Constants to refer to the page components for each access.
const locationDiv = $('#location');
const phoneticDiv = $("#phonetic");
const checkDiv = $("#check");

// When the user types into the location input, we filter what they have typed to only allow certain characters.
locationDiv.on('input', function () {
    $(this).val( filterLocation( $(this).val() ) );
});

// Trigger the input event now to filter any data in the input on the page load
locationDiv.trigger('input');

// This function takes an input and removes characters which are not allowed (allowing only alphanumeric characters or
// a + or - if it is in the 4th position).
function filterLocation(input) {
    let filtered = "";

    // Loop through each character and check;
    // - The character is alphanumeric (a-z, A-Z, 0-9) except where it is the 4th character where a plus (+) or minus
    //   (-) is also acceptable.
    // - There are no more than 4 characters
    // Characters which are no allow will be removed, giving the illusion they cannot be typed.
    for (let i = 0; i < input.length && i < 4; i++) {
        if (input.charAt(i).match(/^[0-9A-Za-z]+$/) || (i === 3 && input.charAt(i).match(/^[+-]+$/)))
            filtered += input.charAt(i);
    }

    // Check if the typed location is a special location (one with additional processing required), if so the
    // handleSpecialLocation will process it and return true (indicating no further processing is required), otherwise
    // we process the input now by getting the phonetic and check character.
    if (! handleSpecialLocation(filtered.toUpperCase())) {
        phoneticDiv.text(filtered.length === 0 ? "NONE" : getPhonetic(filtered.toUpperCase()));
        checkDiv.text(getCheck(filtered.toUpperCase()));
    }

    return filtered;
}

// Converts a given characters to it's phonetic representation
function convertToWord(character) {
    // Take the first letter from the input, although this should have only one character anyway
    character = character.substr(0, 1);

    // If the character is number, get it's value from the array
    if (! isNaN(character)) {
        return numbers[character];
    }

    // The character is not a number so it must be numeric, the letter will be in uppercase and A is character 65 in
    // ASCII hence we take 65 off the character code to find it's position in the array
    return letters[character.toUpperCase().charCodeAt(0) - 65];
}

// Gets the phonetic for a given location
function getPhonetic(location) {
    let result = "";

    // Loop through each letter in the location, adding it's phonetic representation to the result string
    for (let i = 0; i < location.length; i++) {
        if (location.substr(i, i + 1) !== '+' && location.substr(i, i + 1) !== '+')
            result += convertToWord(location.substr(i, i + 1).toUpperCase());

        // If this isn't the last letter in the location, we add a space to the string
        if (i !== location.length - 1)
            result += " ";
    }

    return result;
}

// Get the check character for a given location
function getCheck(location) {
    // We can't calculate a check character for locations that do not have 4 characters
    if (location.length !== 4) return "NONE";

    // A value to store the sum the characters in the location after they have passed through algorithm just below
    let i = 0;

    // Each check character is 3 after the previous so AAAA will be alpha, AAAB will be delta and so on.  To calculate
    // this we loop through each character and multiply it's character code by a prime number, this loop will multiply
    // pos 3 by 7, pos 4 by 3, pos 1 by 5 and finally pos 2 by 7 again.
    for (let j = 2; j < 6; j++)
        i += location.charCodeAt(j % 4) * (j % 3 * 2 + 3);

    // Modulus 26 gives us the position of the check in the alphabet so we simply add 65 to find what character it is
    // the ASCII table and then convert this to a phonetic (i.e. A becomes ALPHA)
    return convertToWord(String.fromCharCode((i % 26) + 65));
}

// Check if the given location is a special location.  By special location we mean one which requires additional
// processing.  If the given location is a special location it's phonetic and check is updated here and the function
// returns true indicating no further processing is required.
function handleSpecialLocation(location) {
    // If the location ends in a plus or a minus, we need to apply additional processing
    if (location.substr(-1) === "+" || location.substr(-1) === "-") {
        // The prefix is either "AFTER" or "BEFORE" depending on if it ends in a plus or a minus
        let prefix;

        // Calculate the prefix, "AFTER" for a + and "BEFORE" for a -
        switch (location.substr(-1)) {
            case '+':
                prefix = "AFTER ";
                break;
            case '-':
                prefix = "BEFORE ";
                break;
        }

        // An after or before location can still have some special processing remaining (i.e. S1A+ or Z1A-) so we check
        // if the remaining characters are a special location
        if (handleSpecialLocation(location.substr(0, location.length - 1)))
            // The remaining characters ARE a special location, the phonetic will contain the phonetic for the 3
            // characters we passed so we simply add the prefix onto the front now
            phoneticDiv.text(prefix + phoneticDiv.text())
        else
            // Not a special location, we add the prefix then get the phonetic for the other letters
            phoneticDiv.text(prefix + getPhonetic(location.substr(0, location.length - 1)));

        // Get the check character
        checkDiv.text(getCheck(location));

        // Return true as this was a special location to prevent any more processing
        return true;
    }

    // Sales opportunity basket
    if (location === "SOB") {
        phoneticDiv.text("SOB");
        checkDiv.text("SIERRA");
        return true;
    }

    // Delivery pick area
    if (location === "DPA") {
        phoneticDiv.text("DPA");
        checkDiv.text("VICTOR");
        return true;
    }

    // Returns
    if (location === "RETS") {
        phoneticDiv.text("RETURNS");
        checkDiv.text(getCheck(location));
        return true;
    }

    // Cash office locations
    if (location.substr(0, 2) === "CA") {
        phoneticDiv.text($.trim("CASH OFFICE " + getPhonetic(location.substr(2, 4))));
        checkDiv.text(getCheck(location));
        return true;
    }

    // Collections point locations
    if (location.substr(0, 2) === "CP") {
        phoneticDiv.text($.trim("COLLECTION POINT " + getPhonetic(location.substr(2, 4))));
        checkDiv.text(getCheck(location));
        return true;
    }

    // Jewelery locations
    if (location.substr(0, 1) === "J") {
        phoneticDiv.text($.trim("JEWELLERY " + getPhonetic(location.substr(1, 4))));
        checkDiv.text(getCheck(location));
        return true;
    }

    // Security locations
    if (location.substr(0, 1) === "S") {
        phoneticDiv.text($.trim("SECURITY " + getPhonetic(location.substr(1, 4))));
        checkDiv.text(getCheck(location));
        return true;
    }

    // Linbin locations
    if (location.substr(0, 1) === "L") {
        phoneticDiv.text($.trim(getPhonetic(location.substr(1, 2)) + " LINBIN " +
            getPhonetic(location.substr(3, 4))));
        checkDiv.text(getCheck(location));
        return true;
    }

    // Bulk locations
    if (location.substr(0, 1) === "Z") {
        phoneticDiv.text($.trim(getPhonetic(location.substr(1, 2)) + " BULK " +
            getPhonetic(location.substr(3, 4)).trim()));
        checkDiv.text(getCheck(location));
        return true;
    }
}
