browser.runtime.onInstalled.addListener(async () => {
  console.log("Creating context menu");
  await messenger.menus.create({
    id: "settings",
    title: "Settings",
    contexts: ["message_display_action"],
  });
});

browser.menus.onClicked.addListener((info) => {
  if (info.menuItemId === "settings") {
    browser.runtime.openOptionsPage();
  }
});
