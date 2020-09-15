import * as Localization from 'expo-localization';
import i18n from 'i18n-js';

const pt = {
  number: {
    currency: {
      format: {
        delimiter: '.',
        format: '%u %n',
        precision: 2,
        separator: ',',
        unit: 'R$',
        strip_insignificant_zeros: false,
      },
    },
  },
  date: {
    formats: {
      default: '%d/%m/%Y',
      short: '%d de %B',
      long: '%d de %B de %Y',
      short_with_placeholders: '%d de %B {{p1}} {{p2}}',
    },
    day_names: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    abbr_day_names: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    month_names: [
      null,
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ],
    abbr_month_names: [
      null,
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ],
  },
};

// const en = {
//   'Endereço de retirada': 'Source address',
//   'Endereço com número': 'Address with number',
//   'Pronto': 'Done',
// };

i18n.translations = { pt };
i18n.defaultLocale = 'pt';
i18n.fallbacks = false;
i18n.missingTranslation = () => null; // removes missing translation message

export const translations = ['pt']; // Object.keys(i18n.translations);
const deviceLocale = Localization.locale.substr(0, 2); // to strip out country codes (pt-BR -> pt)
const isDeviceLocaleSupported = translations.indexOf(deviceLocale) > -1;

i18n.locale = isDeviceLocaleSupported ? deviceLocale : i18n.defaultLocale;

export const t = (string: string) => i18n.t(string) || string;
