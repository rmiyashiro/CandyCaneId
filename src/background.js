async function sendMessage({saturation, luminance, enabled, hues}) {
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
    chrome.storage.local.get(
        {
          candycaneidSettings: {
            saturation: 50,
            luminance: 60,
            enabled: true
          }
        }).then(
        ({candycaneidSettings}) => {
          sendMessage(candycaneidSettings);
        });
  }
});