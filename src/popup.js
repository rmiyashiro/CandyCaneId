const DEFAULT_SETTINGS = {
  hues: {
    age: {start: 120, range: 240},
    season: {start: 240, range: -360},
    machine: {start: 0, range: 360},
    counter: {start: 0, range: 360}
  },
  saturation: 60,
  lightness: 50,
  angle: 110,
  blur: 3,
  enabled: true,
  colorblind: false
};

function getSaturationRange() {
  return document.getElementById('saturation');
}

function getLightnessRange() {
  return document.getElementById('lightness');
}

function getSaturationNum() {
  return document.getElementById('saturationNum');
}

function getLightnessNum() {
  return document.getElementById('lightnessNum');
}

function getBlurCheckbox() {
  return document.getElementById('blur');
}

function getAngleRange() {
  return document.getElementById('angle');
}

function getAngleNum() {
  return document.getElementById('angleNum');
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

function getColorblindCheckbox() {
  return document.getElementById('colorblind');
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
  document.querySelector(':root').style.setProperty("--sat", `${saturation}%`);
  getSaturationNum().value = saturation;
  getSaturationRange().value = saturation;
  updateSettings({saturation});
}

function setLightness(lightness) {
  document.querySelector(':root').style.setProperty("--lit", `${lightness}%`);
  getLightnessNum().value = lightness;
  getLightnessRange().value = lightness;
  updateSettings({lightness});
}

function setBlur(blur) {
  getBlurCheckbox().checked = blur > 0;
  updateSettings({blur});
}

function setAngle(angle) {
  document.querySelector(':root').style.setProperty("--angle", `${angle}deg`);
  getAngleRange().value = angle;
  getAngleNum().value = angle;
  updateSettings({angle});
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
  document.getElementById('body').classList.toggle('disabled', !enabled);
}

function setColorblind(colorblind) {
  getColorblindCheckbox().checked = colorblind;
  updateSettings({colorblind});
  document.getElementById('body').classList.toggle('colorblind', colorblind);
}

function initialize(settings) {
  const {
    enabled,
    saturation,
    lightness,
    blur,
    angle,
    colorblind,
    hues
  } = settings;
  setSaturation(saturation);
  setLightness(lightness);
  setBlur(blur);
  setAngle(angle);
  setHues(hues);
  setEnabled(enabled);
  setColorblind(colorblind);
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

  getLightnessRange().addEventListener('change', function (e) {
    setLightness(Number(e.target.value));
  });

  getSaturationNum().addEventListener('change', function (e) {
    setSaturation(Number(e.target.value));
  });

  getLightnessNum().addEventListener('change', function (e) {
    setLightness(Number(e.target.value));
  });

  getBlurCheckbox().addEventListener('change', function (e) {
    setBlur(!!e.target.checked ? 3 : 0);
  });

  getAngleRange().addEventListener('change', function (e) {
    setAngle(Number(e.target.value));
  });

  getAngleNum().addEventListener('change', function (e) {
    setAngle(Number(e.target.value));
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

  getColorblindCheckbox().addEventListener('change', function (e) {
    setColorblind(!!e.target.checked);
  })

  document.getElementById('title').addEventListener('dblclick', function () {
    chrome.storage.local.set({candycaneidSettings: DEFAULT_SETTINGS});
    initialize(DEFAULT_SETTINGS);
  });
});

