import axios from 'axios';

// Recursively collect all string values and their paths in the JSON
function collectStrings(
    obj: any,
    strings: string[] = [],
    paths: (string | number)[][] = [],
    currentPath: (string | number)[] = []
): { strings: string[]; paths: (string | number)[][] } {
    if (typeof obj === 'string') {
        strings.push(obj);
        paths.push([...currentPath]);
    } else if (Array.isArray(obj)) {
        obj.forEach((item, idx) => {
            collectStrings(item, strings, paths, [...currentPath, idx]);
        });
    } else if (typeof obj === 'object' && obj !== null) {
        Object.entries(obj).forEach(([key, value]) => {
            collectStrings(value, strings, paths, [...currentPath, key]);
        });
    }
    return { strings, paths };
}

// Recursively set translated values back to the JSON object at the same paths
function setTranslatedValues(
    obj: any,
    translatedStrings: string[],
    paths: (string | number)[][]
): void {
    paths.forEach((path, idx) => {
        let current = obj;
        for (let i = 0; i < path.length - 1; i++) {
            current = current[path[i]];
        }
        const lastKey = path[path.length - 1];
        current[lastKey] = translatedStrings[idx];
    });
}

// Function to translate combined text by scraping the Google Translate mobile site
async function translateText(text: string, targetLang = 'en'): Promise<string> {
    const url = 'https://translate.google.com/m'; // mobile version for easier scraping
    try {
        const res = await axios.get(url, {
            params: {
                sl: 'auto',
                tl: targetLang,
                q: text,
            },
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)' +
                    ' Chrome/113.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
            },
        });

        const html = res.data as string;

        // Extract translation from <div class="result-container">...</div>
        // const match = html.match(/<div[^>]*class="result-container"[^>]*>(.*?)<\/div>/s);
        const match = html.match(/<div[^>]*class="result-container"[^>]*>([\s\S]*?)<\/div>/i);

        // console.log(match)
        if (!match) {
            throw new Error('Translation not found in the response');
        }
        // Clean html entities and tags
        let translated = match[1]
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&#39;/g, "'")
            .replace(/&quot;/g, '"')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/?[^>]+(>|$)/g, ''); // remove remaining tags
        translated = translated.trim();

        return translated;
    } catch (err) {
        throw new Error('Error during translation request: ' + (err as Error).message);
    }
}

export async function translateJson(inputJson: any, targetLang: string = 'en'): Promise<any> {
    if (typeof inputJson !== 'object' || inputJson === null) {
        throw new Error('Input JSON must be a non-null object');
    }

    // Deep clone input JSON to avoid mutating original
    const clonedJson = JSON.parse(JSON.stringify(inputJson));

    // Collect strings to translate
    const { strings, paths } = collectStrings(clonedJson);

    if (strings.length === 0) {
        // Nothing to translate, return original clone
        return clonedJson;
    }

    // Combine strings
    const combinedText = strings.join('\n');

    // Perform translation
    const translatedCombined = await translateText(combinedText, targetLang);

    // Split into lines
    const translatedStrings = translatedCombined.split('\n');

    if (translatedStrings.length !== strings.length) {
        console.log(strings)
        console.log(translatedStrings)
        throw new Error('Mismatch in number of translated lines');
    }

    // Set translated strings back
    setTranslatedValues(clonedJson, translatedStrings, paths);

    return clonedJson;
}

export const getTranslatedValue = (field: {
    [key: string]: string | null | undefined
}, lang: string) => {
    return field[lang as keyof typeof field] || field['nl' as keyof typeof field]; // Default to Dutch if the requested language doesn't exist
};