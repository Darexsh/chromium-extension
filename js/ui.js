export function initUI() {
  const widgets = {
    calendar: document.getElementById('calendarWidget'),
    weather: document.getElementById('weatherWidget'),
    speedtest: document.getElementById('speedtestWidget'),
  };

  const toggles = {
    calendar: document.getElementById('toggleCalendar'),
    weather: document.getElementById('toggleWeather'),
    speedtest: document.getElementById('toggleSpeedtest'),
  };

  const widgetToToggleKey = {
    calendarWidget: 'calendar',
    weatherWidget: 'weather',
    speedtestWidget: 'speedtest',
  };

  function setToggleState(key, isOpen) {
    const toggle = toggles[key];
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(isOpen));
    }
  }

  Object.keys(widgets).forEach((key) => {
    const widget = widgets[key];
    if (widget) {
      widget.classList.add('hidden');
      setToggleState(key, false);
    }
  });

  Object.keys(toggles).forEach(key => {
    const widget = widgets[key];
    const toggle = toggles[key];
    if (!widget || !toggle) return;

    setToggleState(key, !widget.classList.contains('hidden'));

    toggle.addEventListener('click', () => {
      widget.classList.toggle('hidden');
      const isOpen = !widget.classList.contains('hidden');
      setToggleState(key, isOpen);
    });
  });

  document.querySelectorAll('.close-widget').forEach(button => {
    button.addEventListener('click', (e) => {
      const widgetId = e.currentTarget.getAttribute('data-widget');
      const targetWidget = document.getElementById(widgetId);
      if (targetWidget) targetWidget.classList.add('hidden');
      const toggleKey = widgetToToggleKey[widgetId];
      if (toggleKey) setToggleState(toggleKey, false);
    });
  });

  // Settings Modal
  const settingsModal = document.getElementById('settingsModal');
  const toggleSettings = document.getElementById('toggleSettings');
  const closeSettingsModal = document.getElementById('closeSettingsModal');

  function openSettings() {
    if (!settingsModal) return;
    settingsModal.classList.add('show');
    if (toggleSettings) toggleSettings.setAttribute('aria-expanded', 'true');
  }

  function closeSettings() {
    if (!settingsModal) return;
    settingsModal.classList.remove('show');
    if (toggleSettings) toggleSettings.setAttribute('aria-expanded', 'false');
  }

  if (toggleSettings) {
    toggleSettings.addEventListener('click', openSettings);
  }

  if (closeSettingsModal) {
    closeSettingsModal.addEventListener('click', closeSettings);
  }

  window.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
      closeSettings();
    }
    if (backgroundDropdown && !backgroundDropdown.contains(e.target) && e.target !== toggleBackgroundMenu) {
      closeBackgroundMenu();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSettings();
    }
  });

  // Background
  const backgroundInput = document.getElementById('backgroundInput');
  const resetBackground = document.getElementById('resetBackground');
  const changeBackground = document.getElementById('changeBackground');
  const toggleBackgroundMenu = document.getElementById('toggleBackgroundMenu');
  const backgroundDropdown = document.getElementById('backgroundDropdown');

  function setBackground(url) {
    const backgroundElement = document.querySelector('.background');
    backgroundElement.style.backgroundImage = `url('${url}')`;
    console.log(chrome.i18n.getMessage("backgroundSet", [url]));
  }

  chrome.storage.local.get(['backgroundImage'], function (result) {
    const savedBackground = result.backgroundImage;
    if (savedBackground) {
      setBackground(savedBackground);
    } else {
      setBackground('default.png');
    }
  });

  function closeBackgroundMenu() {
    if (backgroundDropdown) {
      backgroundDropdown.classList.add('hidden');
    }
    if (toggleBackgroundMenu) {
      toggleBackgroundMenu.setAttribute('aria-expanded', 'false');
    }
  }

  if (toggleBackgroundMenu && backgroundDropdown) {
    toggleBackgroundMenu.addEventListener('click', (event) => {
      event.stopPropagation();
      const isHidden = backgroundDropdown.classList.contains('hidden');
      if (isHidden) {
        backgroundDropdown.classList.remove('hidden');
        toggleBackgroundMenu.setAttribute('aria-expanded', 'true');
      } else {
        closeBackgroundMenu();
      }
    });
  }

  if (changeBackground && backgroundInput) {
    changeBackground.addEventListener('click', () => {
      backgroundInput.click();
      closeBackgroundMenu();
    });
  }

  if (backgroundInput) {
    backgroundInput.addEventListener('change', function (event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          const imageDataUrl = e.target.result;
          setBackground(imageDataUrl);
          chrome.storage.local.set({ 'backgroundImage': imageDataUrl }, function () {
            console.log(chrome.i18n.getMessage("backgroundSaved"));
          });
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (resetBackground) {
    resetBackground.addEventListener('click', function () {
      chrome.storage.local.remove('backgroundImage', function () {
        setBackground('default.png');
        console.log(chrome.i18n.getMessage("backgroundReset"));
      });
      closeBackgroundMenu();
    });
  }

  // Clock and Date
  function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString(chrome.i18n.getUILanguage(), { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    document.getElementById("clockDiv").innerHTML = timeString;

    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = now.toLocaleDateString(chrome.i18n.getUILanguage(), options);
    const currentThursday = new Date(now.getTime() + (3 - ((now.getDay() + 6) % 7)) * 86400000);
    const yearOfThursday = currentThursday.getFullYear();
    const firstThursday = new Date(new Date(yearOfThursday, 0, 4).getTime() + (3 - ((new Date(yearOfThursday, 0, 4).getDay() + 6) % 7)) * 86400000);
    let weekNumber = Math.floor(1 + 0.5 + (currentThursday.getTime() - firstThursday.getTime()) / 86400000 / 7);
    weekNumber = ("0" + weekNumber).slice(-2);
    const weekLabel = chrome.i18n.getMessage("weekLabel", [weekNumber]) || `KW ${weekNumber}`;
    const dateStringWithWeek = `${dateString} <span class="week-number"> - ${weekLabel}</span>`;
    document.getElementById("dateDiv").innerHTML = dateStringWithWeek;

    const msUntilNextSecond = 1000 - now.getMilliseconds();
    setTimeout(updateTime, msUntilNextSecond);
  }

  updateTime();
}
