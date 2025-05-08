import Plant from "../models/Plant";
import { Language } from "../types/languages";

const LEFT_KEYS = [
    "facts",
    "character",
    "applications",
    "dryness",
    "suitableForSkinTypes",
    "storageAndShelfLife",
];

const RIGHT_KEYS = [
    "article",
    "recommendations",
    "anecdote",
    "constituents",
    "properties",
    "healthBenefits",
    "dosage",
    "safety",
    "sustainability",
    "keyConstituents",
    "fattyAcidProfile",
    "skinBenefits",
    "ecologicalFootprint",
    "oilCombinations",
];

const QUOTE_KEYS = ["anecdote", "sustainability"];

function isTranslatedTextSchema(obj: any): boolean {
    if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
        return false;
    }

    const keys = Object.keys(obj);
    return keys.length > 0 && keys.every((key) =>
        /^[a-z]{2,3}$/i.test(key) &&
        (typeof obj[key] === "string" || Array.isArray(obj[key]))
    );
}

function getTranslated(field: any, language: string): string | string[] {
    // If the field is a string, return it directly
    if (typeof field === "string") return field;

    // If the field is an array, map over it and recursively translate each item
    if (Array.isArray(field)) {
        return field.flatMap((item) => (typeof item === "string" ? item : getTranslated(item, language)));
    }

    // If the field is an object, return the translation based on the language key
    if (typeof field === "object") {
        return (
            field[language] ||
            field["nl"] || // fallback to nl if the language is not found
            ""
        );
    }

    // Default return empty string if none of the above conditions are met
    return "";
}

function transformFacts(factsObj: Record<string, any>, language: string): { label: string; value: string }[] {
    return Object.entries(factsObj).map(([label, value]) => {
        const translatedValue = getTranslated(value, language);

        // Ensure that translatedValue is a string
        const finalValue = Array.isArray(translatedValue)
            ? translatedValue[0] // pick the first item of the array
            : translatedValue;    // if it's already a string, use it directly

        // Type assertion to ensure finalValue is a string
        return {
            label,
            value: finalValue as string, // Assert that finalValue is a string
        };
    });
}


function flattenNestedObject(obj: Record<string, any>, language: string): Record<string, any> {
    const flat: Record<string, any> = {};
    for (const [key, val] of Object.entries(obj)) {
        if (key === "buffer" || key === "__v") {
            continue; // Ignore fields like "buffer" and "__v"
        }
        flat[key] = Array.isArray(val)
            ? val.map((item) => getTranslated(item, language))
            : getTranslated(val, language);
    }
    return flat;
}

export function transformItem(plant: any, language: string): any {
    const {
        id,
        name,
        scientificName,
        img,
        description,
        isPremium,
        // keyConstituents,
        ...rest
    } = plant.toObject();

    const transformed: any = {
        id,
        name: getTranslated(name, language),
        scientificName,
        img,
        description: getTranslated(description, language),
        isPremium,
    };

    const leftData: Record<string, any> = {};
    const rightData: Record<string, any> = {};

    for (const [key, value] of Object.entries(rest)) {
        if (key === "buffer" || key === "__v") {
            continue; // Ignore buffer and __v fields
        }

        if (QUOTE_KEYS.includes(key)) {
            rightData[key] = {
                text: getTranslated(value, language),
                isQuote: true,
            };
        } else if (key === "facts") {
            leftData[key] = transformFacts(value as Record<string, any>, language);
        } else if (LEFT_KEYS.includes(key)) {
            leftData[key] = Array.isArray(value)
                ? value.map((item) => getTranslated(item, language))
                : getTranslated(value, language);
        } else if (RIGHT_KEYS.includes(key)) {
            if (isTranslatedTextSchema(value)) {
                rightData[key] = getTranslated(value, language);
            } else if (typeof value === "object" && !Array.isArray(value)) {
                Object.assign(rightData, flattenNestedObject(value as Record<string, any>, language));
            } else {
                rightData[key] = Array.isArray(value)
                    ? value.map((item) => getTranslated(item, language))
                    : getTranslated(value, language);
            }
        } else {
            if (isTranslatedTextSchema(value)) {
                rightData[key] = getTranslated(value, language);
            } else if (typeof value === "object" && !Array.isArray(value)) {
                Object.assign(rightData, flattenNestedObject(value as Record<string, any>, language));
            } else {
                leftData[key] = Array.isArray(value)
                    ? value.map((item) => getTranslated(item, language))
                    : getTranslated(value, language);
            }
        }
    }

    transformed.data = [leftData, rightData];
    return transformed;
}

// const DEFAULT_IGNORED = [
//     '__v',
//     '_doc',
//     'db',
//     'collection',
// ];

// function shouldIgnoreKey(key: string): boolean {
//     return key.startsWith('$') || DEFAULT_IGNORED.includes(key);
// }

// function processValue(value: any, language: Language): any {
//     if (typeof value === 'string') {
//         return value; // Directly return string values
//     } else if (Array.isArray(value)) {
//         return value.filter((item: any) => typeof item === 'string'); // Filter string arrays
//     } else if (typeof value === 'object' && value !== null) {
//         // Handle nested objects
//         const nestedResult: { [nestedKey: string]: string | string[] } = {};
//         for (const nestedKey in value) {
//             if (shouldIgnoreKey(nestedKey)) {
//                 continue; // Skip ignored attributes
//             }

//             const langValue = value[nestedKey];
//             if (langValue && typeof langValue === 'object' && langValue !== null) {
//                 // Check if the language property exists
//                 const languageValue = langValue[language];
//                 if (typeof languageValue === 'string') {
//                     nestedResult[nestedKey] = languageValue; // Assign the string for the specified language
//                 } else if (Array.isArray(languageValue)) {
//                     nestedResult[nestedKey] = languageValue.filter((item: any) => typeof item === 'string'); // Filter string arrays
//                 } else {
//                     // If the language property doesn't exist, you can choose to handle it here
//                     // For example, you could assign the entire object or skip it
//                     nestedResult[nestedKey] = null as any; // or continue; to skip
//                 }
//             } else {
//                 // If langValue is not an object, just assign it directly
//                 nestedResult[nestedKey] = langValue;
//             }
//         }
//         return nestedResult; // Return the filtered nested object
//     }
//     return null; // Return null for unsupported types
// }

// export function convertData<T extends Record<string, any>>(
//     input: T,
//     language: Language,
//     ignoreAttributes: string[] = [],
// ): Partial<T> {
//     const result: Partial<T> = {};

//     for (const key in input) {
//         if (ignoreAttributes.includes(key) || shouldIgnoreKey(key)) {
//             continue; // Skip ignored attributes and MongoDB-related properties
//         }

//         const value = input[key];
//         result[key] = processValue(value, language); // Process the value
//     }

//     return result;
// }