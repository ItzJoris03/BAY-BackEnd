import mongoose from "mongoose";
import { ImageSchema, RecommendationsSchema, TranslatedArraySchema, TranslatedTextSchema } from "./Common";

const BasicOilSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: TranslatedTextSchema, required: true },
    scientificName: { type: String, required: true },
    img: { type: ImageSchema, required: true },
    description: { type: TranslatedTextSchema, required: true },
    isPremium: { type: Boolean, default: false },


    dryness: { type: TranslatedTextSchema, required: true },
    suitableForSkinTypes: { type: TranslatedTextSchema, required: true },
    storageAndShelfLife: { type: TranslatedTextSchema, required: true },
    keyConstituents: { type: TranslatedArraySchema, required: true },
    fattyAcidProfile: { type: TranslatedArraySchema, required: true },
    skinBenefits: { type: TranslatedArraySchema, required: true },
    ecologicalFootprint: { type: TranslatedTextSchema, required: true },
    safety: { type: TranslatedTextSchema, required: true },
    oilCombinations: { type: TranslatedTextSchema, required: true },
    RecommendationsSchema: { type: RecommendationsSchema, default: {} }
});

export default mongoose.model("BasicOil", BasicOilSchema);