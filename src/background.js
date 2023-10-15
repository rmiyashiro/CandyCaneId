async function sendMessage({saturation, luminance, enabled, hues, colorblind}) {
  const [tab] = await chrome.tabs.query({active: true, currentWindow: true});

  function doSend(m) {
    chrome.tabs.sendMessage(tab.id, m);
  }

  if (saturation) {
    doSend({action: `candycaneid-saturation`, value: saturation});
  }
  if (luminance) {
    doSend({action: `candycaneid-luminance`, value: luminance});
  }
  if (hues) {
    doSend({action: `candycaneid-hues`, value: hues});
  }
  doSend({action: `candycaneid-enabled`, value: !!enabled});
  doSend({action: `candycaneid-colorblind`, value: !!colorblind});
}

chrome.storage.onChanged.addListener(function (changes, areaName) {
  if (areaName === "local") {
    if (changes.hasOwnProperty('candycaneidSettings')) {
      sendMessage(changes.candycaneidSettings.newValue);
    }
  }
});

chrome.runtime.onMessage.addListener(function (message) {
  if (message.candycaneidLoaded === true) {
    chrome.storage.local.get({candycaneidSettings: {}}).then(
        ({candycaneidSettings}) => {
          if (Object.keys(candycaneidSettings).length !== 0) {
            sendMessage(candycaneidSettings);
          }
        });
  }
});