import React, { createContext, useContext } from "react";
import { tr, type Language } from "./mock";

export const LanguageContext = createContext<Language>("English");

export function languageLocale(language: Language) {
  return language === "Spanish" ? "es-ES" : language === "Hindi" ? "hi-IN" : language === "Gujarati" ? "gu-IN" : "en-US";
}

function translatedValue(value: string, language: Language) {
  const trimmed = value.trim();
  if (!trimmed) return value;
  const result = tr(language, trimmed);
  if (result === trimmed) return value;
  const leading = value.match(/^\s*/)?.[0] || "";
  const trailing = value.match(/\s*$/)?.[0] || "";
  return leading + result + trailing;
}

function localizeNode(node: React.ReactNode, language: Language): React.ReactNode {
  if (typeof node === "string") return translatedValue(node, language);
  if (Array.isArray(node)) return node.map((child, index) => <React.Fragment key={index}>{localizeNode(child, language)}</React.Fragment>);
  if (!React.isValidElement<any>(node) || node.props.dangerouslySetInnerHTML) return node;
  const props = { ...node.props };
  for (const attribute of ["aria-label", "aria-description", "title", "placeholder", "alt"]) {
    if (typeof props[attribute] === "string") props[attribute] = translatedValue(props[attribute], language);
  }
  return React.cloneElement(node, props, localizeNode(node.props.children, language));
}

export function TranslateTree({ children }: { children: React.ReactNode }) {
  const language = useContext(LanguageContext);
  return <>{localizeNode(children, language)}</>;
}
