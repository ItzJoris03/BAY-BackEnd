// src/routes/contentRoute.ts
import { Router, Request, Response } from "express";
import path from "path";
import fs from "fs/promises";

const router = Router();

type LangCode = "com" | "nl" | "sv";

router.get('/content', async (req: Request, res: Response) => {
    const lang = (req.query.lang as LangCode) || "com";
    const componentsQuery = (req.query.components as string) || "";

    if (!lang || !componentsQuery) {
        res.status(400).json({ error: "Missing 'lang' or 'components' parameter." });
    }

    const components = componentsQuery.split(",").map(c => c.trim());
    const filePath = path.resolve(__dirname, "../../data", `${lang == "com" ? "en" : lang}.content.json`);

    try {
        const raw = await fs.readFile(filePath, "utf-8");
        const parsed = JSON.parse(raw);

        const result: Record<string, any> = {};
        for (const component of components) {
            if (parsed.data?.[component]) {
                result[component] = parsed.data[component];
            }
        }

        res.json({
            config: parsed.config || { lang },
            data: result,
        });
    } catch (err) {
        console.error("Failed to load language content:", err);
        res.status(500).json({ error: "Failed to read content file." });
    }
});

export default router;
