// Toggle Functionality for Displaying/Hiding Sections
function toggleSectionVisibility(sectionId) {
  const targetSection = document.getElementById(sectionId);
  if (targetSection.style.display === "none") {
    targetSection.style.display = "block";
  } else {
    targetSection.style.display = "none";
  }
}

// Toggle Calendar Section
document.getElementById("toggleCalendar").addEventListener("click", function (event) {
  toggleSectionVisibility("calendarDiv");
  event.stopPropagation(); // Prevent event from bubbling up to document
});

// Toggle Weather Section
document.getElementById("toggleWeather").addEventListener("click", function (event) {
  toggleSectionVisibility("weatherDiv");
  event.stopPropagation(); // Prevent event from bubbling up to document
});

// Toggle Speedtest Section
document.getElementById("toggleSpeedtest").addEventListener("click", function (event) {
  toggleSectionVisibility("speedtestDiv");
  event.stopPropagation(); // Prevent event from bubbling up to document
});

// Click listener on document to close container if clicked outside
document.addEventListener("click", function (event) {
  const calendarContainer = document.getElementById("calendarDiv");
  const weatherContainer = document.getElementById("weatherDiv");
  const speedtestContainer = document.getElementById("speedtestDiv");
  
  if (!calendarContainer.contains(event.target) && !weatherContainer.contains(event.target) && !speedtestContainer.contains(event.target)) {
    if (calendarContainer.style.display === "block") {
      calendarContainer.style.display = "none";
    }
    if (weatherContainer.style.display === "block") {
      weatherContainer.style.display = "none";
    }
    if (speedtestContainer.style.display === "block") {
      speedtestContainer.style.display = "none";
    }
  }
});


/* ------------------------------------------------------------------------------------------------------------------------------------------------------------------- */

// Set Background Image
function setBackground(url) {
  document.querySelector('.background').style.backgroundImage = `url('${url}')`;
}
setBackground('default.png');
/* ------------------------------------------------------------------------------------------------------------------------------------------------------------------- */

// Shows the current time on top of the New Tab
setInterval(() => {
  const date = new Date();
  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  document.getElementById("clockDiv").innerHTML = timeString;
});

/* ------------------------------------------------------------------------------------------------------------------------------------------------------------------- */

// Shows the current date on top of the New Tab
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


/* ------------------------------------------------------------------------------------------------------------------------------------------------------------------- */

// Renderer for the weather
let weather = {
  apiKey: "cbfc45f4f8520b8a731ed6fe6b2bc752",
  fetchWeather: function (city) {
    fetch(
      "https://api.openweathermap.org/data/2.5/weather?q=" +
      city +
      "&units=metric&lang=de&appid=" +
      this.apiKey
    )
      .then((response) => {
        if (!response.ok) {
          alert("Kein Wetter gefunden!");
          throw new Error("Kein Wetter gefunden!");
        }
        return response.json();
      })
      .then((data) => this.displayWeather(data));
  },
  displayWeather: function (data) {
    const { name } = data;
    const { icon, description } = data.weather[0];
    const { temp, humidity, feels_like, temp_min, temp_max } = data.main;
    const { speed } = data.wind;
    document.querySelector(".city").innerText = "Wetter in " + name;
    document.querySelector(".icon").src =
      "https://openweathermap.org/img/wn/" + icon + ".png";
    document.querySelector(".description").innerText = description;
    document.querySelector(".temp").innerText = temp + " °C";
    document.querySelector(".feels_like").innerText =
      "Gefühlt: " + feels_like + " °C";
    document.querySelector(".humidity").innerText =
      "- Luftfeuchtigkeit: " + humidity + "%";
    document.querySelector(".wind").innerText =
      "- Windgeschwindigkeit: " + speed + " km/h";
    document.querySelector(".temp_min").innerText =
      "- Tiefsttemperatur: " + temp_min + " °C";
    document.querySelector(".temp_max").innerText =
      "- Höchsttemperatur: " + temp_max + " °C";
    document.querySelector(".weather").classList.remove("loading");
  },
  search: function () {
    this.fetchWeather(document.querySelector(".search-bar").value);
  },
};

document.querySelector(".search button").addEventListener("click", function () {
  weather.search();
});

document
  .querySelector(".search-bar")
  .addEventListener("keyup", function (event) {
    if (event.key == "Enter") {
      weather.search();
    }
  });

weather.fetchWeather("Deggendorf");

