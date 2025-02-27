document
  .getElementById("regexInput")
  .addEventListener("input", (event) => fixHeight(event.target));

function fixHeight(event) {
  event.style.height = "";
  event.style.height = event.scrollHeight + "px";
}

const regexInput = document.getElementById("regexInput");
const saveButton = document.getElementById("saveButton");
const regexError = document.getElementById("regexError");

onpageshow = (event) => {
  regexError.textContent = "";
  loadExistingRegex(regexInput);
  fixHeight(regexInput);
};

regexInput.addEventListener("input", () => {
  const newRegex = regexInput.value.trim();
  var errorStr = [];
  const finalStrings = newRegex
    .split("\n")
    .filter((one) => checker(one, errorStr));
  showError(regexError, errorStr);
});

saveButton
  .addEventListener("click", async () => {
    /** @type {String} */
    const newRegex = regexInput.value.trim();
    if (!newRegex) {
      await browser.storage.sync.set({ headersRegex: [] });
      return;
    }
    var errorStr = [];
    const finalStrings = newRegex
      .split("\n")
      .filter((one) => checker(one, errorStr));
    showError(regexError, errorStr);
    await browser.storage.sync.set({ headersRegex: finalStrings });
    loadExistingRegex(regexInput)
  });

async function loadExistingRegex(regexInput) {
  await browser.storage.sync.get("headersRegex").then((data) => {
    const headersRegex = data.headersRegex || [];
    var errorStr = [];
    headersRegex.forEach((element) => checker(element, errorStr));
    regexInput.value = headersRegex.join("\n");
    showError(regexError, errorStr);
    fixHeight(regexInput);
    fixHeight(regexError);
  });
}

/** @param {Element} regexError  */
function showError(regexError, errorStr) {
  regexError.innerHTML = errorStr.join("</br>");
}

/** @param {String[] errorStr} */
function checker(regex, errorStr) {
  try {
    new RegExp(regex);
    return true;
  } catch (e) {
    errorStr.push("Invalid regex pattern: " + regex );
    return false;
  }
}
