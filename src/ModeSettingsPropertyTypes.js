'use strict';

/**
 * Deserialize uses = none, bool, number, string, list, dictionary
 * Serialize uses = bool, integer, float, string, array, object
 *
 * none = 0
 * boolean = 1
 * number = integer = float = 2
 * string = 3
 * list = array = 4
 * dictionary = object = 5
 */

let types = {
    none: 0,
    boolean: 1,
    number: 2,
    integer: 2,
    float: 2,
    string: 3,
    list: 4,
    array: 4,
    dictionary: 5,
    object: 5
};

exports = module.exports = types;
