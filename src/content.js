const OBJECT_ID_REGEX = /\b[0-9a-fA-F]{24}\b/g;
const FIVE_YEARS = 1000 * 60 * 60 * 24 * 365 * 5; // 5 years in milliseconds

let candyCaneIdStyles;

function generateCss(objectIds) {
  if(objectIds && objectIds.length) {
    if(!candyCaneIdStyles) {
      candyCaneIdStyles = document.createElement('style');
      candyCaneIdStyles.textContent = ':root { --candycaneid-sat: 60%; --candycaneid-lit: 50%; --candycaneid-text: white;}\n' +
        '.candycaneid-timestamp {color: var(--candycaneid-text);}\n' +
        '.candycaneid-machine {color: var(--candycaneid-text);}\n' +
        '.candycaneid-counter {color: var(--candycaneid-text);}\n';
      document.head.appendChild(candyCaneIdStyles);
    }
    candyCaneIdStyles.textContent += objectIds.map(generateObjectIdCss).join("\n");
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
  const machineBg = hashToColor(hashCode(machine));
  const counterBg = hashToColor(hashCode(counter));

  return `.candycaneid-${objectId} { border-radius: 2px; background-image: linear-gradient(110deg, ${ageBg} 10%, 13%, ${dayBg} 30%, 33%, ${machineBg} 36%, ${machineBg} 72%, 75%, ${counterBg} 78%); }`;
}

function hashCode(inputString) {
  let hash = 0;
  if (inputString.length === 0) return hash;

  for (let i = inputString.length-1; i >= 0; i--) {
    const char = inputString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
  }

  // Apply additional bitwise operations to increase chaos
  hash = (hash << 13) ^ hash;

  return hash;
}

function dayToColor(date) {
  // Get the day of the year (0-365)
  const dayOfYear = (date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24);

  // Calculate the hue based on the day of the year with a shift
  const hue = (240 - (dayOfYear / 365) * 360) % 360

  return hueToColor(hue);
}

function ageToColor(date) {
  const now = new Date();
  const timeDifference = Math.max(now - date, 0);
  
  // Calculate the hue based on the time difference
  const scaledDifference = Math.min(timeDifference, FIVE_YEARS); // Cap the difference
  const hue = 120 + (scaledDifference / FIVE_YEARS) * 240; // Map to hue (120-360)

  return hueToColor(hue);
}

function hashToColor(hash) {
  return hueToColor((Math.abs(hash) % 360)); // Use the hash as the hue value
}

function hueToColor(hue) {
  return `hsl(${hue}, var(--candycaneid-sat), var(--candycaneid-lit))`;
}

function collectObjectIds(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
  const objectIds = [];

  let textNode;
  while ((textNode = walker.nextNode())) {
    const textContent = textNode.nodeValue;
    if (OBJECT_ID_REGEX.test(textContent)) {
      objectIds.push({ textNode, textContent });
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

          return `<span title="${date}" class="candycaneid-${match}"><span class="candycaneid-timestamp">${timestamp}</span><span class="candycaneid-machine">${machine}</span><span class="candycaneid-counter">${counter}</span></span>`;
          });

      const newNode = document.createElement("span");
      newNode.innerHTML = coloredText;

      textNode.parentNode.replaceChild(newNode, textNode);
  });
  generateCss([...uniqueIds]);
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'candycaneidSaturation') {
    document.querySelector(':root').style.setProperty('--candycaneid-sat', `${request.value}%`);
  }
  if (request.action === 'candycaneidLightness') {
    const r = document.querySelector(':root')
    r.style.setProperty('--candycaneid-lit', `${request.value}%`);
    r.style.setProperty('--candycaneid-text', request.value > 60 ? 'black' : 'white');
  }
});

// Observe changes to the DOM and apply colorization when new content is added
const observer = new MutationObserver((mutationsList, observer) => {
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

observer.observe(document.body, { childList: true, subtree: true });

// Apply colorization to existing content
colorizeObjectIds(document.body);
