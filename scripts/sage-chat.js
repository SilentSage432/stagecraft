// /scripts/sage-chat.js

let loreCache = null;

async function generateSageResponse(input, original) {
  try {
    if (!loreCache) {
      const res = await fetch("/assets/lore.json");
      if (!res.ok) throw new Error("Failed to load lore.json");
      loreCache = await res.json();
    }
    const lore = loreCache;
    const suggestions = lore["__suggestions"] || {};

    input = input.toLowerCase().replace(/[^\w\s]/gi, "").trim();
    console.log("Normalized input:", input);
    console.log("Original input:", original);

    const normalizedKeys = Object.keys(lore).reduce((acc, key) => {
      if (key !== "__suggestions" && key !== "default") {
        const norm = key.toLowerCase().replace(/[^\w\s]/gi, "").trim();
        acc[norm] = key;
      }
      return acc;
    }, {});

    Object.keys(suggestions).forEach((key) => {
      suggestions[key].forEach((sug) => {
        const label = typeof sug === "string" ? sug : sug.text;
        if (label && typeof label === "string") {
          const normSug = label.toLowerCase().replace(/[^\w\s]/gi, "").trim();
          normalizedKeys[normSug] = key;
        }
      });
    });
    console.log("Normalized keys:", normalizedKeys);

    if (normalizedKeys[input]) {
      const originalKey = normalizedKeys[input];
      console.log("Matched key:", originalKey);
      let response = lore[originalKey];
      if (suggestions[originalKey]) {
        const links = suggestions[originalKey]
          .map((s) => {
            if (typeof s === "string") {
              return `<button class='suggestion' data-action="ask" data-query="${s}">${s}</button>`;
            } else if (s.action === "ask") {
              return `<button class='suggestion' data-action="ask" data-query="${s.query}">${s.text}</button>`;
            } else if (s.action === "redirect") {
              return `<button class='suggestion' data-action="redirect" data-url="${s.url}">${s.text}</button>`;
            }
            return "";
          })
          .join(" ");
        response += `<div class='suggestions'>${links}</div>`;
      }
      console.log("Response:", response);
      return response;
    }

    const inputWords = input.split(" ");
    for (const word of inputWords) {
      if (normalizedKeys[word]) {
        const originalKey = normalizedKeys[word];
        console.log("Partial matched key:", originalKey);
        let response = lore[originalKey];
        if (suggestions[originalKey]) {
          const links = suggestions[originalKey]
            .map((s) => {
              if (typeof s === "string") {
                return `<button class='suggestion' data-action="ask" data-query="${s}">${s}</button>`;
              } else if (s.action === "ask") {
                return `<button class='suggestion' data-action="ask" data-query="${s.query}">${s.text}</button>`;
              } else if (s.action === "redirect") {
                return `<button class='suggestion' data-action="redirect" data-url="${s.url}">${s.text}</button>`;
              }
              return "";
            })
            .join(" ");
          response += `<div class='suggestions'>${links}</div>`;
        }
        console.log("Partial response:", response);
        return response;
      }
    }

    console.log("No match found, using default");
    return `<em>${
      lore["default"] || "The stars are silent on that... for now."
    }</em>`;
  } catch (error) {
    console.error("Error in generateSageResponse:", error);
    return `<em>Sorry, I'm unable to access my knowledge right now.</em>`;
  }
}