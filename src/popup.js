document.addEventListener('DOMContentLoaded', function () {
    const saturation = document.getElementById('saturation');
    saturation.addEventListener('change', function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'candycaneidSaturation', value: saturation.value });
        });
    });

    const luminance = document.getElementById('luminance');
    luminance.addEventListener('change', function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'candycaneidLuminance', value: luminance.value });
        });
    });
});

