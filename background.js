browser.runtime.onInstalled.addListener(async () => {
  console.log("Creating context menu");
  await messenger.menus.create({
    id: "preferences",
    title: "Preferences",
    contexts: ["message_display_action"],
  });
});

browser.menus.onClicked.addListener((info) => {
  if (info.menuItemId === "preferences") {
    browser.runtime.openOptionsPage();
  }
});
