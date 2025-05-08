import mongoose from "mongoose";
import { ImageSchema, TranslatedArraySchema, TranslatedTextSchema } from "./Common";

const FactsSchema = new mongoose.Schema(
    {
        usedParts: { type: TranslatedTextSchema, required: true },
        origin: { type: TranslatedTextSchema, required: true },
        growth: { type: TranslatedTextSchema, required: true }
    },
    { _id: false }
);

const ArticleSchema = new mongoose.Schema(
    {
        applications: { type: TranslatedArraySchema, required: true },
        usage: { type: TranslatedArraySchema, required: true },
        contraindications: { type: TranslatedArraySchema, required: true }
    },
    { _id: false }
);

const RecommendationsSchema = new mongoose.Schema(
    {
        related: [{ type: String }],
        recipes: [{ type: String }]
    },
    { _id: false }
);

const PlantSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: TranslatedTextSchema, required: true },
    scientificName: { type: String, required: true },
    img: { type: ImageSchema, required: true },
    description: { type: TranslatedTextSchema, required: true },
    keyConstituents: { type: TranslatedArraySchema, required: true },
    facts: { type: FactsSchema, required: true },
    article: { type: ArticleSchema, required: true },
    anecdote: { type: TranslatedTextSchema, required: true },
    isPremium: { type: Boolean, default: false },
    recommendations: { type: RecommendationsSchema, default: {} }
});

export default mongoose.model("Plant", PlantSchema);
