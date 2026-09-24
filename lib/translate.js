import en from "@/messages/en.json";
import hi from "@/messages/hi.json";
import as from "@/messages/as.json";
import bn from "@/messages/bn.json";
import brx from "@/messages/brx.json";
import lus from "@/messages/lus.json";
import mni from "@/messages/mni.json";

const translations = {
  en,
  hi,
  as,
  bn,
  brx,
  lus,
  mni,
};

function getNestedValue(object, key) {
  return key.split(".").reduce((current, part) => {
    return current?.[part];
  }, object);
}

export function translate(language, key) {
  const selectedLanguage = translations[language] ? language : "en";

  const translatedValue = getNestedValue(
    translations[selectedLanguage],
    key
  );

  if (translatedValue !== undefined) {
    return translatedValue;
  }

  const englishValue = getNestedValue(translations.en, key);

  if (englishValue !== undefined) {
    return englishValue;
  }

  return key;
}