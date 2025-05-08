import mongoose from "mongoose";

// Reusable translatable text field
export const TranslatedTextSchema = new mongoose.Schema(
    {
        nl: { type: String },
        en: { type: String },
        sv: { type: String }
    },
    {
        _id: false,
        validate: {
            validator: function (value: any) {
                // Check if at least one of the fields is non-empty
                return !!(value.nl || value.en || value.sv);
            },
            message: "At least one translation (nl, en, se) is required."
        }
    }
);


// Reusable translatable array field
export const TranslatedArraySchema = new mongoose.Schema(
    {
        en: { type: [String], default: [] },
        nl: { type: [String], default: [] },
        sv: { type: [String], default: [] }
    },
    { _id: false }
);

// Reusable image schema
export const ImageSchema = new mongoose.Schema(
    {
        src: { type: String, required: true },
        alt: { type: TranslatedTextSchema, required: true }
    },
    { _id: false }
);

export const RecommendationsSchema = new mongoose.Schema(
    {
        related: [{ type: String }]
    },
    { _id: false }
);
