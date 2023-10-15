const OBJECT_ID_REGEX = /\b[0-9a-fA-F]{24}\b/g;
const ONE_DAY = 1000 * 60 * 60 * 24;
const FIVE_YEARS = ONE_DAY * 365 * 5;
const CSS_SATURATION = '--candycaneid-sat';
const CSS_LUMINANCE = '--candycaneid-lum';
const CSS_TEXT = '--candycaneid-text';

let candyCaneIdStyles;
let candyCaneIdEnabled = false;

let contrast = 5;
let allowedHues = [[0, 360]];
let hueRanges = {
  age: {start: 120, range: 240},
  season: {start: 240, range: -360},
  machine: {start: 0, range: 360},
  counter: {start: 0, range: 360}
}

function generateCss(objectIds) {
  if (objectIds && objectIds.length) {
    if (!candyCaneIdStyles) {
      candyCaneIdStyles = document.createElement('style');
      candyCaneIdStyles.textContent = `:root { ${CSS_SATURATION}: 60%; ${CSS_LUMINANCE}: 50%; ${CSS_TEXT}: white;}\n`
          +
          `.candycaneid-timestamp {color: var(${CSS_TEXT});}\n` +
          `.candycaneid-machine {color: var(${CSS_TEXT});}\n` +
          `.candycaneid-counter {color: var(${CSS_TEXT});}\n`;
      document.head.appendChild(candyCaneIdStyles);
    }
    candyCaneIdStyles.textContent += objectIds.map(generateObjectIdCss).join(
        "\n");
  }
}

function clearCss() {
  if (candyCaneIdStyles) {
    candyCaneIdStyles.remove();
    candyCaneIdStyles = undefined;
  }
}

function regenerateCss() {
  clearCss();
  const ids = document.body.getElementsByClassName('candycaneid');
  const objectids = new Set();
  for (let i = 0; i < ids.length; i++) {
    const oid = ids[i].getAttribute('objectid');
    if (oid) {
      objectids.add(oid);
    }
  }
  generateCss([...objectids]);
}

function setSaturation(saturation) {
  const r = document.querySelector(':root');
  r.style.setProperty(CSS_SATURATION, `${saturation}%`);
}

function setLuminance(luminance) {
  const r = document.querySelector(':root');
  r.style.setProperty(CSS_LUMINANCE, `${luminance}%`);
  r.style.setProperty(CSS_TEXT,
      luminance > 60 ? 'black' : 'white');
}

function setHues(hues) {
  hueRanges = {...hueRanges, ...hues};
  if (candyCaneIdEnabled) {
    regenerateCss();
  }
}

function generateObjectIdCss(objectId) {
  const timestamp = objectId.slice(0, 8); // 4 bytes
  const machine = objectId.slice(8, 18); // 5 bytes
  const counter = objectId.slice(18, 24); // 3 bytes

  // Parse the date segment
  const date = new Date(parseInt(timestamp, 16) * 1000); // Convert to milliseconds

  const ageBg = ageToColor(date);
  const dayBg = dayToColor(date);
  const machineBg = machineToColor(machine);
  const counterBg = counterToColor(counter);

  return `.candycaneid-${objectId} { border-radius: 2px; background-image: linear-gradient(110deg, ${ageBg} 10%, 13%, ${dayBg} 30%, 33%, ${machineBg} 36%, ${machineBg} 72%, 75%, ${counterBg} 78%); }`;
}

function hashCode(inputString) {
  let hash = 0;
  if (inputString.length === 0) {
    return hash;
  }

  for (let i = inputString.length - 1; i >= 0; i--) {
    const char = inputString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
  }

  // Apply additional bitwise operations to increase chaos
  hash = (hash << 13) ^ hash;

  return hash;
}

function ageToColor(date) {
  const now = new Date();
  const timeDifference = Math.max(now - date, 0);

  // Calculate the hue based on the time difference
  const scaledDifference = Math.min(timeDifference, FIVE_YEARS); // Cap the difference

  return hueFractionToColor(scaledDifference / FIVE_YEARS, hueRanges.age);
}

function dayToColor(date) {
  // Get the day of the year (0-365)
  const dayOfYear = (date - new Date(date.getFullYear(), 0, 0)) / ONE_DAY;
  return hueFractionToColor(dayOfYear / 365, hueRanges.season);
}

