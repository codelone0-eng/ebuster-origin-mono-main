import { ru as ruHeader } from './ru/header';
import { eng as engHeader } from './eng/header';
import { ru as ruIndex } from './ru/index';
import { eng as engIndex } from './eng/index';
import { ru as ruFaq } from './ru/faq';
import { eng as engFaq } from './eng/faq';
import { ru as ruRegister } from './ru/register';
import { eng as engRegister } from './eng/register';
import { ru as ruLogin } from './ru/login';
import { eng as engLogin } from './eng/login';
import { ru as ruAdvantages } from './ru/advantages';
import { eng as engAdvantages } from './eng/advantages';
import { ru as ruDocumentation } from './ru/documentation';
import { eng as engDocumentation } from './eng/documentation';
import { ru as ruContacts } from './ru/contacts';
import { eng as engContacts } from './eng/contacts';
import { ru as ruApiDocs } from './ru/api-docs';
import { eng as engApiDocs } from './eng/api-docs';
import { ru as ruPricing } from './ru/pricing';
import { eng as engPricing } from './eng/pricing';
import { ru as ruNotifications } from './ru/notifications';
import { eng as engNotifications } from './eng/notifications';

export type Language = 'ru' | 'eng';

export const translations = {
  ru: {
    header: ruHeader,
    index: ruIndex,
    faq: ruFaq,
    register: ruRegister,
    login: ruLogin,
    advantages: ruAdvantages,
    documentation: ruDocumentation,
    contacts: ruContacts,
    'api-docs': ruApiDocs,
    pricing: ruPricing,
    notifications: ruNotifications
  },
  eng: {
    header: engHeader,
    index: engIndex,
    faq: engFaq,
    register: engRegister,
    login: engLogin,
    advantages: engAdvantages,
    documentation: engDocumentation,
    contacts: engContacts,
    'api-docs': engApiDocs,
    pricing: engPricing,
    notifications: engNotifications
  }
};

export const getTranslation = (lang: Language, key: string): any => {
  const keys = key.split('.');
  let result: any = translations[lang];
  
  for (const k of keys) {
    result = result?.[k];
  }
  
  return result || key;
};
