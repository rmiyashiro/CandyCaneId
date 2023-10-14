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

function sendMessage({saturation, lightness}) {
  chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
    if (saturation) {
      chrome.tabs.sendMessage(tabs[0].id,
          {action: `candycaneid-saturation`, value: saturation});
    }
    if (lightness) {
      chrome.tabs.sendMessage(tabs[0].id,
          {action: `candycaneid-lightness`, value: lightness});
    }
  });
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
  sendMessage({saturation});
  updateSettings({saturation});
}

function setLightness(lightness) {
  getLightnessNum().value = lightness;
  getLightnessRange().value = lightness;
  sendMessage({lightness});
  updateSettings({lightness});
}

document.addEventListener('DOMContentLoaded', async function () {
  chrome.storage.local.get(
      {candycaneidSettings: {saturation: 50, lightness: 60}}).then(
      ({candycaneidSettings}) => {
        const {saturation, lightness} = candycaneidSettings;
        setSaturation(saturation);
        setLightness(lightness);
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
});

