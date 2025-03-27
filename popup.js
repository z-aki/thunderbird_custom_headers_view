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
          headerList.innerHTML =
            "No patterns set in Preferences or maybe none are present in the mail. </br> Right click on the button to go to the extension Preferences page.";
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
        headerList.textContent = "No headers matched your regex.";
      }
    });
}

document.addEventListener("DOMContentLoaded", handler);

function getHeaders(messagefull) {
  if (!messagefull?.headers) {
    return Promise.resolve({});
  }
  return messagefull.headers;
}

function getMessageFull(messages) {
  if (!messages.messages?.length) {
    return Promise.reject("No message displayed");
  }
  return messenger.messages.getFull(messages.messages[0].id);
}

function zipSettingsRegex(headers) {
  return Promise.all([
    new Map(Object.entries(headers)),
    browser.storage.sync.get("headersRegex"),
  ]);
}

function makeElement(parent, key, value) {
  const header = document.createElement("li");
  header.textContent = `${key}: ${value}`;
  parent.appendChild(header);
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
