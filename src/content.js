const objectIdRegex = /\b[0-9a-fA-F]{24}\b/g;

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
  const hue = 180 - (dayOfYear / 365) * 240; // Map to hue (0-360)

  return hueToColor(hue);
}

function ageToColor(date) {
  const now = new Date();
  const timeDifference = now - date;
  
  // Calculate the hue based on the time difference
  const maxDifference = 1000 * 60 * 60 * 24 * 365 * 5; // 5 years in milliseconds
  const scaledDifference = Math.min(timeDifference, maxDifference); // Cap the difference
  const hue = 120 + (scaledDifference / maxDifference) * 240; // Map to hue (120-360)

  return hueToColor(hue);
}

function hashToColor(hash) {
  return hueToColor((Math.abs(hash) % 360)); // Use the hash as the hue value
}

function hueToColor(hue) {
  return `hsl(${hue}, 60%, 50%)`;
}

function collectObjectIds(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
  const objectIds = [];

  let textNode;
  while ((textNode = walker.nextNode())) {
    const textContent = textNode.nodeValue;
    if (objectIdRegex.test(textContent)) {
      objectIds.push({ textNode, textContent });
    }
  }

  return objectIds;
}

function getTextColorForBackground(b) {
  return '#ffffff';
}

function colorizeObjectIds(root) {

  const objectIds = collectObjectIds(root);
  objectIds.forEach(({textNode, textContent}) => {
      const coloredText = textContent.replace(objectIdRegex, (match) => {
          const timestamp = match.slice(0, 8); // 4 bytes
          const machine = match.slice(8, 18); // 5 bytes
          const counter = match.slice(18, 24); // 3 bytes

          // Parse the date segment
          const date = new Date(parseInt(timestamp, 16) * 1000); // Convert to milliseconds

          const ageBg = ageToColor(date);
          const dayBg = dayToColor(date);
          const machineBg = hashToColor(hashCode(machine));
          const counterBg = hashToColor(hashCode(counter));

          return `<span title="${date}" style="border-radius: 2px; background-image: linear-gradient(110deg, ${ageBg} 10%, 13%, ${dayBg} 30%, 33%, ${machineBg} 36%, ${machineBg} 72%, 75%, ${counterBg} 78%);"><span style="color: white">${timestamp}</span><span style="color: white">${machine}</span><span style="color: white">${counter}</span></span>`;
          });

      const newNode = document.createElement("span");
      newNode.innerHTML = coloredText;

      textNode.parentNode.replaceChild(newNode, textNode);
  });
}


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
