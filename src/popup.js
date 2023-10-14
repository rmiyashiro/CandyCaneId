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

function getEnabledCheckbox() {
  return document.getElementById('enabled');
}

function updateSettings(settings) {
  chrome.storage.local.get({candycaneidSettings: {}}).then(
      ({candycaneidSettings}) => {
        chrome.storage.local.set(
            {candycaneidSettings: {...candycaneidSettings, ...settings}});
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
        const {saturation, lightness, enabled} = candycaneidSettings;
        setSaturation(saturation);
        setLightness(lightness);
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

  getEnabledCheckbox().addEventListener('change', function (e) {
    setEnabled(!!e.target.checked);
  });
});

