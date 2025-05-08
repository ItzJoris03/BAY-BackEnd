import mongoose from "mongoose";
import { ImageSchema, RecommendationsSchema, TranslatedArraySchema, TranslatedTextSchema } from "./Common";

const EssentialOilSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: TranslatedTextSchema, required: true },
    scientificName: { type: String, required: true },
    img: { type: ImageSchema, required: true },
    description: { type: TranslatedTextSchema, required: true },
    isPremium: { type: Boolean, default: false },
    character: { type: TranslatedTextSchema, required: true },
    applications: { type: TranslatedTextSchema, required: true },
    constituents: { type: TranslatedArraySchema, required: true },
    properties: { type: TranslatedArraySchema, required: true },
    healthBenefits: { type: TranslatedArraySchema, required: true },
    dosage: { type: TranslatedArraySchema, required: true },
    safety: { type: TranslatedArraySchema, required: true },
    sustainability: { type: TranslatedTextSchema, required: true },
    recommendations: { type: RecommendationsSchema, default: {} }
});

export default mongoose.model("EssentialOil", EssentialOilSchema);