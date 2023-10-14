let candycaneidLoaded = false;

function sendMessage({saturation, lightness, enabled}) {
  if (candycaneidLoaded) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
      if (tabs && tabs.length && tabs[0]) {
        const activeTab = tabs[0];

        function doSend(m) {
          chrome.tabs.sendMessage(activeTab.id, m);
        }

        if (saturation) {
          doSend({action: `candycaneid-saturation`, value: saturation});
        }
        if (lightness) {
          doSend({action: `candycaneid-lightness`, value: lightness});
        }
        doSend({action: `candycaneid-enabled`, value: !!enabled});
      }
    });
  }
}

chrome.storage.onChanged.addListener(function (changes, areaName) {
  if (areaName === "local") {
    if (changes.hasOwnProperty('candycaneidSettings')) {
      sendMessage(changes.candycaneidSettings.newValue);
    }
  }
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.candycaneidLoaded === true) {
    candycaneidLoaded = true;

    chrome.storage.local.get(
        {
          candycaneidSettings: {
            saturation: 50,
            lightness: 60,
            enabled: true
          }
        }).then(
        ({candycaneidSettings}) => {
          sendMessage(candycaneidSettings);
        });
  }
});