function hashToColor(str, hueRange) {
  return hueFractionToColor(Math.abs(hashCode(str)) % 360 / 360, hueRange);
}

function machineToColor(machine) {
  return hashToColor(machine, hueRanges.machine);
}

function counterToColor(counter) {
  return hashToColor(counter, hueRanges.counter);
}

function hueFractionToColor(fraction, {start, range}) {
  const normalizedHue = (((start + fraction * range) % 360) + 360) % 360;
  const allowedHue = toAllowedHue(normalizedHue);
  return hueToColor(allowedHue);
}

function hueToColor(hue) {
  return `hsl(${hue}, var(${CSS_SATURATION}), var(${CSS_LUMINANCE}))`;
}

function toAllowedHue(hue) {
  // rescale hue to fit in the allowed range
  const totalAllowed = allowedHues.map(range => range[1] - range[0]).reduce(
      (sum, r) => sum + r);
  // apply contrast
  hue = Math.round(hue / contrast) * contrast;
  let allowedHueIndex = hue / 360 * totalAllowed;
  for (let i = 0; i < allowedHues.length; i++) {
    const range = allowedHues[i];
    const rangeSize = range[1] - range[0];
    // if the index is in this range
    if (allowedHueIndex <= 0) {
      return range[0];
    } else if (allowedHueIndex < rangeSize) {
      // return the hue at the index in the range
      return range[0] + allowedHueIndex;
    } else {
      // index into next range
      allowedHueIndex -= rangeSize;
    }
  }
  // return last allowed hue
  return allowedHues[allowedHues.length - 1][1];
}

function collectObjectIds(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null,
      false);
  const objectIds = [];

  let textNode;
  while ((textNode = walker.nextNode())) {
    const textContent = textNode.nodeValue;
    if (OBJECT_ID_REGEX.test(textContent)) {
      objectIds.push({textNode, textContent});
    }
  }

  return objectIds;
}

function colorizeObjectIds(root) {
  const uniqueIds = new Set();
  const objectIds = collectObjectIds(root);
  objectIds.forEach(({textNode, textContent}) => {
    const coloredText = textContent.replace(OBJECT_ID_REGEX, (match) => {
      uniqueIds.add(match);
      const timestamp = match.slice(0, 8); // 4 bytes
      const machine = match.slice(8, 18); // 5 bytes
      const counter = match.slice(18, 24); // 3 bytes
      const date = new Date(parseInt(timestamp, 16) * 1000); // Convert to milliseconds

      return `<span title="${date}" class="candycaneid candycaneid-${match}" objectid="${match}"><span class="candycaneid-timestamp">${timestamp}</span><span class="candycaneid-machine">${machine}</span><span class="candycaneid-counter">${counter}</span></span>`;
    });

    const newNode = document.createElement("span");
    newNode.innerHTML = coloredText;

    textNode.parentNode.replaceChild(newNode, textNode);
  });
  if (candyCaneIdEnabled) {
    generateCss([...uniqueIds]);
  }
}

chrome.runtime.onMessage.addListener(function (request) {
  if (request.action === 'candycaneid-saturation') {
    setSaturation(request.value);
  }
  if (request.action === 'candycaneid-luminance') {
    setLuminance(request.value);
  }
  if (request.action === 'candycaneid-hues') {
    setHues(request.value);
  }
  if (request.action === 'candycaneid-enabled') {
    if (candyCaneIdEnabled !== request.value) {
      candyCaneIdEnabled = request.value;
      if (candyCaneIdEnabled) {
        regenerateCss();
      } else {
        clearCss();
      }
    }
  }
});

// Observe changes to the DOM and apply colorization when new content is added
const observer = new MutationObserver((mutationsList) => {
  for (const mutation of mutationsList) {
    if (mutation.addedNodes.length > 0) {
      mutation.addedNodes.forEach((addedNode) => {
        if (addedNode.nodeType === Node.ELEMENT_NODE) {
          colorizeObjectIds(addedNode);
        }
      });
    }
  }
});

document.addEventListener("DOMContentLoaded", function () {
  colorizeObjectIds(document.body);
  observer.observe(document.body, {childList: true, subtree: true});
  chrome.runtime.sendMessage({candycaneidLoaded: true});
});

