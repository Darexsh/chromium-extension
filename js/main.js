import { createCalendar, setStateCode } from './calendar.js';
import { initUI } from './ui.js';
import { initI18n } from './i18n.js';

document.addEventListener('DOMContentLoaded', () => {
    initI18n();
    initUI();
    const weatherIframe = document.querySelector('.weather-iframe');
    const locationInput = document.getElementById('locationInput');
    const saveWeatherButton = document.getElementById('saveWeather');
    const stateInput = document.getElementById('stateInput');
    const saveStateButton = document.getElementById('saveState');
    const backgroundDimInput = document.getElementById('backgroundDim');
    const clockColorInput = document.getElementById('clockColor');

    function toLocationSlug(value) {
        return value
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '-');
    }

    function toLocationName(value) {
        return value
            .trim()
            .split(/\s+/)
            .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join(' ');
    }

    function buildWeatherUrl(location) {
        const slug = encodeURIComponent(toLocationSlug(location));
        const name = encodeURIComponent(toLocationName(location));
        return `https://api.wetteronline.de/wetterwidget?gid=10788&modeid=FC3&seourl=${slug}&locationname=${name}&lang=de`;
    }

    function updateWeatherWidget(value) {
        if (!weatherIframe || !value) return;
        weatherIframe.src = buildWeatherUrl(value.trim());
    }

    const stateMap = {
        bw: 'bw',
        by: 'by',
        be: 'be',
        bb: 'bb',
        hb: 'hb',
        hh: 'hh',
        he: 'he',
        mv: 'mv',
        ni: 'ni',
        nw: 'nw',
        rp: 'rp',
        sl: 'sl',
        sn: 'sn',
        st: 'st',
        sh: 'sh',
        th: 'th',
        'baden-württemberg': 'bw',
        'baden wurttemberg': 'bw',
        'baden-wuerttemberg': 'bw',
        'bavaria': 'by',
        'bayern': 'by',
        'berlin': 'be',
        'brandenburg': 'bb',
        'bremen': 'hb',
        'hamburg': 'hh',
        'hessen': 'he',
        'mecklenburg-vorpommern': 'mv',
        'mecklenburg vorpommern': 'mv',
        'lower saxony': 'ni',
        'niedersachsen': 'ni',
        'north rhine-westphalia': 'nw',
        'north rhine westphalia': 'nw',
        'nordrhein-westfalen': 'nw',
        'nordrhein westfalen': 'nw',
        'rheinland-pfalz': 'rp',
        'rheinland pfalz': 'rp',
        'saarland': 'sl',
        'sachsen': 'sn',
        'saxony': 'sn',
        'sachsen-anhalt': 'st',
        'sachsen anhalt': 'st',
        'saxony-anhalt': 'st',
        'schleswig-holstein': 'sh',
        'schleswig holstein': 'sh',
        'thüringen': 'th',
        'thueringen': 'th',
        'thuringia': 'th'
    };

    function normalizeStateInput(value) {
        const raw = value.trim().toLowerCase();
        if (!raw) return DEFAULT_STATE;
        if (stateMap[raw]) return stateMap[raw];
        return stateMap[raw.replace(/\s+/g, ' ')] || stateMap[raw.replace(/\s+/g, '-')] || raw;
    }

    const DEFAULT_LOCATION = chrome.i18n.getMessage('defaultLocation') || 'Berlin';
    const DEFAULT_STATE = chrome.i18n.getMessage('defaultStateCode') || 'be';

    function getStoredValue(key) {
        return localStorage.getItem(key) || '';
    }

    function setStoredValue(key, value) {
        localStorage.setItem(key, value);
    }

    const cachedLocation = getStoredValue('locationName').trim();
    const cachedState = (getStoredValue('stateCode') || DEFAULT_STATE).trim();
    const initialLocation = cachedLocation || DEFAULT_LOCATION;
    const initialState = normalizeStateInput(cachedState || DEFAULT_STATE);

    if (locationInput) {
        locationInput.value = initialLocation;
    }
    if (stateInput) {
        stateInput.value = initialState;
    }
    setStateCode(initialState);
    updateWeatherWidget(initialLocation);

    chrome.storage.local.get(['locationName', 'stateCode'], (result) => {
        const storedLocation = (result.locationName || '').trim();
        const storedState = (result.stateCode || '').trim();
        const effectiveLocation = storedLocation || initialLocation;
        const effectiveState = normalizeStateInput(storedState || initialState);

        if (locationInput) {
            locationInput.value = effectiveLocation;
        }
        if (stateInput) {
            stateInput.value = effectiveState;
        }
        setStateCode(effectiveState);
        updateWeatherWidget(effectiveLocation);

        if (!storedLocation) {
            chrome.storage.local.set({ locationName: effectiveLocation });
        }
        if (!storedState) {
            chrome.storage.local.set({ stateCode: effectiveState });
        }
        setStoredValue('locationName', effectiveLocation);
        setStoredValue('stateCode', effectiveState);
    });

    chrome.storage.local.get(['backgroundDim', 'clockColor'], (result) => {
        const savedDim = typeof result.backgroundDim === 'number' ? result.backgroundDim : 20;
        const clamped = Math.max(0, Math.min(100, savedDim));
        document.documentElement.style.setProperty('--bg-dim', String(clamped / 100));
        if (backgroundDimInput) {
            backgroundDimInput.value = String(clamped);
        }
        const savedColor = typeof result.clockColor === 'string' ? result.clockColor : '#f5f7ff';
        document.documentElement.style.setProperty('--clock-color', savedColor);
        if (clockColorInput) {
            clockColorInput.value = savedColor;
        }
    });

    // Calendar
    let currentDate = new Date();
    let currentYear = currentDate.getFullYear();
    let currentMonth = currentDate.getMonth();
    createCalendar(currentYear, currentMonth);

    function renderCalendar() {
        createCalendar(currentYear, currentMonth);
    }

    document.getElementById('prevMonth').addEventListener('click', function (event) {
        event.stopPropagation();
        currentMonth = (currentMonth === 0) ? (--currentYear, 11) : currentMonth - 1;
        renderCalendar();
    });

    document.getElementById('nextMonth').addEventListener('click', function (event) {
        event.stopPropagation();
        currentMonth = (currentMonth === 11) ? (++currentYear, 0) : currentMonth + 1;
        renderCalendar();
    });

    if (saveWeatherButton && locationInput) {
        saveWeatherButton.addEventListener('click', () => {
            const location = locationInput.value.trim();
            if (!location) {
                alert(chrome.i18n.getMessage("enterLocation"));
                return;
            }
            const payload = { locationName: location || DEFAULT_LOCATION };
            chrome.storage.local.set(payload, () => {
                setStoredValue('locationName', payload.locationName);
                updateWeatherWidget(location);
                const modal = document.getElementById('settingsModal');
                if (modal) {
                    modal.classList.remove('show');
                }
            });
        });
    }

    if (saveStateButton && stateInput) {
        saveStateButton.addEventListener('click', () => {
            const stateCode = normalizeStateInput(stateInput.value);
            if (!stateCode) {
                alert(chrome.i18n.getMessage("enterState"));
                return;
            }
            chrome.storage.local.set({ stateCode }, () => {
                setStateCode(stateCode);
                stateInput.value = stateCode;
                setStoredValue('stateCode', stateCode);
                renderCalendar();
                const modal = document.getElementById('settingsModal');
                if (modal) {
                    modal.classList.remove('show');
                }
            });
        });
    }

    if (backgroundDimInput) {
        backgroundDimInput.addEventListener('input', () => {
            const value = Number(backgroundDimInput.value);
            const clamped = Math.max(0, Math.min(100, value));
            document.documentElement.style.setProperty('--bg-dim', String(clamped / 100));
            chrome.storage.local.set({ backgroundDim: clamped });
        });
    }

    if (clockColorInput) {
        clockColorInput.addEventListener('input', () => {
            const value = clockColorInput.value;
            document.documentElement.style.setProperty('--clock-color', value);
            chrome.storage.local.set({ clockColor: value });
        });
    }

});
