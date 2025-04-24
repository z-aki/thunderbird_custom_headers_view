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
  newRegex
    .split("\n")
    .filter((one, index) => checkerRegex(one, index, errorStr));
  showError(regexError, errorStr);
});

saveButton.addEventListener("click", async () => {
  /** @type {String} */
  const newRegex = regexInput.value.trim();
  if (!newRegex) {
    await browser.storage.sync.set({ headersRegex: [] });
    return;
  }
  var errorStr = [];
  const finalStrings = newRegex
    .split("\n")
    .filter((one, index) => checkerRegex(one, index, errorStr));
  showError(regexError, errorStr);
  await browser.storage.sync.set({ headersRegex: finalStrings });
  loadExistingRegex(regexInput);
});

async function loadExistingRegex(regexInput) {
  await browser.storage.sync.get("headersRegex").then((data) => {
    const headersRegex = data.headersRegex || [];
    var errorStr = [];
    headersRegex.forEach((element, lineno) =>
      checkerRegex(element, lineno, errorStr)
    );
    regexInput.value = headersRegex.join("\n");
    showError(regexError, errorStr);
    fixHeight(regexInput);
    fixHeight(regexError);
  });
}

/** @param {Element} regexError  */
function showError(regexError, errorStr) {
  regexError.innerText = errorStr.join("\n");
}

/** @param {String[] errorStr} */
function checkerRegex(regex, lineno, errorStr) {
  try {
    new RegExp(regex);
    return true;
  } catch (e) {
    errorStr.push(
      "Invalid regex pattern in line " + (lineno + 1) + ": " + regex
    );
    return false;
  }
}