/* ------------------------------------------------------------------------------------------------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function() {
  // Funktion zum Erstellen des Kalenders
  function createCalendar(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const calendarBody = document.getElementById('calendarBody');
    calendarBody.innerHTML = '';

    // Monatsnamen
    const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

    // Aktuellen Monat setzen
    document.getElementById('currentMonth').textContent = monthNames[month] + ' ' + year;

    // Ersten Wochentag ermitteln
    let startDay = firstDay.getDay();

    // Falls Sonntag, auf 7 setzen
    if (startDay === 0) {
      startDay = 7;
    }

    // Tage des Vormonats
    const prevMonthLastDate = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const day = prevMonthLastDate - i;
      createDayElement(day, 'other-month', calendarBody);
    }

    // Tage des aktuellen Monats
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const currentDate = new Date(year, month, i);
      if (isHoliday(currentDate)) {
        createDayElement(i, 'holiday', calendarBody);
      } else {
        createDayElement(i, '', calendarBody);
      }

    }
  }


  // Funktion zum Erstellen eines Kalendertags
  function createDayElement(day, className, parentElement) {
    const dayElement = document.createElement('div');
    dayElement.textContent = day;
    dayElement.classList.add('calendar-day');
    if (className) {
      dayElement.classList.add(className);
    }
    if (isHoliday(new Date(currentYear, currentMonth, day))) {
      dayElement.classList.add('holiday');
    }
    parentElement.appendChild(dayElement);
  }

  // Funktion zur Überprüfung, ob ein Tag ein Feiertag in Bayern ist
  function isHoliday(date) {
    const holidays = [
      [0, 1],    // Neujahr
      [0, 6],    // Heilige Drei Könige (Epiphanias)
      [4, -1],   // Tag der Arbeit (1. Mai)
      [9, 3],    // Tag der Deutschen Einheit (3. Oktober)
      [11, 25],  // 1. Weihnachtstag
      [11, 26],  // 2. Weihnachtstag
      [11, 24],  // Heiligabend
      [11, 31]   // Silvester
    ];

    const month = date.getMonth();
    const day = date.getDate();

    // Ostermontag (Bewegliche Feiertage)
    const easterDate = calculateEasterDate(date.getFullYear());
    const easterMonday = new Date(easterDate);
    easterMonday.setDate(easterMonday.getDate() + 1); // Ostermontag

    // Pfingstmontag (Bewegliche Feiertage)
    const pentecostMonday = new Date(easterDate);
    pentecostMonday.setDate(pentecostMonday.getDate() + 50); // Pfingstmontag

    // Karfreitag
    const goodFriday = new Date(easterDate);
    goodFriday.setDate(goodFriday.getDate() - 2);

    // Christi Himmelfahrt
    const ascensionDay = new Date(easterDate);
    ascensionDay.setDate(ascensionDay.getDate() + 39);

    // Fronleichnam
    const corpusChristi = new Date(easterDate);
    corpusChristi.setDate(corpusChristi.getDate() + 60);

    // Maria Himmelfahrt
    const mariaHimmelfahrt = [7, 15]; // 15. August

    holidays.push([easterMonday.getMonth(), easterMonday.getDate()]);
    holidays.push([pentecostMonday.getMonth(), pentecostMonday.getDate()]);
    holidays.push([goodFriday.getMonth(), goodFriday.getDate()]);
    holidays.push([ascensionDay.getMonth(), ascensionDay.getDate()]);
    holidays.push([corpusChristi.getMonth(), corpusChristi.getDate()]);
    holidays.push(mariaHimmelfahrt);

    return holidays.some(holiday => holiday[0] === month && holiday[1] === day);
  }

  // Funktion zur Berechnung des Osterdatums
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
    const date = new Date(year, n - 1, p + 1);
    return date;
  }

  // Aktuelles Datum
  const currentDate = new Date();
  let currentYear = currentDate.getFullYear();
  let currentMonth = currentDate.getMonth();

  // Kalender für aktuelles Jahr und Monat erstellen
  createCalendar(currentYear, currentMonth);

  // Event-Listener für Vorheriger Monat Button
  document.getElementById('prevMonth').addEventListener('click', function(event) {
    event.stopPropagation(); // Ereignis anhalten
    if (currentMonth === 0) {
      currentYear--;
      currentMonth = 11;
    } else {
      currentMonth--;
    }
    createCalendar(currentYear, currentMonth);
  });

  // Event-Listener für Nächster Monat Button
  document.getElementById('nextMonth').addEventListener('click', function(event) {
    event.stopPropagation(); // Ereignis anhalten
    if (currentMonth === 11) {
      currentYear++;
      currentMonth = 0;
    } else {
      currentMonth++;
    }
    createCalendar(currentYear, currentMonth);
  });
});
