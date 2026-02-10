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
    const storageUsageValue = document.getElementById('storageUsageValue');
    const clockColorPicker = document.getElementById('clockColorPicker');
    const clockColorTrigger = document.getElementById('clockColorTrigger');
    const clockColorPanel = document.getElementById('clockColorPanel');
    const clockColorSwatch = document.getElementById('clockColorSwatch');
    const clockColorHex = document.getElementById('clockColorHex');
    const clockColorWheel = document.getElementById('clockColorWheel');
    const clockColorWheelHandle = document.getElementById('clockColorWheelHandle');
    const clockColorSquare = document.getElementById('clockColorSquare');
    const clockColorSquareHandle = document.getElementById('clockColorSquareHandle');
    const clockColorRgbR = document.getElementById('clockColorRgbR');
    const clockColorRgbG = document.getElementById('clockColorRgbG');
    const clockColorRgbB = document.getElementById('clockColorRgbB');
    const calendarJumpMonth = document.getElementById('calendarJumpMonth');
    const calendarJumpYear = document.getElementById('calendarJumpYear');
    const calendarJumpGo = document.getElementById('calendarJumpGo');
    const calendarJumpToggle = document.getElementById('calendarJumpToggle');
    const calendarJumpPanel = document.getElementById('calendarJumpPanel');
    const exportSettingsButton = document.getElementById('exportSettings');
    const importSettingsButton = document.getElementById('importSettings');
    const importSettingsFile = document.getElementById('importSettingsFile');
    const resetSettingsButton = document.getElementById('resetSettings');
    const settingsToast = document.getElementById('settingsToast');
    let toastTimer = null;

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    function hexToRgb(hex) {
        const normalized = hex.replace('#', '');
        if (normalized.length === 3) {
            const r = parseInt(normalized[0] + normalized[0], 16);
            const g = parseInt(normalized[1] + normalized[1], 16);
            const b = parseInt(normalized[2] + normalized[2], 16);
            return { r, g, b };
        }
        if (normalized.length === 6) {
            const r = parseInt(normalized.slice(0, 2), 16);
            const g = parseInt(normalized.slice(2, 4), 16);
            const b = parseInt(normalized.slice(4, 6), 16);
            return { r, g, b };
        }
        return null;
    }

    function rgbToHex(r, g, b) {
        const toHex = (value) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0');
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    function rgbToHsv(r, g, b) {
        const rNorm = r / 255;
        const gNorm = g / 255;
        const bNorm = b / 255;
        const max = Math.max(rNorm, gNorm, bNorm);
        const min = Math.min(rNorm, gNorm, bNorm);
        const delta = max - min;
        let h = 0;
        const v = max;
        const s = max === 0 ? 0 : delta / max;

        if (delta !== 0) {
            switch (max) {
                case rNorm:
                    h = (gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0);
                    break;
                case gNorm:
                    h = (bNorm - rNorm) / delta + 2;
                    break;
                default:
                    h = (rNorm - gNorm) / delta + 4;
                    break;
            }
            h *= 60;
        }

        return { h, s, v };
    }

    function hsvToRgb(h, s, v) {
        const c = v * s;
        const hPrime = (h / 60) % 6;
        const x = c * (1 - Math.abs((hPrime % 2) - 1));
        let r = 0;
        let g = 0;
        let b = 0;

        if (hPrime >= 0 && hPrime < 1) {
            r = c;
            g = x;
        } else if (hPrime < 2) {
            r = x;
            g = c;
        } else if (hPrime < 3) {
            g = c;
            b = x;
        } else if (hPrime < 4) {
            g = x;
            b = c;
        } else if (hPrime < 5) {
            r = x;
            b = c;
        } else {
            r = c;
            b = x;
        }

        const m = v - c;
        return {
            r: Math.round((r + m) * 255),
            g: Math.round((g + m) * 255),
            b: Math.round((b + m) * 255)
        };
    }

    function normalizeHexInput(value) {
        if (!value) return null;
        let next = value.trim().toLowerCase();
        if (!next.startsWith('#')) {
            next = `#${next}`;
        }
        if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/.test(next)) {
            return null;
        }
        if (next.length === 4) {
            next = `#${next[1]}${next[1]}${next[2]}${next[2]}${next[3]}${next[3]}`;
        }
        return next;
    }

    function setClockColor(value) {
        const color = value || '#f5f7ff';
        document.documentElement.style.setProperty('--clock-color', color);
        if (clockColorSwatch) {
            clockColorSwatch.style.background = color;
        }
        if (clockColorHex) {
            clockColorHex.value = color;
        }
    }

    const pickerState = { h: 0, s: 0, v: 1 };

    function syncPickerFromHex(color) {
        const rgb = hexToRgb(color);
        if (!rgb) return;
        const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
        pickerState.h = hsv.h;
        pickerState.s = hsv.s;
        pickerState.v = hsv.v;
        updatePickerUI();
        if (clockColorRgbR) clockColorRgbR.value = String(rgb.r);
        if (clockColorRgbG) clockColorRgbG.value = String(rgb.g);
        if (clockColorRgbB) clockColorRgbB.value = String(rgb.b);
    }

    function updateClockColorFromPicker() {
        const rgb = hsvToRgb(pickerState.h, pickerState.s, pickerState.v);
        const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
        setClockColor(hex);
        chrome.storage.local.set({ clockColor: hex });
        if (clockColorRgbR) clockColorRgbR.value = String(rgb.r);
        if (clockColorRgbG) clockColorRgbG.value = String(rgb.g);
        if (clockColorRgbB) clockColorRgbB.value = String(rgb.b);
    }

    function updatePickerUI() {
        if (clockColorPicker) {
            clockColorPicker.style.setProperty('--picker-hue', String(pickerState.h));
        }

        if (clockColorWheel && clockColorWheelHandle) {
            const rect = clockColorWheel.getBoundingClientRect();
            const radius = rect.width / 2 - 10;
            const angle = ((pickerState.h - 90) * Math.PI) / 180;
            const cx = rect.width / 2 + Math.cos(angle) * radius;
            const cy = rect.height / 2 + Math.sin(angle) * radius;
            clockColorWheelHandle.style.left = `${cx}px`;
            clockColorWheelHandle.style.top = `${cy}px`;
        }

        if (clockColorSquare && clockColorSquareHandle) {
            const rect = clockColorSquare.getBoundingClientRect();
            const x = clamp(pickerState.s, 0, 1) * rect.width;
            const y = (1 - clamp(pickerState.v, 0, 1)) * rect.height;
            clockColorSquareHandle.style.left = `${x}px`;
            clockColorSquareHandle.style.top = `${y}px`;
        }
    }

    function openClockColorPicker() {
        if (!clockColorPicker || !clockColorTrigger) return;
        clockColorPicker.classList.add('is-open');
        clockColorTrigger.setAttribute('aria-expanded', 'true');
        requestAnimationFrame(() => updatePickerUI());
    }

    function closeClockColorPicker() {
        if (!clockColorPicker || !clockColorTrigger) return;
        clockColorPicker.classList.remove('is-open');
        clockColorTrigger.setAttribute('aria-expanded', 'false');
    }

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
        const url = buildWeatherUrl(value.trim());
        weatherIframe.dataset.src = url;
        const weatherPanel = weatherIframe.closest('.panel');
        if (!weatherPanel || !weatherPanel.classList.contains('hidden')) {
            weatherIframe.src = url;
        }
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

    function showSettingsToast(message) {
        if (!settingsToast) return;
        settingsToast.textContent = message;
        settingsToast.classList.add('is-visible');
        if (toastTimer) {
            clearTimeout(toastTimer);
        }
        toastTimer = setTimeout(() => {
            settingsToast.classList.remove('is-visible');
        }, 1600);
    }

    chrome.storage.local.get(['locationName', 'stateCode'], (result) => {
        const storedLocation = (result.locationName || '').trim();
        const storedState = (result.stateCode || '').trim();
        const effectiveLocation = storedLocation || DEFAULT_LOCATION;
        const effectiveState = normalizeStateInput(storedState || DEFAULT_STATE);

        if (locationInput) {
            locationInput.value = effectiveLocation;
        }
        if (stateInput) {
            stateInput.value = effectiveState;
            stateInput.dispatchEvent(new Event('custom-select:sync'));
        }
        setStateCode(effectiveState);
        updateWeatherWidget(effectiveLocation);

        if (!storedLocation) {
            chrome.storage.local.set({ locationName: effectiveLocation });
        }
        if (!storedState) {
            chrome.storage.local.set({ stateCode: effectiveState });
        }
    });

    chrome.storage.local.get(['backgroundDim', 'clockColor'], (result) => {
        const savedDim = typeof result.backgroundDim === 'number' ? result.backgroundDim : 20;
        const clamped = Math.max(0, Math.min(100, savedDim));
        document.documentElement.style.setProperty('--bg-dim', String(clamped / 100));
        if (backgroundDimInput) {
            backgroundDimInput.value = String(clamped);
        }
        const savedColor = typeof result.clockColor === 'string' ? result.clockColor : '#f5f7ff';
        setClockColor(savedColor);
        syncPickerFromHex(savedColor);
    });

    // Calendar
    let currentDate = new Date();
    let currentYear = currentDate.getFullYear();
    let currentMonth = currentDate.getMonth();
    createCalendar(currentYear, currentMonth);
    if (calendarJumpMonth) {
        calendarJumpMonth.value = String(currentMonth);
        calendarJumpMonth.dispatchEvent(new Event('custom-select:sync'));
    }
    if (calendarJumpYear) {
        calendarJumpYear.value = String(currentYear);
    }

    function renderCalendar() {
        createCalendar(currentYear, currentMonth);
        if (calendarJumpMonth) {
            calendarJumpMonth.value = String(currentMonth);
            calendarJumpMonth.dispatchEvent(new Event('custom-select:sync'));
        }
        if (calendarJumpYear) {
            calendarJumpYear.value = String(currentYear);
        }
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

    function closeCalendarJump() {
        if (calendarJumpPanel) {
            calendarJumpPanel.classList.add('hidden');
        }
        if (calendarJumpToggle) {
            calendarJumpToggle.setAttribute('aria-expanded', 'false');
        }
    }

    function openCalendarJump() {
        if (calendarJumpPanel) {
            calendarJumpPanel.classList.remove('hidden');
        }
        if (calendarJumpToggle) {
            calendarJumpToggle.setAttribute('aria-expanded', 'true');
        }
    }

    if (calendarJumpToggle) {
        calendarJumpToggle.addEventListener('click', (event) => {
            event.stopPropagation();
            if (!calendarJumpPanel) return;
            if (calendarJumpPanel.classList.contains('hidden')) {
                openCalendarJump();
            } else {
                closeCalendarJump();
            }
        });
    }

    if (calendarJumpGo && calendarJumpMonth && calendarJumpYear) {
        calendarJumpGo.addEventListener('click', () => {
            const month = Number(calendarJumpMonth.value);
            const year = Number(calendarJumpYear.value);
            if (!Number.isFinite(month) || !Number.isFinite(year)) return;
            if (year < 1900 || year > 2100) return;
            currentMonth = Math.max(0, Math.min(11, month));
            currentYear = year;
            renderCalendar();
            closeCalendarJump();
        });
    }

    if (calendarJumpYear) {
        calendarJumpYear.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && calendarJumpGo) {
                calendarJumpGo.click();
            }
        });
    }

    window.addEventListener('click', (event) => {
        if (!calendarJumpPanel) return;
        if (!calendarJumpPanel.contains(event.target) && event.target !== calendarJumpToggle && !event.target.closest('#calendarJumpToggle')) {
            closeCalendarJump();
        }
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
                updateWeatherWidget(location);
                showSettingsToast(chrome.i18n.getMessage("settingsSaved"));
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
                renderCalendar();
                showSettingsToast(chrome.i18n.getMessage("settingsSaved"));
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

    if (clockColorTrigger) {
        clockColorTrigger.addEventListener('click', (event) => {
            event.stopPropagation();
            if (clockColorPicker && clockColorPicker.classList.contains('is-open')) {
                closeClockColorPicker();
            } else {
                openClockColorPicker();
            }
        });
    }

    if (clockColorHex) {
        clockColorHex.addEventListener('input', () => {
            const normalized = normalizeHexInput(clockColorHex.value);
            if (!normalized) return;
            setClockColor(normalized);
            syncPickerFromHex(normalized);
            chrome.storage.local.set({ clockColor: normalized });
        });
    }

    function updateClockColorFromRgbInputs() {
        if (!clockColorRgbR || !clockColorRgbG || !clockColorRgbB) return;
        const r = clamp(Number(clockColorRgbR.value), 0, 255);
        const g = clamp(Number(clockColorRgbG.value), 0, 255);
        const b = clamp(Number(clockColorRgbB.value), 0, 255);
        clockColorRgbR.value = String(r);
        clockColorRgbG.value = String(g);
        clockColorRgbB.value = String(b);
        const hex = rgbToHex(r, g, b);
        setClockColor(hex);
        syncPickerFromHex(hex);
        chrome.storage.local.set({ clockColor: hex });
    }

    if (clockColorRgbR) {
        clockColorRgbR.addEventListener('input', updateClockColorFromRgbInputs);
    }

    if (clockColorRgbG) {
        clockColorRgbG.addEventListener('input', updateClockColorFromRgbInputs);
    }

    if (clockColorRgbB) {
        clockColorRgbB.addEventListener('input', updateClockColorFromRgbInputs);
    }

    if (clockColorWheel) {
        clockColorWheel.addEventListener('pointerdown', (event) => {
            clockColorWheel.setPointerCapture(event.pointerId);
            const rect = clockColorWheel.getBoundingClientRect();
            const update = (clientX, clientY) => {
                const dx = clientX - (rect.left + rect.width / 2);
                const dy = clientY - (rect.top + rect.height / 2);
                const angle = Math.atan2(dy, dx);
                const deg = (angle * 180) / Math.PI;
                pickerState.h = (deg + 450) % 360;
                updatePickerUI();
                updateClockColorFromPicker();
            };
            update(event.clientX, event.clientY);
            const moveHandler = (moveEvent) => update(moveEvent.clientX, moveEvent.clientY);
            const upHandler = () => {
                clockColorWheel.removeEventListener('pointermove', moveHandler);
                clockColorWheel.removeEventListener('pointerup', upHandler);
                clockColorWheel.releasePointerCapture(event.pointerId);
            };
            clockColorWheel.addEventListener('pointermove', moveHandler);
            clockColorWheel.addEventListener('pointerup', upHandler, { once: true });
        });
    }

    if (clockColorSquare) {
        clockColorSquare.addEventListener('pointerdown', (event) => {
            clockColorSquare.setPointerCapture(event.pointerId);
            const rect = clockColorSquare.getBoundingClientRect();
            const update = (clientX, clientY) => {
                const x = clamp(clientX - rect.left, 0, rect.width);
                const y = clamp(clientY - rect.top, 0, rect.height);
                pickerState.s = rect.width ? x / rect.width : 0;
                pickerState.v = rect.height ? 1 - y / rect.height : 1;
                updatePickerUI();
                updateClockColorFromPicker();
            };
            update(event.clientX, event.clientY);
            const moveHandler = (moveEvent) => update(moveEvent.clientX, moveEvent.clientY);
            const upHandler = () => {
                clockColorSquare.removeEventListener('pointermove', moveHandler);
                clockColorSquare.removeEventListener('pointerup', upHandler);
                clockColorSquare.releasePointerCapture(event.pointerId);
            };
            clockColorSquare.addEventListener('pointermove', moveHandler);
            clockColorSquare.addEventListener('pointerup', upHandler, { once: true });
        });
    }

    window.addEventListener('click', (event) => {
        if (!clockColorPicker) return;
        if (!event.target.closest('#clockColorPicker')) {
            closeClockColorPicker();
        }
    });

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeClockColorPicker();
        }
    });

    function formatBytes(bytes) {
        if (!Number.isFinite(bytes)) return '-';
        const units = ['B', 'KB', 'MB', 'GB'];
        let value = bytes;
        let index = 0;
        while (value >= 1024 && index < units.length - 1) {
            value /= 1024;
            index += 1;
        }
        const precision = value >= 10 || index === 0 ? 0 : 1;
        return `${value.toFixed(precision)} ${units[index]}`;
    }

    function updateStorageUsage() {
        if (!storageUsageValue) return;
        chrome.storage.local.getBytesInUse(null, (bytes) => {
            storageUsageValue.textContent = formatBytes(bytes);
        });
    }

    function downloadJson(filename, data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    }

    if (exportSettingsButton) {
        exportSettingsButton.addEventListener('click', () => {
            chrome.storage.local.get(null, (data) => {
                downloadJson('chromium-extension-settings.json', data);
                showSettingsToast(chrome.i18n.getMessage("settingsExported") || 'Exported');
            });
        });
    }

    if (importSettingsButton && importSettingsFile) {
        importSettingsButton.addEventListener('click', () => {
            importSettingsFile.click();
        });
    }

    if (importSettingsFile) {
        importSettingsFile.addEventListener('change', (event) => {
            const file = event.target.files && event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const parsed = JSON.parse(reader.result);
                    if (!parsed || typeof parsed !== 'object') {
                        throw new Error('Invalid settings file');
                    }
                    chrome.storage.local.set(parsed, () => {
                        showSettingsToast(chrome.i18n.getMessage("settingsImported") || 'Imported');
                        window.location.reload();
                    });
                } catch (error) {
                    alert(chrome.i18n.getMessage("settingsImportFailed") || 'Import failed. Please check the file.');
                }
            };
            reader.readAsText(file);
            event.target.value = '';
        });
    }

    if (resetSettingsButton) {
        resetSettingsButton.addEventListener('click', () => {
            const message = chrome.i18n.getMessage("settingsResetConfirm") || 'Reset all settings to defaults?';
            if (!confirm(message)) return;
            chrome.storage.local.clear(() => {
                showSettingsToast(chrome.i18n.getMessage("settingsResetDone") || 'Reset');
                window.location.reload();
            });
        });
    }

    updateStorageUsage();

});
