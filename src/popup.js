const DEFAULT_SETTINGS = {
  hues: {
    age: {start: 120, range: 240},
    season: {start: 240, range: -360},
    machine: {start: 0, range: 360},
    counter: {start: 0, range: 360}
  },
  saturation: 50,
  lightness: 60,
  enabled: true
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
  chrome.storage.local.get({candycaneidSettings: {}}).then(
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

function setLightness(lightness) {
  getLightnessNum().value = lightness;
  getLightnessRange().value = lightness;
  updateSettings({lightness});
}

function setHues(hues) {
  const {machine, counter} = hues;
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

document.addEventListener('DOMContentLoaded', async function () {
  chrome.storage.local.get(
      {
        candycaneidSettings: DEFAULT_SETTINGS
      }).then(
      ({candycaneidSettings}) => {
        const {saturation, lightness, enabled, hues} = candycaneidSettings;
        setSaturation(saturation);
        setLightness(lightness);
        setHues(hues);
        setEnabled(enabled);
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

  getMachineHueRange().addEventListener('change', function (e) {
    setHues({machine: {start: Number(e.target.value), range: 360}});
  });

  getCounterHueRange().addEventListener('change', function (e) {
    setHues({counter: {start: Number(e.target.value), range: 360}});
  });

  getEnabledCheckbox().addEventListener('change', function (e) {
    setEnabled(!!e.target.checked);
  });
});

