// Utility function to toggle visibility of sections
function toggleSectionVisibility(sectionId) {
  const targetSection = document.getElementById(sectionId);
  targetSection.style.display = targetSection.style.display === "none" ? "block" : "none";
}

// Add event listeners for buttons to toggle sections
['toggleCalendar', 'toggleWeather', 'toggleSpeedtest'].forEach(buttonId => {
  document.getElementById(buttonId).addEventListener('click', function (event) {
    const sectionId = buttonId.replace('toggle', '').toLowerCase() + 'Div';
    toggleSectionVisibility(sectionId);
    event.stopPropagation();
  });
});

// Hide sections when clicking outside
document.addEventListener('click', function (event) {
  ['calendarDiv', 'weatherDiv', 'speedtestDiv'].forEach(sectionId => {
    const container = document.getElementById(sectionId);
    if (container.style.display === 'block' && !container.contains(event.target)) {
      container.style.display = 'none';
    }
  });
});

// Set background image
function setBackground(url) {
  document.querySelector('.background').style.backgroundImage = `url('${url}')`;
}
setBackground('default.png');

// Display current time
setInterval(() => {
  const date = new Date();
  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  document.getElementById("clockDiv").innerHTML = timeString;
});

// Display current date with week number
  setInterval(() => {
  const date = new Date();
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const dateString = date.toLocaleDateString('de-DE', options);
  const currentThursday = new Date(date.getTime() + (3 - ((date.getDay() + 6) % 7)) * 86400000);
  const yearOfThursday = currentThursday.getFullYear();
  const firstThursday = new Date(new Date(yearOfThursday, 0, 4).getTime() + (3 - ((new Date(yearOfThursday, 0, 4).getDay() + 6) % 7)) * 86400000);
  let weekNumber = Math.floor(1 + 0.5 + (currentThursday.getTime() - firstThursday.getTime()) / 86400000 / 7);
  weekNumber = ("0" + weekNumber).slice(-2);
  const dateStringWithWeek = dateString + "<span style='color: grey;'> - KW " + weekNumber + "</span>";
  document.getElementById("dateDiv").innerHTML = dateStringWithWeek;
});

// Weather functionality
const weather = {
  apiKey: "cbfc45f4f8520b8a731ed6fe6b2bc752",
  fetchWeather: function (city) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=de&appid=${this.apiKey}`)
      .then(response => {
        if (!response.ok) {
          throw new Error("Kein Wetter gefunden!");
        }
        return response.json();
      })
      .then(data => this.displayWeather(data))
      .catch(error => alert(error.message));
  },
  displayWeather: function (data) {
    const { name, weather, main, wind } = data;
    document.querySelector('.city').innerText = `Wetter in ${name}`;
    document.querySelector('.icon').src = `https://openweathermap.org/img/wn/${weather[0].icon}.png`;
    document.querySelector('.description').innerText = weather[0].description;
    document.querySelector('.temp').innerText = `${main.temp} °C`;
    document.querySelector('.feels_like').innerText = `Gefühlt: ${main.feels_like} °C`;
    document.querySelector('.humidity').innerText = `- Luftfeuchtigkeit: ${main.humidity}%`;
    document.querySelector('.wind').innerText = `- Windgeschwindigkeit: ${wind.speed} km/h`;
    document.querySelector('.temp_min').innerText = `- Tiefsttemperatur: ${main.temp_min} °C`;
    document.querySelector('.temp_max').innerText = `- Höchsttemperatur: ${main.temp_max} °C`;
    document.querySelector('.weather').classList.remove('loading');
  },
  search: function () {
    this.fetchWeather(document.querySelector('.search-bar').value);
  }
};

// Add event listeners for weather search
document.querySelector('.search button').addEventListener('click', () => weather.search());
document.querySelector('.search-bar').addEventListener('keyup', event => {
  if (event.key === 'Enter') {
    weather.search();
  }
});
weather.fetchWeather('Deggendorf');

// Calendar functionality
document.addEventListener('DOMContentLoaded', function () {
  const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  
  let currentDate = new Date();
  let currentYear = currentDate.getFullYear();
  let currentMonth = currentDate.getMonth();

  function createCalendar(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const calendarBody = document.getElementById('calendarBody');
    calendarBody.innerHTML = '';

    document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;

    let startDay = firstDay.getDay() === 0 ? 7 : firstDay.getDay();
    const prevMonthLastDate = new Date(year, month, 0).getDate();

    for (let i = startDay - 1; i >= 0; i--) {
      createDayElement(prevMonthLastDate - i, 'other-month');
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      createDayElement(i, isHoliday(new Date(year, month, i)) ? 'holiday' : '');
    }
  }

  function createDayElement(day, className) {
    const dayElement = document.createElement('div');
    dayElement.textContent = day;
    dayElement.classList.add('calendar-day');
    if (className) dayElement.classList.add(className);
    document.getElementById('calendarBody').appendChild(dayElement);
  }

  function isHoliday(date) {
    const holidays = [
      [0, 1], [0, 6], [4, 1], [9, 3], [11, 25], [11, 26], [11, 24], [11, 31]
    ];
    
    const easterDate = calculateEasterDate(date.getFullYear());
    const movableHolidays = [
      new Date(easterDate.setDate(easterDate.getDate() + 1)),    // Ostermontag
      new Date(easterDate.setDate(easterDate.getDate() + 49)),   // Pfingstmontag
      new Date(easterDate.setDate(easterDate.getDate() - 52)),   // Karfreitag
      new Date(easterDate.setDate(easterDate.getDate() + 39)),   // Christi Himmelfahrt
      new Date(easterDate.setDate(easterDate.getDate() + 60))    // Fronleichnam
    ];

    return holidays.some(([m, d]) => m === date.getMonth() && d === date.getDate()) ||
           movableHolidays.some(holiday => holiday.getTime() === date.getTime());
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

  document.getElementById('prevMonth').addEventListener('click', function (event) {
    event.stopPropagation();
    currentMonth = (currentMonth === 0) ? (--currentYear, 11) : currentMonth - 1;
    createCalendar(currentYear, currentMonth);
  });

  document.getElementById('nextMonth').addEventListener('click', function (event) {
    event.stopPropagation();
    currentMonth = (currentMonth === 11) ? (++currentYear, 0) : currentMonth + 1;
    createCalendar(currentYear, currentMonth);
  });

  createCalendar(currentYear, currentMonth);
});
