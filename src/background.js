async function sendMessage({
  enabled,
  saturation,
  lightness,
  blur,
  angle,
  hues,
  colorblind
}) {
  try {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});

    function doSend(m) {
      chrome.tabs.sendMessage(tab.id, m);
    }

    if (saturation) {
      doSend({action: `candycaneid-saturation`, value: saturation});
    }
    if (lightness) {
      doSend({action: `candycaneid-lightness`, value: lightness});
    }
    if (hues) {
      doSend({action: `candycaneid-hues`, value: hues});
    }
    if (blur >= 0) {
      doSend({action: `candycaneid-blur`, value: blur});
    }
    if (angle >= 0) {
      doSend({action: `candycaneid-angle`, value: angle});
    }
    doSend({action: `candycaneid-enabled`, value: !!enabled});
    doSend({action: `candycaneid-colorblind`, value: !!colorblind});
  } catch (e) {
    console.log(e);
    // ignore
  }
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