const IS_OBJECT_ID = /^[0-9a-fA-F]{24}$/;
const CONTAINS_OBJECT_ID = /\b[0-9a-fA-F]{24}\b/g;
const ONE_DAY = 1000 * 60 * 60 * 24;
const FIVE_YEARS = ONE_DAY * 365 * 5;
const CSS_SATURATION = '--candycaneid-sat';
const CSS_LIGHTNESS = '--candycaneid-lit';
const CSS_TEXT = '--candycaneid-text';
const CSS_ANGLE = '--candycaneid-angle';
const CSS_BLUR = '--candycaneid-blur';
const HUES_FULL = [[0, 360]];
const HUES_COLORBLIND = [[40, 60], [170, 360]];

let candyCaneIdStyles;
let candyCaneIdEnabled = false;

let contrast = 5;
let allowedHues = HUES_FULL;
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
      candyCaneIdStyles.textContent = `:root { ${CSS_SATURATION}: 60%; ${CSS_LIGHTNESS}: 50%; ${CSS_ANGLE}: 110deg; ${CSS_BLUR}: 3%; ${CSS_TEXT}: white;}\n`
          +
          `.candycaneid { color: var(${CSS_TEXT}) !important; border-radius: 2px; }\n`;
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
    const oid = ids[i].textContent;
    if (oid) {
      objectids.add(oid);
    }
  }
  generateCss([...objectids]);
}

function getRootCss() {
  return document.querySelector(':root');
}

function setSaturation(saturation) {
  getRootCss().style.setProperty(CSS_SATURATION, `${saturation}%`);
}

function setLightness(lightness) {
  const r = getRootCss();
  r.style.setProperty(CSS_LIGHTNESS, `${lightness}%`);
  r.style.setProperty(CSS_TEXT,
      lightness > 60 ? 'black' : 'white');
}

function setAngle(angle) {
  getRootCss().style.setProperty(CSS_ANGLE, `${angle}deg`)
}

function setBlur(blur) {
  getRootCss().style.setProperty(CSS_BLUR, `${blur}%`)
}

function setHues(hues) {
  hueRanges = {...hueRanges, ...hues};
  if (candyCaneIdEnabled) {
    regenerateCss();
  }
}

function setColorBlindEnabled(enabled) {
  const newContrast = enabled ? 10 : 5;
  if (newContrast !== contrast) {
    contrast = newContrast;
    allowedHues = enabled ? HUES_COLORBLIND : HUES_FULL;
    if (candyCaneIdEnabled) {
      regenerateCss();
    }
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
  const gradient = generateGradient([ageBg, dayBg, machineBg, counterBg],
      [13, 33, 75])

  return `.candycaneid-${objectId} { background-image: linear-gradient( var(${CSS_ANGLE}), ${gradient} ); }`;
}

function generateGradient(colors, borderPcts) {
  return borderPcts.map(
      (b, i) => `${colors[i]} calc(${b}% - var(${CSS_BLUR})), ${b}%, ${colors[i
      + 1]} calc(${b}% + var(${CSS_BLUR}))`).join(", ");
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
  return `hsl(${hue}, var(${CSS_SATURATION}), var(${CSS_LIGHTNESS}))`;
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

function needsColorizing(node) {
  // already processed
  if (node.parentNode.classList.contains('candycaneid')) {
    return false;
  }
  if (!CONTAINS_OBJECT_ID.test(node.nodeValue)) {
    return false;
  }
  // skip elements inside textarea
  let p = node.parentNode;
  while (p) {
    if (p.tagName === 'TEXTAREA') {
      return false;
    }
    p = p.parentNode;
  }
  return true;
}

function collectObjectIds(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null,
      false);
  const objectIds = [];

  let textNode;
  while ((textNode = walker.nextNode())) {
    if (needsColorizing(textNode)) {
      const textContent = textNode.nodeValue;
      objectIds.push({textNode, textContent});
    }
  }

  return objectIds;
}

function colorizeObjectIds(root) {
  const uniqueIds = new Set();
  const objectIds = collectObjectIds(root);
  objectIds.forEach(({textNode, textContent}) => {
    // if textContent is only the objectId, just add CSS classes to existing node
    if (IS_OBJECT_ID.test(textContent)) {
      const oid = textContent.toLowerCase();
      uniqueIds.add(oid);
      textNode.parentNode.classList.add('candycaneid',
          `candycaneid-${oid}`);
    } else {
      // otherwise, create a new span around each objectId in the text
      const coloredText = textContent.replace(CONTAINS_OBJECT_ID, (match) => {
        const oid = match.toLowerCase();
        uniqueIds.add(oid);
        const timestamp = match.slice(0, 8); // 4 bytes
        const date = new Date(parseInt(timestamp, 16) * 1000); // Convert to milliseconds
        return `<span title="${date}" class="candycaneid candycaneid-${oid}">${match}</span>`;
      });

      const newNode = document.createElement("span");
      newNode.innerHTML = coloredText;

      textNode.parentNode.replaceChild(newNode, textNode);
    }
  });
  if (candyCaneIdEnabled) {
    generateCss([...uniqueIds]);
  }
}

chrome.runtime.onMessage.addListener(function (request) {
  switch (request.action) {
    case 'candycaneid-saturation':
      setSaturation(request.value);
      break;
    case 'candycaneid-lightness':
      setLightness(request.value);
      break;
    case 'candycaneid-angle':
      setAngle(request.value);
      break;
    case 'candycaneid-blur':
      setBlur(request.value);
      break;
    case 'candycaneid-hues':
      setHues(request.value);
      break;
    case 'candycaneid-colorblind':
      setColorBlindEnabled(!!request.value);
      break;
    case 'candycaneid-enabled':
      if (candyCaneIdEnabled !== request.value) {
        candyCaneIdEnabled = request.value;
        if (candyCaneIdEnabled) {
          regenerateCss();
        } else {
          clearCss();
        }
      }
      break;
    default:
      //ignore
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

