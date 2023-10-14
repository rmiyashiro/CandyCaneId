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

function sendMessage(action, value) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action, value });
    });
}

function updateSettings(settings) {
    chrome.storage.local.set({candycaneidSettings: settings});
}

document.addEventListener('DOMContentLoaded', async function () {
    const saturation = getSaturationRange();
    const lightness = getLightnessRange();
    const saturationNum = getSaturationNum();
    const lightnessNum = getLightnessNum();

    const storage = await chrome.storage.local.get({candycaneidSettings: {saturation: 50, lightness: 60}});
    const settings = storage.candycaneidSettings;
    saturation.value = saturationNum.value = settings.saturation;
    lightness.value = lightnessNum.value = settings.lightness;

    saturation.addEventListener('change', function () {
        saturationNum.value = saturation.value;
        sendMessage('candycaneidSaturation', saturation.value);
    });

    lightness.addEventListener('change', function () {
        lightnessNum.value = lightness.value;
        sendMessage('candycaneidLightness', lightness.value);
    });

    saturationNum.addEventListener('change', function () {
        saturation.value = saturationNum.value;
        sendMessage('candycaneidSaturation', saturation.value);
    });

    lightnessNum.addEventListener('change', function () {
        lightness.value = lightnessNum.value;
        sendMessage('candycaneidLightness', lightness.value);
    });
});

