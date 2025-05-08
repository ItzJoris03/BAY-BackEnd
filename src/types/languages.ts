export type Language = "en" | "nl" | "sv"
export const SUPPORTED_LANGUAGES = ['nl', 'en', 'sv'];

const CODE_LANG = {
    nl: 'nl',
    com: 'en',
    en: 'en',
    se: 'sv'
}

export const translateCodeToLang = (code: string): Language => {
    return (CODE_LANG[Object.keys(CODE_LANG).filter((key) => key === code)[0] as keyof typeof CODE_LANG] || 'en') as Language;
}