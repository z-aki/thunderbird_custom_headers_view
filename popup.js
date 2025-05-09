/** @param {Event} event */
function handler(event) {
  console.log("Popup loaded");
  /** @type {Document}*/
  const target = event.target;
  const headerList = target.querySelector("#headerList");

  browser.messageDisplay
    .getDisplayedMessages()
    .then((messages) => getMessageFull(messages))
    .then((messagefull) => getHeaders(messagefull))
    .then((headers) => zipSettingsRegex(headers))
    .then(
      /** @param {[Map<String, String>, Object]} results */ (results) => {
        const [headerMap, data] = results;
        if (!data?.headersRegex?.length || !headerMap.size) {
          const pre = document.createElement("pre");

          pre.innerText =
            "Either no patterns are set in the extension Preferences.\nOr none of them are present in this mail.\n\nRight click on this button to go to the extension Preferences page.";
          headerList.appendChild(pre);
          return Promise.resolve();
        }
        Array.from(headerMap.entries())
          .sort()
          .filter(([key]) => checker(data.headersRegex, key))
          .forEach(([key, value]) => makeElement(headerList, key, value));
        return Promise.resolve();
      }
    )
    .then(() => {
      if (headerList.textContent === "") {
        headerList.textContent =
          "No headers in this mail matched your regex filters.";
      }
    });
}

document.addEventListener("DOMContentLoaded", handler);

function getHeaders(messagefull) {
  return messagefull.rawHeaders || messagefull.headers || Promise.resolve({});
}

function getMessageFull(messages) {
  if (!messages.messages?.length) {
    return Promise.reject("No message displayed");
  }
  try {
    return messenger.messages.getFull(messages.messages[0].id, {
      decodeHeaders: false,
      decodeContent: true,
    });
  } catch (e) {
    console.log("Thunderbird version too old for decodeHeaders option");
    return messenger.messages.getFull(messages.messages[0].id);
  }
}

function zipSettingsRegex(headers) {
  return Promise.all([
    new Map(Object.entries(headers)),
    browser.storage.sync.get("headersRegex"),
  ]);
}

function makeElement(parent, key, value) {
  const li = document.createElement("li");
  const b = document.createElement("b");
  b.textContent = key;
  li.appendChild(b);

  const pre = document.createElement("pre");
  pre.textContent = value;
  li.appendChild(pre);

  parent.appendChild(li);
}

function checker(headersRegex, key) {
  return headersRegex.some((regex) => {
    try {
      return new RegExp(regex).test(key);
    } catch (e) {
      console.error(e);
      return false;
    }
  });
}
