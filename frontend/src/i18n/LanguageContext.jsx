import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { STRINGS } from "./strings";
import { fetchContent } from "../api";
import { getMenuItems, getMenuFilters } from "../data/menu";
import { getFaqItems } from "../data/faq";
import { getTimeline } from "../data/history";
import { getProcessSteps } from "../data/process";
import { getGalleryTiles } from "../data/gallery";

const LanguageContext = createContext(null);
const STORAGE_KEY = "fhf-lang";
const SUPPORTED = ["en", "es"];

// Bundled defaults — used the instant the app loads (before the backend
// content fetch resolves) and as a fallback if the backend is unreachable,
// so the public site never shows blank sections.
const FALLBACK_LISTS = {
  menu_items: { en: getMenuItems("en"), es: getMenuItems("es") },
  menu_filters: { en: getMenuFilters("en"), es: getMenuFilters("es") },
  faq_items: { en: getFaqItems("en"), es: getFaqItems("es") },
  history_timeline: { en: getTimeline("en"), es: getTimeline("es") },
  process_steps: { en: getProcessSteps("en"), es: getProcessSteps("es") },
  gallery_tiles: { en: getGalleryTiles("en"), es: getGalleryTiles("es") },
};

const FALLBACK_SETTINGS = {
  businessName: "Forest Haven Farm",
  tagline: "Real Sourdough Bread",
  address: "412 Millbrook Hollow Rd",
  cityStateZip: "Sylvan Ridge, VT 05450",
  phone: "(802) 555-0142",
  phoneHref: "+18025550142",
  email: "hello@foresthavenfarm.com",
  hoursShort: "Fri & Sat, 9am – 1pm",
  instagramUrl: "https://www.instagram.com/foresthavenfarm/",
  facebookUrl: "",
  twitterUrl: "",
};

function detectInitialLang() {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED.includes(stored)) return stored;
  const browserLang = (navigator.language || "en").slice(0, 2);
  return SUPPORTED.includes(browserLang) ? browserLang : "en";
}

// Reads a dotted path like "nav.home" out of a nested strings object.
function resolve(obj, path) {
  return path.split(".").reduce((node, key) => (node == null ? node : node[key]), obj);
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(detectInitialLang);
  const [content, setContent] = useState(null);
  const [contentReady, setContentReady] = useState(false);

  const refreshContent = useCallback(() => {
    return fetchContent()
      .then((data) => {
        setContent(data);
        setContentReady(true);
      })
      .catch(() => {
        // Backend unreachable — the static fallbacks above keep the site usable.
        setContentReady(true);
      });
  }, []);

  useEffect(() => {
    refreshContent();
  }, [refreshContent]);

  useEffect(() => {
    document.documentElement.lang = lang;
    window.localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  const setLang = (next) => {
    if (SUPPORTED.includes(next)) setLangState(next);
  };

  const value = useMemo(() => {
    const stringsForLang = content?.strings?.[lang] ?? STRINGS[lang];
    const t = (path) => resolve(stringsForLang, path) ?? resolve(STRINGS.en, path) ?? path;
    const getList = (key) => content?.[key]?.[lang] ?? FALLBACK_LISTS[key]?.[lang] ?? [];
    const settings = content?.settings ?? FALLBACK_SETTINGS;
    return { lang, setLang, t, getList, settings, content, contentReady, refreshContent };
  }, [lang, content, contentReady, refreshContent]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
