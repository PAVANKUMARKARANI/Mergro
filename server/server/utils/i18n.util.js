import i18n from '../i18n_en.json';

const getI18nMessage = (key) => {
  return i18n['en'][key];
};

export default {
  getI18nMessage
};