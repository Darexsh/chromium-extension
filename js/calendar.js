let stateCode = 'by';
const holidayCache = new Map();
let lastRenderId = 0;

function createDayElement(day, className, holidayName) {
  const dayElement = document.createElement('div');
  dayElement.textContent = day;
  dayElement.classList.add('calendar-day');
  if (className) dayElement.classList.add(className);
  if (holidayName) {
    dayElement.classList.add('has-holiday');
    dayElement.setAttribute('data-holiday', holidayName);
  }
  document.getElementById('calendarBody').appendChild(dayElement);
}

function isHoliday(date, holidayMap) {
  if (holidayMap) {
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return holidayMap.has(dateKey);
  }

  const holidays = [
    [0, 1],  // Neujahr
    [0, 6],  // Heilige Drei Könige
    [4, 1],  // Tag der Arbeit
    [9, 3],  // Tag der Deutschen Einheit
    [10, 1], // Allerheiligen
    [11, 24], // Heiligabend
    [11, 25], // 1. Weihnachtsfeiertag
    [11, 26], // 2. Weihnachtsfeiertag
    [11, 31]  // Silvester
  ];

  const easterDate = calculateEasterDate(date.getFullYear());
  const movableHolidays = [
    new Date(easterDate.getTime() - 2 * 86400000), // Karfreitag
    new Date(easterDate.getTime() + 1 * 86400000), // Ostermontag
    new Date(easterDate.getTime() + 39 * 86400000), // Christi Himmelfahrt
    new Date(easterDate.getTime() + 49 * 86400000), // Pfingstmontag
    new Date(easterDate.getTime() + 60 * 86400000)  // Fronleichnam
  ];

  return holidays.some(([m, d]) => m === date.getMonth() && d === date.getDate()) ||
         movableHolidays.some(holiday => holiday.toDateString() === date.toDateString());
}

function calculateEasterDate(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const n = Math.floor((h + l - 7 * m + 114) / 31);
  const p = (h + l - 7 * m + 114) % 31;
  return new Date(year, n - 1, p + 1);
}

export function setStateCode(code) {
  const next = (code || '').trim().toLowerCase();
  stateCode = next || 'by';
  holidayCache.clear();
}

async function fetchHolidayMap(year) {
  const key = `${year}:${stateCode}`;
  if (holidayCache.has(key)) return holidayCache.get(key);

  try {
    const response = await fetch(`https://get.api-feiertage.de?years=${year}&states=${stateCode}`);
    if (!response.ok) {
      throw new Error(`Holiday API error: ${response.status}`);
    }
    const data = await response.json();
    if (!data || !Array.isArray(data.feiertage)) {
      return null;
    }
    const map = new Map();
    data.feiertage.forEach((holiday) => {
      if (holiday.date) {
        map.set(holiday.date, holiday.fname || 'Feiertag');
      }
    });
    holidayCache.set(key, map);
    return map;
  } catch (error) {
    console.warn('Failed to load holidays from api-feiertage.de', error);
    return null;
  }
}

export async function createCalendar(year, month) {
  const renderId = ++lastRenderId;
  const holidayMap = await fetchHolidayMap(year);
  if (renderId !== lastRenderId) return;
  const monthNames = [
    chrome.i18n.getMessage("jan"),
    chrome.i18n.getMessage("feb"),
    chrome.i18n.getMessage("mar"),
    chrome.i18n.getMessage("apr"),
    chrome.i18n.getMessage("may"),
    chrome.i18n.getMessage("jun"),
    chrome.i18n.getMessage("jul"),
    chrome.i18n.getMessage("aug"),
    chrome.i18n.getMessage("sep"),
    chrome.i18n.getMessage("oct"),
    chrome.i18n.getMessage("nov"),
    chrome.i18n.getMessage("dec")
  ];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const calendarBody = document.getElementById('calendarBody');
  calendarBody.innerHTML = '';

  document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;

  let startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Montag als erster Tag
  const prevMonthLastDate = new Date(year, month, 0).getDate();

  // Tage des Vormonats
  for (let i = startDay - 1; i >= 0; i--) {
    createDayElement(prevMonthLastDate - i, 'other-month');
  }

  // Tage des aktuellen Monats
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i);
    const isToday = date.toDateString() === new Date().toDateString();
    let holidayName = '';
    if (holidayMap) {
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      holidayName = holidayMap.get(dateKey) || '';
    }
    const isHolidayFlag = Boolean(holidayName) || isHoliday(date, holidayMap);
    const className = isHolidayFlag ? 'holiday' : (isToday ? 'today' : '');
    createDayElement(i, className, holidayName);
  }

  // Tage des Folgemonats (optional, um das Grid zu füllen)
  const totalDays = (startDay + lastDay.getDate()) % 7;
  if (totalDays !== 0) {
    const daysToAdd = 7 - totalDays;
    for (let i = 1; i <= daysToAdd; i++) {
      createDayElement(i, 'other-month');
    }
  }
}
