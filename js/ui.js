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

  const WIDGET_ANIMATION_OPTIONS = ['none', 'fly', 'slide', 'rotate', 'fade', 'scale', 'flip', 'bounce', 'blur', 'skew'];
  const DEFAULT_WIDGET_ANIMATION = 'fly';
  let widgetAnimation = DEFAULT_WIDGET_ANIMATION;
  let timeFormat = '24h';
  let showSeconds = true;
  const widgetAnimationSelect = document.getElementById('widgetAnimation');
  const timeFormatSelect = document.getElementById('timeFormatSelect');
  const timeSecondsSelect = document.getElementById('timeSecondsSelect');
  const timeVisibilitySelect = document.getElementById('timeVisibilitySelect');
  const dateVisibilitySelect = document.getElementById('dateVisibilitySelect');
  const weekNumberSelect = document.getElementById('weekNumberSelect');
  const widgetCalendarVisibility = document.getElementById('widgetCalendarVisibility');
  const widgetWeatherVisibility = document.getElementById('widgetWeatherVisibility');
  const widgetSpeedtestVisibility = document.getElementById('widgetSpeedtestVisibility');

  function closeCustomSelects() {
    document.querySelectorAll('.custom-select.is-open').forEach((wrapper) => {
      wrapper.classList.remove('is-open');
      const trigger = wrapper.querySelector('.custom-select__trigger');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    });
  }

  function initCustomSelect(select) {
    if (!select || select.closest('.custom-select')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select';
    select.classList.add('custom-select__native');
    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(select);

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'custom-select__trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');

    const value = document.createElement('span');
    value.className = 'custom-select__value';

    const icon = document.createElement('span');
    icon.className = 'custom-select__icon';
    icon.setAttribute('aria-hidden', 'true');

    trigger.appendChild(value);
    trigger.appendChild(icon);
    wrapper.appendChild(trigger);

    const list = document.createElement('div');
    list.className = 'custom-select__list';
    list.setAttribute('role', 'listbox');
    wrapper.appendChild(list);

    function syncDisabled() {
      const isDisabled = select.disabled;
      wrapper.classList.toggle('custom-select--disabled', isDisabled);
      trigger.disabled = isDisabled;
      if (isDisabled) {
        wrapper.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
      }
    }

    function syncFromSelect() {
      const selectedOption = select.options[select.selectedIndex];
      value.textContent = selectedOption ? selectedOption.textContent : '';
      list.querySelectorAll('.custom-select__option').forEach((option) => {
        option.setAttribute('aria-selected', option.dataset.value === select.value ? 'true' : 'false');
      });
    }

    function buildOptions() {
      list.innerHTML = '';
      Array.from(select.options).forEach((option) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'custom-select__option';
        item.textContent = option.textContent;
        item.dataset.value = option.value;
        item.setAttribute('role', 'option');
        item.setAttribute('aria-selected', option.selected ? 'true' : 'false');
        if (option.disabled) item.disabled = true;
        list.appendChild(item);
      });
      syncFromSelect();
    }

    function openSelect() {
      if (select.disabled) return;
      closeCustomSelects();
      wrapper.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
    }

    function toggleSelect() {
      if (wrapper.classList.contains('is-open')) {
        wrapper.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
      } else {
        openSelect();
      }
    }

    buildOptions();
    syncDisabled();

    trigger.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleSelect();
    });

    list.addEventListener('click', (event) => {
      event.stopPropagation();
      const option = event.target.closest('.custom-select__option');
      if (!option || option.disabled) return;
      select.value = option.dataset.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      syncFromSelect();
      wrapper.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
    });

    select.addEventListener('change', () => {
      syncFromSelect();
    });

    select.addEventListener('custom-select:sync', () => {
      syncFromSelect();
    });

    const observer = new MutationObserver(() => {
      syncDisabled();
    });
    observer.observe(select, { attributes: true, attributeFilter: ['disabled'] });
  }

  function initCustomSelects() {
    document.querySelectorAll('select[data-custom-select]').forEach((select) => {
      initCustomSelect(select);
    });
  }

  function setToggleState(key, isOpen) {
    const toggle = toggles[key];
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(isOpen));
    }
  }

  function normalizeWidgetAnimation(value) {
    return WIDGET_ANIMATION_OPTIONS.includes(value) ? value : DEFAULT_WIDGET_ANIMATION;
  }

  const panelAnimationClasses = [
    'panel-animate',
    'panel-enter',
    'panel-exit',
    'panel-anim-fly',
    'panel-anim-slide',
    'panel-anim-rotate',
    'panel-anim-fade',
    'panel-anim-scale',
    'panel-anim-flip',
    'panel-anim-bounce',
    'panel-anim-blur',
    'panel-anim-skew'
  ];

  function resetPanelAnimation(panel) {
    panel.classList.remove(...panelAnimationClasses);
  }

  function loadLazyIframes(panel) {
    if (!panel) return;
    panel.querySelectorAll('iframe[data-src]').forEach((iframe) => {
      const desired = iframe.getAttribute('data-src');
      if (!desired) return;
      if (iframe.getAttribute('src') !== desired) {
        iframe.setAttribute('src', desired);
      }
    });
  }

  function persistWidgetState(key, isOpen) {
    chrome.storage.local.get(['widgetOpenState'], (result) => {
      const current = typeof result.widgetOpenState === 'object' && result.widgetOpenState ? result.widgetOpenState : {};
      const next = { ...current, [key]: isOpen };
      chrome.storage.local.set({ widgetOpenState: next });
    });
  }

  function openWidget(panel) {
    if (!panel || !panel.classList.contains('hidden')) return;
    panel.classList.remove('hidden');
    loadLazyIframes(panel);
    if (widgetAnimation === 'none') return;
    resetPanelAnimation(panel);
    void panel.offsetWidth;
    panel.classList.add('panel-animate', `panel-anim-${widgetAnimation}`, 'panel-enter');
    panel.addEventListener('animationend', (event) => {
      if (event.target !== panel) return;
      panel.classList.remove('panel-animate', 'panel-enter');
    }, { once: true });
  }

  function closeWidget(panel) {
    if (!panel || panel.classList.contains('hidden')) return;
    if (widgetAnimation === 'none') {
      panel.classList.add('hidden');
      return;
    }
    resetPanelAnimation(panel);
    void panel.offsetWidth;
    panel.classList.add('panel-animate', `panel-anim-${widgetAnimation}`, 'panel-exit');
    panel.addEventListener('animationend', (event) => {
      if (event.target !== panel) return;
      panel.classList.add('hidden');
      panel.classList.remove('panel-animate', 'panel-exit');
    }, { once: true });
  }

  Object.keys(widgets).forEach((key) => {
    const widget = widgets[key];
    if (widget) {
      widget.classList.add('hidden');
      setToggleState(key, false);
    }
  });

  function applyWidgetVisibility(visibility) {
    const config = visibility || {};
    const entries = [
      ['calendar', widgetCalendarVisibility, 'calendarWidget', 'toggleCalendar'],
      ['weather', widgetWeatherVisibility, 'weatherWidget', 'toggleWeather'],
      ['speedtest', widgetSpeedtestVisibility, 'speedtestWidget', 'toggleSpeedtest']
    ];

    entries.forEach(([key, select, widgetId, toggleId]) => {
      const visible = config[key] !== false;
      const widget = document.getElementById(widgetId);
      const toggle = document.getElementById(toggleId);
      if (select) {
        select.value = visible ? 'on' : 'off';
        select.dispatchEvent(new Event('custom-select:sync'));
      }
      if (toggle) {
        toggle.style.display = visible ? '' : 'none';
      }
      if (widget && !visible) {
        widget.classList.add('hidden');
        setToggleState(key, false);
        persistWidgetState(key, false);
      }
    });
  }

  function updateWidgetVisibility(key, isVisible) {
    chrome.storage.local.get(['widgetVisibility'], (result) => {
      const current = typeof result.widgetVisibility === 'object' && result.widgetVisibility ? result.widgetVisibility : {};
      const next = { ...current, [key]: isVisible };
      chrome.storage.local.set({ widgetVisibility: next });
      applyWidgetVisibility(next);
    });
  }

  Object.keys(toggles).forEach(key => {
    const widget = widgets[key];
    const toggle = toggles[key];
    if (!widget || !toggle) return;

    setToggleState(key, !widget.classList.contains('hidden'));

    toggle.addEventListener('click', () => {
      if (widget.classList.contains('hidden')) {
        openWidget(widget);
        setToggleState(key, true);
        persistWidgetState(key, true);
      } else {
        closeWidget(widget);
        setToggleState(key, false);
        persistWidgetState(key, false);
      }
    });
  });

  if (widgetCalendarVisibility) {
    widgetCalendarVisibility.addEventListener('change', () => {
      updateWidgetVisibility('calendar', widgetCalendarVisibility.value === 'on');
    });
  }
  if (widgetWeatherVisibility) {
    widgetWeatherVisibility.addEventListener('change', () => {
      updateWidgetVisibility('weather', widgetWeatherVisibility.value === 'on');
    });
  }
  if (widgetSpeedtestVisibility) {
    widgetSpeedtestVisibility.addEventListener('change', () => {
      updateWidgetVisibility('speedtest', widgetSpeedtestVisibility.value === 'on');
    });
  }

  document.querySelectorAll('.close-widget').forEach(button => {
    button.addEventListener('click', (e) => {
      const widgetId = e.currentTarget.getAttribute('data-widget');
      const targetWidget = document.getElementById(widgetId);
      if (targetWidget) closeWidget(targetWidget);
      const toggleKey = widgetToToggleKey[widgetId];
      if (toggleKey) {
        setToggleState(toggleKey, false);
        persistWidgetState(toggleKey, false);
      }
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
    if (!e.target.closest('.custom-select')) {
      closeCustomSelects();
    }
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
      closeCustomSelects();
      return;
    }

    const target = e.target;
    const isTyping = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable);
    if (isTyping) return;

    if (e.key === 's' || e.key === 'S') {
      e.preventDefault();
      openSettings();
      return;
    }

    if (e.key === '1' && toggles.calendar && toggles.calendar.style.display !== 'none') {
      toggles.calendar.click();
      return;
    }
    if (e.key === '2' && toggles.weather && toggles.weather.style.display !== 'none') {
      toggles.weather.click();
      return;
    }
    if (e.key === '3' && toggles.speedtest && toggles.speedtest.style.display !== 'none') {
      toggles.speedtest.click();
    }
  });

  initCustomSelects();

  chrome.storage.local.get(['widgetVisibility', 'widgetOpenState'], (result) => {
    applyWidgetVisibility(result.widgetVisibility);
    const openState = result.widgetOpenState || {};
    Object.keys(widgets).forEach((key) => {
      if (openState[key] && toggles[key] && toggles[key].style.display !== 'none') {
        openWidget(widgets[key]);
        setToggleState(key, true);
      }
    });
  });

  if (widgetAnimationSelect) {
    chrome.storage.local.get(['widgetAnimation'], (result) => {
      widgetAnimation = normalizeWidgetAnimation(result.widgetAnimation);
      widgetAnimationSelect.value = widgetAnimation;
      widgetAnimationSelect.dispatchEvent(new Event('custom-select:sync'));
    });

    widgetAnimationSelect.addEventListener('change', () => {
      widgetAnimation = normalizeWidgetAnimation(widgetAnimationSelect.value);
      chrome.storage.local.set({ widgetAnimation });
    });
  }

  if (timeFormatSelect || timeSecondsSelect || timeVisibilitySelect || dateVisibilitySelect || weekNumberSelect) {
    chrome.storage.local.get(['timeFormat', 'timeSeconds', 'showTime', 'showDate', 'showWeekNumber'], (result) => {
      timeFormat = result.timeFormat === '12h' ? '12h' : '24h';
      showSeconds = result.timeSeconds !== 'off';
      if (timeVisibilitySelect) {
        const showTime = result.showTime !== 'off';
        timeVisibilitySelect.value = showTime ? 'on' : 'off';
        timeVisibilitySelect.dispatchEvent(new Event('custom-select:sync'));
      }
      if (dateVisibilitySelect) {
        const showDate = result.showDate !== 'off';
        dateVisibilitySelect.value = showDate ? 'on' : 'off';
        dateVisibilitySelect.dispatchEvent(new Event('custom-select:sync'));
      }
      if (weekNumberSelect) {
        const showWeek = result.showWeekNumber !== 'off';
        weekNumberSelect.value = showWeek ? 'on' : 'off';
        weekNumberSelect.dispatchEvent(new Event('custom-select:sync'));
      }
      if (timeFormatSelect) {
        timeFormatSelect.value = timeFormat;
        timeFormatSelect.dispatchEvent(new Event('custom-select:sync'));
      }
      if (timeSecondsSelect) {
        timeSecondsSelect.value = showSeconds ? 'on' : 'off';
        timeSecondsSelect.dispatchEvent(new Event('custom-select:sync'));
      }
    });
  }

  if (timeFormatSelect) {
    timeFormatSelect.addEventListener('change', () => {
      timeFormat = timeFormatSelect.value === '12h' ? '12h' : '24h';
      chrome.storage.local.set({ timeFormat });
    });
  }

  if (timeSecondsSelect) {
    timeSecondsSelect.addEventListener('change', () => {
      showSeconds = timeSecondsSelect.value !== 'off';
      chrome.storage.local.set({ timeSeconds: showSeconds ? 'on' : 'off' });
    });
  }

  if (timeVisibilitySelect) {
    timeVisibilitySelect.addEventListener('change', () => {
      const showTime = timeVisibilitySelect.value !== 'off';
      chrome.storage.local.set({ showTime: showTime ? 'on' : 'off' });
    });
  }

  if (dateVisibilitySelect) {
    dateVisibilitySelect.addEventListener('change', () => {
      const showDate = dateVisibilitySelect.value !== 'off';
      chrome.storage.local.set({ showDate: showDate ? 'on' : 'off' });
    });
  }

  if (weekNumberSelect) {
    weekNumberSelect.addEventListener('change', () => {
      const showWeekNumber = weekNumberSelect.value !== 'off';
      chrome.storage.local.set({ showWeekNumber: showWeekNumber ? 'on' : 'off' });
    });
  }

  // Background
  const backgroundInput = document.getElementById('backgroundInput');
  const backgroundSlideshowInput = document.getElementById('backgroundSlideshowInput');
  const resetBackground = document.getElementById('resetBackground');
  const changeBackground = document.getElementById('changeBackground');
  const changeBackgroundSlideshow = document.getElementById('changeBackgroundSlideshow');
  const toggleBackgroundMenu = document.getElementById('toggleBackgroundMenu');
  const backgroundDropdown = document.getElementById('backgroundDropdown');
  const SLIDESHOW_INTERVAL_OPTIONS = [1, 5, 10, 30, 60, 120, 1440];
  const CUSTOM_INTERVAL_VALUE = 'custom';
  const DEFAULT_SLIDESHOW_INTERVAL_MIN = 5;
  const DEFAULT_SLIDESHOW_SHUFFLE = false;
  let slideshowTimer = null;
  let slideshowImages = [];
  let slideshowCurrentIndex = 0;
  let slideshowNextIndex = 0;
  let slideshowIntervalMin = DEFAULT_SLIDESHOW_INTERVAL_MIN;
  let slideshowShuffle = DEFAULT_SLIDESHOW_SHUFFLE;
  const MAX_IMAGE_DIM = 1920;
  const JPEG_QUALITY = 0.85;

  const slideshowIntervalSelect = document.getElementById('slideshowInterval');
  const slideshowIntervalCustomValue = document.getElementById('slideshowIntervalCustomValue');
  const slideshowIntervalCustomUnit = document.getElementById('slideshowIntervalCustomUnit');
  const slideshowShuffleSelect = document.getElementById('slideshowShuffle');
  const slideshowSettingBlocks = document.querySelectorAll('[data-slideshow-setting]');

  function setBackground(url) {
    const backgroundElement = document.querySelector('.background');
    backgroundElement.style.backgroundImage = `url('${url}')`;
    console.log(chrome.i18n.getMessage("backgroundSet", [url]));
  }

  function normalizeInterval(value) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && SLIDESHOW_INTERVAL_OPTIONS.includes(parsed)) {
      return parsed;
    }
    return DEFAULT_SLIDESHOW_INTERVAL_MIN;
  }

  function normalizeCustomInterval(value) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
    return DEFAULT_SLIDESHOW_INTERVAL_MIN;
  }

  function getCustomIntervalMinutes() {
    if (!slideshowIntervalCustomValue || !slideshowIntervalCustomUnit) {
      return DEFAULT_SLIDESHOW_INTERVAL_MIN;
    }
    const value = normalizeCustomInterval(slideshowIntervalCustomValue.value);
    const unit = slideshowIntervalCustomUnit.value;
    if (unit === 'hours') return value * 60;
    if (unit === 'days') return value * 1440;
    return value;
  }

  function setCustomIntervalInputs(minutes) {
    if (!slideshowIntervalCustomValue || !slideshowIntervalCustomUnit) return;
    let value = minutes;
    let unit = 'minutes';
    if (minutes % 1440 === 0) {
      value = minutes / 1440;
      unit = 'days';
    } else if (minutes % 60 === 0) {
      value = minutes / 60;
      unit = 'hours';
    }
    slideshowIntervalCustomValue.value = String(Math.max(1, value));
    slideshowIntervalCustomUnit.value = unit;
    slideshowIntervalCustomUnit.dispatchEvent(new Event('custom-select:sync'));
  }

  function setCustomIntervalEnabled(isEnabled) {
    if (slideshowIntervalCustomValue) {
      slideshowIntervalCustomValue.disabled = !isEnabled;
    }
    if (slideshowIntervalCustomUnit) {
      slideshowIntervalCustomUnit.disabled = !isEnabled;
    }
  }

  function clearSlideshowTimer() {
    if (slideshowTimer) {
      clearInterval(slideshowTimer);
      slideshowTimer = null;
    }
  }

  function setSlideshowSettingsEnabled(isEnabled) {
    slideshowSettingBlocks.forEach((block) => {
      block.classList.toggle('setting--disabled', !isEnabled);
      block.querySelectorAll('input, select, button').forEach((element) => {
        element.disabled = !isEnabled;
      });
    });
  }

  function getNextIndex(total, currentIndex) {
    if (total <= 1) return currentIndex;
    if (!slideshowShuffle) return (currentIndex + 1) % total;
    let next = currentIndex;
    while (next === currentIndex) {
      next = Math.floor(Math.random() * total);
    }
    return next;
  }

  function startSlideshow(images, startIndex) {
    clearSlideshowTimer();
    slideshowImages = Array.isArray(images) ? images : [];
    if (!slideshowImages.length) {
      return;
    }

    const total = slideshowImages.length;
    const safeIndex = Number.isFinite(startIndex) ? startIndex : 0;
    slideshowCurrentIndex = ((safeIndex % total) + total) % total;
    setBackground(slideshowImages[slideshowCurrentIndex]);

    slideshowNextIndex = getNextIndex(total, slideshowCurrentIndex);
    chrome.storage.local.set({ backgroundSlideshowIndex: slideshowNextIndex });

    if (total > 1) {
      const intervalMs = slideshowIntervalMin * 60 * 1000;
      slideshowTimer = setInterval(() => {
        setBackground(slideshowImages[slideshowNextIndex]);
        slideshowCurrentIndex = slideshowNextIndex;
        slideshowNextIndex = getNextIndex(total, slideshowCurrentIndex);
        chrome.storage.local.set({ backgroundSlideshowIndex: slideshowNextIndex });
      }, intervalMs);
    }
  }

  function applyDefaultBackground() {
    clearSlideshowTimer();
    slideshowImages = [];
    slideshowCurrentIndex = 0;
    slideshowNextIndex = 0;
    setBackground('default.png');
    setSlideshowSettingsEnabled(false);
  }

  chrome.storage.local.get(['backgroundImage', 'backgroundMode', 'backgroundSlideshow', 'backgroundSlideshowIndex', 'backgroundSlideshowInterval', 'backgroundSlideshowIntervalSelection', 'backgroundSlideshowIntervalCustom', 'backgroundSlideshowShuffle'], function (result) {
    const storedSelection = typeof result.backgroundSlideshowIntervalSelection === 'string' ? result.backgroundSlideshowIntervalSelection : '';
    const storedInterval = Number(result.backgroundSlideshowInterval);
    const storedCustom = Number(result.backgroundSlideshowIntervalCustom);
    const storedCustomValid = Number.isFinite(storedCustom) && storedCustom > 0;
    const storedIntervalValid = Number.isFinite(storedInterval) && storedInterval > 0;

    if (storedSelection === CUSTOM_INTERVAL_VALUE) {
      slideshowIntervalMin = storedCustomValid ? storedCustom : DEFAULT_SLIDESHOW_INTERVAL_MIN;
    } else if (storedIntervalValid && SLIDESHOW_INTERVAL_OPTIONS.includes(storedInterval)) {
      slideshowIntervalMin = storedInterval;
    } else if (storedCustomValid) {
      slideshowIntervalMin = storedCustom;
    } else {
      slideshowIntervalMin = DEFAULT_SLIDESHOW_INTERVAL_MIN;
    }

    slideshowShuffle = Boolean(result.backgroundSlideshowShuffle);
    if (slideshowIntervalSelect) {
      if (storedSelection === CUSTOM_INTERVAL_VALUE || !SLIDESHOW_INTERVAL_OPTIONS.includes(slideshowIntervalMin)) {
        slideshowIntervalSelect.value = CUSTOM_INTERVAL_VALUE;
      } else {
        slideshowIntervalSelect.value = String(slideshowIntervalMin);
      }
      slideshowIntervalSelect.dispatchEvent(new Event('custom-select:sync'));
    }
    setCustomIntervalInputs(slideshowIntervalMin);
    setCustomIntervalEnabled(slideshowIntervalSelect && slideshowIntervalSelect.value === CUSTOM_INTERVAL_VALUE);
    if (slideshowShuffleSelect) {
      slideshowShuffleSelect.value = slideshowShuffle ? 'on' : 'off';
      slideshowShuffleSelect.dispatchEvent(new Event('custom-select:sync'));
    }

    const mode = result.backgroundMode;
    const slideshow = Array.isArray(result.backgroundSlideshow) ? result.backgroundSlideshow : [];
    if (mode === 'slideshow' && slideshow.length) {
      const startIndex = Number.isFinite(result.backgroundSlideshowIndex) ? result.backgroundSlideshowIndex : 0;
      startSlideshow(slideshow, startIndex);
      setSlideshowSettingsEnabled(true);
      return;
    }

    const savedBackground = result.backgroundImage;
    if (savedBackground) {
      clearSlideshowTimer();
      slideshowImages = [];
      slideshowCurrentIndex = 0;
      slideshowNextIndex = 0;
      setBackground(savedBackground);
      setSlideshowSettingsEnabled(false);
    } else {
      applyDefaultBackground();
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

  if (changeBackgroundSlideshow && backgroundSlideshowInput) {
    changeBackgroundSlideshow.addEventListener('click', () => {
      backgroundSlideshowInput.click();
      closeBackgroundMenu();
    });
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  async function compressImageFile(file) {
    const dataUrl = await readFileAsDataUrl(file);
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = dataUrl;
    });

    const maxSide = Math.max(image.width, image.height);
    if (!Number.isFinite(maxSide) || maxSide === 0) {
      return dataUrl;
    }

    const scale = Math.min(1, MAX_IMAGE_DIM / maxSide);
    if (scale === 1 && file.size < 1024 * 1024) {
      return dataUrl;
    }

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return dataUrl;
    }
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  }

  function handleStorageError(messageKey) {
    const error = chrome.runtime?.lastError;
    if (!error) return false;
    console.warn(error.message);
    const fallback = 'Failed to save background. Try fewer or smaller images.';
    const message = chrome.i18n.getMessage(messageKey) || fallback;
    alert(message);
    return true;
  }

  if (backgroundInput) {
    backgroundInput.addEventListener('change', async function (event) {
      const file = event.target.files[0];
      if (!file) return;
      try {
        const imageDataUrl = await compressImageFile(file);
        chrome.storage.local.set({ backgroundImage: imageDataUrl, backgroundMode: 'single' }, function () {
          if (handleStorageError('backgroundSaveFailed')) return;
          chrome.storage.local.remove(['backgroundSlideshow', 'backgroundSlideshowIndex'], () => {
            clearSlideshowTimer();
            slideshowImages = [];
            slideshowCurrentIndex = 0;
            slideshowNextIndex = 0;
            setBackground(imageDataUrl);
            setSlideshowSettingsEnabled(false);
            console.log(chrome.i18n.getMessage("backgroundSaved"));
          });
        });
      } catch (error) {
        console.error('Failed to load background image', error);
      }
    });
  }

  if (slideshowIntervalSelect) {
    slideshowIntervalSelect.addEventListener('change', () => {
      const selection = slideshowIntervalSelect.value;
      setCustomIntervalEnabled(selection === CUSTOM_INTERVAL_VALUE);
      let nextInterval = DEFAULT_SLIDESHOW_INTERVAL_MIN;
      if (selection === CUSTOM_INTERVAL_VALUE) {
        nextInterval = getCustomIntervalMinutes();
      } else {
        nextInterval = normalizeInterval(selection);
      }
      slideshowIntervalMin = nextInterval;
      chrome.storage.local.set({
        backgroundSlideshowInterval: nextInterval,
        backgroundSlideshowIntervalSelection: selection,
        backgroundSlideshowIntervalCustom: selection === CUSTOM_INTERVAL_VALUE ? nextInterval : getCustomIntervalMinutes()
      }, () => {
        if (slideshowImages.length && slideshowTimer) {
          startSlideshow(slideshowImages, slideshowCurrentIndex);
        }
      });
    });
  }

  function updateCustomInterval() {
    if (!slideshowIntervalSelect || slideshowIntervalSelect.value !== CUSTOM_INTERVAL_VALUE) return;
    const nextInterval = getCustomIntervalMinutes();
    slideshowIntervalMin = nextInterval;
    chrome.storage.local.set({
      backgroundSlideshowInterval: nextInterval,
      backgroundSlideshowIntervalSelection: CUSTOM_INTERVAL_VALUE,
      backgroundSlideshowIntervalCustom: nextInterval
    }, () => {
      if (slideshowImages.length && slideshowTimer) {
        startSlideshow(slideshowImages, slideshowCurrentIndex);
      }
    });
  }

  if (slideshowIntervalCustomValue) {
    slideshowIntervalCustomValue.addEventListener('change', updateCustomInterval);
  }

  if (slideshowIntervalCustomUnit) {
    slideshowIntervalCustomUnit.addEventListener('change', updateCustomInterval);
  }

  if (slideshowShuffleSelect) {
    slideshowShuffleSelect.addEventListener('change', () => {
      slideshowShuffle = slideshowShuffleSelect.value === 'on';
      chrome.storage.local.set({ backgroundSlideshowShuffle: slideshowShuffle }, () => {
        if (slideshowImages.length && slideshowTimer) {
          startSlideshow(slideshowImages, slideshowCurrentIndex);
        }
      });
    });
  }

  if (backgroundSlideshowInput) {
    backgroundSlideshowInput.addEventListener('change', async (event) => {
      const files = Array.from(event.target.files || []).filter((file) => file.type.startsWith('image/'));
      if (!files.length) {
        const message = chrome.i18n.getMessage('backgroundSlideshowEmpty') || 'No images found in folder.';
        alert(message);
        return;
      }

      files.sort((a, b) => {
        const aKey = a.webkitRelativePath || a.name;
        const bKey = b.webkitRelativePath || b.name;
        return aKey.localeCompare(bKey);
      });

      try {
        const images = await Promise.all(files.map(compressImageFile));
        chrome.storage.local.set({ backgroundMode: 'slideshow', backgroundSlideshow: images }, () => {
          if (handleStorageError('backgroundSaveFailed')) return;
          chrome.storage.local.remove(['backgroundImage'], () => {
            startSlideshow(images, 0);
            setSlideshowSettingsEnabled(true);
          });
        });
      } catch (error) {
        console.error('Failed to load slideshow images', error);
      }
    });
  }

  if (resetBackground) {
    resetBackground.addEventListener('click', function () {
      chrome.storage.local.remove(['backgroundImage', 'backgroundSlideshow', 'backgroundSlideshowIndex', 'backgroundMode'], function () {
        applyDefaultBackground();
        console.log(chrome.i18n.getMessage("backgroundReset"));
      });
      closeBackgroundMenu();
    });
  }

  // Clock and Date
  function updateTime() {
    const now = new Date();
    const clockEl = document.getElementById("clockDiv");
    const dateEl = document.getElementById("dateDiv");
    const timeOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: timeFormat === '12h'
    };
    if (showSeconds) {
      timeOptions.second = '2-digit';
    }
    const timeString = now.toLocaleTimeString(chrome.i18n.getUILanguage(), timeOptions);
    if (clockEl) {
      if (timeVisibilitySelect && timeVisibilitySelect.value === 'off') {
        clockEl.style.display = 'none';
      } else {
        clockEl.style.display = '';
        clockEl.innerHTML = timeString;
      }
    }

    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = now.toLocaleDateString(chrome.i18n.getUILanguage(), options);
    const currentThursday = new Date(now.getTime() + (3 - ((now.getDay() + 6) % 7)) * 86400000);
    const yearOfThursday = currentThursday.getFullYear();
    const firstThursday = new Date(new Date(yearOfThursday, 0, 4).getTime() + (3 - ((new Date(yearOfThursday, 0, 4).getDay() + 6) % 7)) * 86400000);
    let weekNumber = Math.floor(1 + 0.5 + (currentThursday.getTime() - firstThursday.getTime()) / 86400000 / 7);
    weekNumber = ("0" + weekNumber).slice(-2);
    const weekLabel = chrome.i18n.getMessage("weekLabel", [weekNumber]) || `KW ${weekNumber}`;
    const showWeek = !weekNumberSelect || weekNumberSelect.value !== 'off';
    const dateStringWithWeek = showWeek ? `${dateString} <span class="week-number"> - ${weekLabel}</span>` : dateString;
    if (dateEl) {
      if (dateVisibilitySelect && dateVisibilitySelect.value === 'off') {
        dateEl.style.display = 'none';
      } else {
        dateEl.style.display = '';
        dateEl.innerHTML = dateStringWithWeek;
      }
    }

    const msUntilNextSecond = 1000 - now.getMilliseconds();
    setTimeout(updateTime, msUntilNextSecond);
  }

  updateTime();
}
