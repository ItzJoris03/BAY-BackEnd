// routes/plants.ts
import { Router } from 'express';
import Plant from '../models/Plant';
import EssentialOil from '../models/EssentialOil';
import BasicOil from '../models/BasicOil';
import { Language, SUPPORTED_LANGUAGES, translateCodeToLang } from '../types/languages';
import { getTranslatedValue, translateJson } from '../utils/translate';
import staticData from '../../data/laTranslations.json';
import mongoose from 'mongoose';
import { transformItem } from '../utils/transform';
import { assignTranslatedValues, extractValues, mergeObject } from '../utils/encyclopedia_helper_functions';

const router = Router();

const modelMap: { [key: string]: mongoose.Model<any> } = {
    'plants': Plant,
    'oils': EssentialOil,
    'basic_oils': BasicOil
};

// Get plants with language-specific data
router.get('/:category', async (req, res) => {
    const { category } = req.params;

    if (!Object.keys(modelMap).includes(category)) {
        res.status(404).json({ message: `Category is invalid: ${Object.keys(modelMap).toString()}` });
        return;
    }

    let language = (req.query.language as string) || 'nl';
    language = translateCodeToLang(language);

    try {
        const Item = modelMap[category as keyof typeof modelMap];
        const items = await Item.find();

        const result = items.map((item) => {
            return {
                id: item.id,
                name: staticData.translations.filter((_item) => {
                    return _item.la.toLowerCase() == item.scientificName.toLowerCase()
                })[0]?.[language as Language] || getTranslatedValue(item.name, language as string),
                scientificName: item.scientificName,
                img: {
                    src: item.img.src,
                    alt: getTranslatedValue(item.img.alt, language as string),
                },
                description: getTranslatedValue(item.description, language as string),
                isPremium: item.isPremium,
            };
        });

        res.json(result);
    } catch (err) {
        console.error(`Error fetching ${category}:`, err);
        res.status(500).json({ error: `Failed to fetch ${category}` });
    }
});

// GET plant by scientific name (id)
router.get('/:category/:id', async (req, res) => {
    const { category, id } = req.params;

    if (!Object.keys(modelMap).includes(category)) {
        res.status(404).json({ message: `Category is invalid: ${Object.keys(modelMap).toString()}` });
        return;
    }

    let language: Language = (req.query.language as Language) || 'nl';

    language = translateCodeToLang(language);

    try {
        const Item = modelMap[category as keyof typeof modelMap];
        const item = await Item.findOne({ scientificName: new RegExp(`^${id}$`, 'i') });

        if (!item) {
            res.status(404).json({ message: `${category} [${id}] is not found` });
        } else {

            const productData = extractValues(item.toObject(), language);

            // If any field is missing for the target language, auto-translate and persist
            if (!productData || true) {
                const getSourceLang = () => {
                    const sample = item.name || item.description;
                    return Object.keys(sample).find((lang) => SUPPORTED_LANGUAGES.includes(lang) && sample[lang as Language]) || 'nl';
                };

                const sourceLang = getSourceLang() as Language;
                const sourceJson = extractValues(item.toObject(), sourceLang);

                console.log(`[Translating]: Translating ${id}...`);
                const translatedJson = await translateJson(sourceJson, language);
                console.log(`[Translating]: Translating done for ${id}`);

                // Assign translated values back to the item object
                const res = assignTranslatedValues(translatedJson, language);

                mergeObject(item, res);

                await item.save();
            }

            const itemData = transformItem(item, language);

            res.status(200).json(itemData);
        }
    } catch (error) {
        console.error(`Error fetching ${category} with translation:`, error);
        res.status(500).json({ message: `Error fetching ${category} data` });
    }
});






function transformData(input: any) {
    const output: any = {
        id: input.id,
        img: {
            src: input.img.src,
            alt: {
                nl: input.img.alt
            }
        },
        name: {
            nl: input.name
        },
        isPremium: input.isPremium,
        scientificName: input.scientificName,
        description: {
            nl: input.description
        }
    };

    // Process the data array
    input.data.map((item: any) => {
        for (const key in item) {
            if (key == 'relatedPlants') {
                output.related = item[key];
            } else if (key == 'facts') {
                output[key] = {
                    usedParts: {
                        nl: item[key].usedParts,
                    },
                    origin: {
                        nl: item[key].origin,
                    },
                    growth: {
                        nl: item[key].growth,
                    },
                }
            } else if (key == 'article') {
                output[key] = {
                    applications: {
                        nl: item[key].usedParts,
                    },
                    usage: {
                        nl: item[key].origin,
                    },
                    contraindications: {
                        nl: item[key].growth,
                    },
                }
            } else {
                output[key] = {
                    nl: item[key]
                }
            }

            if (key == 'sustainability' || key == 'anecdote') {
                output[key] = {
                    nl: item[key].text
                }
            }
        }
    });

    return output;
}

// POST /import
router.post('/import/:category', async (req, res) => {
    const { category } = req.params;
    const items = req.body;

    if (!Array.isArray(items) || items.length === 0) {
        res.status(400).json({ error: 'No data provided.' });
    }

    if (!Object.keys(modelMap).includes(category)) {
        res.status(404).json({ message: `Category is invalid: ${Object.keys(modelMap).toString()}` });
        return;
    }

    // Create a Set to track unique IDs
    const uniqueIds = new Set();

    // Filter out items with non-unique IDs and transform the data
    const formatted = items.filter((_item: any) => {
        if (_item.id && !uniqueIds.has(_item.id)) {
            uniqueIds.add(_item.id); // Add the ID to the Set
            return true; // Keep this item
        }
        return false; // Filter out this item
    }).map((_item: any) => transformData(_item));

    try {
        const Item = modelMap[category as keyof typeof modelMap];
        await Item.deleteMany({});
        const results = await Item.insertMany(formatted, { ordered: false });

        res.status(201).json({ success: true, inserted: results.length });
    } catch (err: any) {
        console.error(err);
        if (err.code === 11000) {
            res.status(409).json({ error: 'Duplicate entries detected.' });
        }
        res.status(500).json({ error: 'Something went wrong.' });
    }
});

export default router;