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
        candycaneidSettings: {
          saturation: 50,
          lightness: 60,
          enabled: true
        }
      }).then(
      ({candycaneidSettings}) => {
        const {saturation, lightness, enabled, hues} = candycaneidSettings;
        setSaturation(saturation);
        setLightness(lightness);
        setHues(hues);
        setEnabled(enabled);
      });

  getSaturationRange().addEventListener('change', function (e) {
    setSaturation(e.target.value);
  });

  getLightnessRange().addEventListener('change', function (e) {
    setLightness(e.target.value);
  });

  getSaturationNum().addEventListener('change', function (e) {
    setSaturation(e.target.value);
  });

  getLightnessNum().addEventListener('change', function (e) {
    setLightness(e.target.value);
  });

  getMachineHueRange().addEventListener('change', function (e) {
    setHues({machine: {start: e.target.value, range: 360}});
  });

  getCounterHueRange().addEventListener('change', function (e) {
    setHues({counter: {start: e.target.value, range: 360}});
  });

  getEnabledCheckbox().addEventListener('change', function (e) {
    setEnabled(!!e.target.checked);
  });
});

