import i18n from 'i18n-js';
import { round } from 'lodash';
import { dateInput } from './utils';

const weekDays = new Array(7)
  .fill(null)
  .map((v, i) => i18n.strftime(new Date(2024, 0, i + 1), '%A'));
export const getMonthName = (month: number) => i18n.strftime(new Date(2020, month, 1), '%B');
export const getWeekName = (index: number) => weekDays[index];

export const formatDate = (
  date: Date | firebase.firestore.FieldValue,
  pattern: 'default' | 'monthYear' = 'default'
) => (date ? i18n.l(`date.formats.${pattern}`, dateInput(date)) : undefined);

export const formatTime = (
  date: Date | firebase.firestore.FieldValue,
  pattern: 'default' | 'raw' = 'default'
) => (date ? i18n.l(`time.formats.${pattern}`, dateInput(date)) : undefined);

export const formatDuration = (duration: number) => {
  return `${round(duration / 60, 0)} min`;
};

export const formatHour = (value: string | undefined) => {
  let formatedNumber = '';
  if (value) {
    let hours = value.slice(0, 2);
    let minutes = value.slice(2, 4);
    if (parseInt(hours, 10) > 23) {
      hours = '00';
    }
    if (parseInt(minutes, 10) > 59) {
      minutes = '00';
    }
    if (minutes === '') {
      formatedNumber = `${hours}`;
    } else if (minutes !== '') {
      formatedNumber = `${hours}:${minutes}`;
    }
  }
  return formatedNumber;
};
