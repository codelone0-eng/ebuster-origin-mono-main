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
import { ru as ruContacts } from './ru/contacts';
import { eng as engContacts } from './eng/contacts';
import { ru as ruPricing } from './ru/pricing';
import { eng as engPricing } from './eng/pricing';
import { ru as ruNotifications } from './ru/notifications';
import { eng as engNotifications } from './eng/notifications';
import { workflow as ruWorkflow } from './ru/workflow';
import { workflow as engWorkflow } from './eng/workflow';

export type Language = 'ru' | 'eng';

export const translations = {
  ru: {
    header: ruHeader,
    index: ruIndex,
    faq: ruFaq,
    register: ruRegister,
    login: ruLogin,
    advantages: ruAdvantages,
    contacts: ruContacts,
    pricing: ruPricing,
    notifications: ruNotifications,
    workflow: ruWorkflow
  },
  eng: {
    header: engHeader,
    index: engIndex,
    faq: engFaq,
    register: engRegister,
    login: engLogin,
    advantages: engAdvantages,
    contacts: engContacts,
    pricing: engPricing,
    notifications: engNotifications,
    workflow: engWorkflow
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
