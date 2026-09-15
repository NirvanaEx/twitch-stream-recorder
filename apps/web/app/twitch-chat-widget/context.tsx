import { createContext, useContext } from "react";

export const WidgetContext = createContext({ locale: "ru" as "ru" | "en", spoilerFree: true });
export function useLanguage() { return useContext(WidgetContext); }
export function useSpoiler() { return useContext(WidgetContext); }
