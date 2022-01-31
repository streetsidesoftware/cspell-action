"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseLocale = exports.lookupLocaleInfo = exports.isStandardLocale = exports.normalizeLocale = exports.Locale = void 0;
const knownLocales_1 = require("./knownLocales");
let codesByLocale;
class Locale {
    constructor(locale) {
        this._raw = locale;
        this._locale = normalizeLocale(locale);
    }
    get locale() {
        return this._locale;
    }
    localInfo() {
        return lookupLocaleInfo(this._locale);
    }
    isValid() {
        return isStandardLocale(this._locale);
    }
    toJSON() {
        return this.locale;
    }
    toString() {
        return this.locale;
    }
}
exports.Locale = Locale;
const regExTwoLetter = /^[a-z]{2}$/i;
const regExLocaleWithCountry = /^([a-z]{2})[_-]?([a-z]{2,3})$/i;
const regExValidLocale = /^([a-z]{2})(?:-([A-Z]{2,3}))?$/;
/**
 * Attempt to normalize a locale.
 * @param locale a locale string
 */
function normalizeLocale(locale) {
    locale = locale.trim();
    if (regExTwoLetter.test(locale))
        return locale.toLowerCase();
    const m = locale.match(regExLocaleWithCountry);
    // give up if we cannot parse it.
    if (!m)
        return locale;
    const lang = m[1].toLowerCase();
    const variant = m[2].toUpperCase();
    return `${lang}-${variant}`;
}
exports.normalizeLocale = normalizeLocale;
function isStandardLocale(locale) {
    return regExValidLocale.test(locale);
}
exports.isStandardLocale = isStandardLocale;
function lookupLocaleInfo(locale) {
    codesByLocale = codesByLocale || buildLocaleLookup();
    return codesByLocale.get(locale);
}
exports.lookupLocaleInfo = lookupLocaleInfo;
function buildLocaleLookup() {
    const info = knownLocales_1.codes.map(([locale, language, country]) => ({ locale, language, country }));
    return new Map(info.map((i) => [i.locale, i]));
}
function createLocale(locale) {
    return new Locale(locale);
}
function parseLocale(locales) {
    locales = typeof locales === 'string' ? locales.split(',') : locales;
    return locales.map(createLocale);
}
exports.parseLocale = parseLocale;
//# sourceMappingURL=locale.js.map