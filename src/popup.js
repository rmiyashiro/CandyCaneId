const DEFAULT_SETTINGS = {
  hues: {
    age: {start: 120, range: 240},
    season: {start: 240, range: -360},
    machine: {start: 0, range: 360},
    counter: {start: 0, range: 360}
  },
  saturation: 60,
  luminance: 50,
  enabled: true
};

function getSaturationRange() {
  return document.getElementById('saturation');
}

function getLuminanceRange() {
  return document.getElementById('luminance');
}

function getSaturationNum() {
  return document.getElementById('saturationNum');
}

function getLuminanceNum() {
  return document.getElementById('luminanceNum');
}

function getAgeHueRange() {
  return document.getElementById('ageHue');
}

function getSeasonHueRange() {
  return document.getElementById('seasonHue');
}

function getMachineHueRange() {
  return document.getElementById('machineHue');
}

function getCounterHueRange() {
  return document.getElementById('counterHue');
}

function getEnabledCheckbox() {
  return document.getElementById('enabled');
}

function updateSettings(settings) {
  chrome.storage.local.get({candycaneidSettings: DEFAULT_SETTINGS}).then(
      ({candycaneidSettings}) => {
        const {hues} = settings;
        chrome.storage.local.set(
            {
              candycaneidSettings: {
                ...candycaneidSettings,
                ...settings,
                hues: {
                  ...candycaneidSettings.hues,
                  ...hues
                }
              }
            });
      });
}

function setSaturation(saturation) {
  getSaturationNum().value = saturation;
  getSaturationRange().value = saturation;
  updateSettings({saturation});
}

function setLuminance(luminance) {
  getLuminanceNum().value = luminance;
  getLuminanceRange().value = luminance;
  updateSettings({luminance});
}

function setHues(hues) {
  const {age, season, machine, counter} = hues;
  if (age) {
    getAgeHueRange().value = age.start;
  }
  if (season) {
    getSeasonHueRange().value = season.start;
  }
  if (machine) {
    getMachineHueRange().value = machine.start;
  }
  if (counter) {
    getCounterHueRange().value = counter.start;
  }
  updateSettings({hues});
}

function setEnabled(enabled) {
  getEnabledCheckbox().checked = enabled;
  updateSettings({enabled});
  document.getElementById('body').classList.toggle('enabled', enabled);
}

function initialize(settings) {
  const {saturation, luminance, enabled, hues} = settings;
  setSaturation(saturation);
  setLuminance(luminance);
  setHues(hues);
  setEnabled(enabled);
}

document.addEventListener('DOMContentLoaded', async function () {
  chrome.storage.local.get(
      {
        candycaneidSettings: DEFAULT_SETTINGS
      }).then(
      ({candycaneidSettings}) => {
        initialize(candycaneidSettings);
      });

  getSaturationRange().addEventListener('change', function (e) {
    setSaturation(Number(e.target.value));
  });

  getLuminanceRange().addEventListener('change', function (e) {
    setLuminance(Number(e.target.value));
  });

  getSaturationNum().addEventListener('change', function (e) {
    setSaturation(Number(e.target.value));
  });

  getLuminanceNum().addEventListener('change', function (e) {
    setLuminance(Number(e.target.value));
  });

  getAgeHueRange().addEventListener('change', function (e) {
    setHues({age: {start: Number(e.target.value), range: 240}});
  });

  getSeasonHueRange().addEventListener('change', function (e) {
    setHues({season: {start: Number(e.target.value), range: -360}});
  });

  getMachineHueRange().addEventListener('change', function (e) {
    setHues({machine: {start: Number(e.target.value), range: 360}});
  });

  getCounterHueRange().addEventListener('change', function (e) {
    setHues({counter: {start: Number(e.target.value), range: 360}});
  });

  getEnabledCheckbox().addEventListener('change', function (e) {
    setEnabled(!!e.target.checked);
  });

  document.getElementById('title').addEventListener('dblclick', function () {
    chrome.storage.local.set({candycaneidSettings: DEFAULT_SETTINGS});
    initialize(DEFAULT_SETTINGS);
  });
});

