import { Language, SUPPORTED_LANGUAGES } from "../types/languages";

export const extractValues = (obj: any, lang: Language) => {
    let json: any = null;

    if (obj instanceof Buffer) return null;

    for (const key in obj) {
        if (obj[key] instanceof Buffer || ['_id', '__v'].includes(key)) continue;
        if (typeof obj[key] == 'object') {
            // console.log(key);
            for (const subkey in obj[key]) {
                // console.log(`${key}: ${subkey}`)
                if (SUPPORTED_LANGUAGES.includes(subkey)) {
                    if (typeof obj[key][lang] == 'string' || (Array.isArray(obj[key][lang]) && obj[key][lang].length != 0)) {
                        if (!json) json = {};
                        json[key] = obj[key][lang];
                    }
                    break;
                } else {
                    const res = extractValues(obj[key], lang);
                    if (res && Object.keys(res).length > 0) {
                        if (!json) json = {};
                        json[key] = res;
                    }
                }
            }
        }
    }

    return json;
};

export const assignTranslatedValues = (obj: any, lang: Language) => {
    const json: any = {};
    for (const key in obj) {
        // console.log(key);
        if (typeof obj[key] == 'object' && obj[key] !== null) {
            // If the key exists in the original object and is an object, we need to recurse
            if (Array.isArray(obj[key])) {
                json[key] = {};
                json[key][lang] = obj[key];
            } else {
                const res = assignTranslatedValues(obj[key], lang);
                if (res && Object.keys(res).length > 0) {
                    json[key] = res;
                }
            }
        } else {
            json[key] = json[key] || {};
            json[key][lang] = obj[key];
        }
    }
    return json;
};

export const mergeObject = (obj: any, mergeObj: any) => {
    for (const key in mergeObj) {
        if (typeof mergeObj[key] == 'object' && mergeObj[key] !== null) {
            // If the key exists in the original object and is an object, we need to recurse
            if (Array.isArray(mergeObj[key])) {
                obj[key] = mergeObj[key]
            } else mergeObject(obj[key], mergeObj[key]);
        } else {
            obj[key] = mergeObj[key];
        }
    }
};