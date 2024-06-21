const welcomePage = "src/sidePanel/welcome/welcomeSidePanel.html";
const mainPage = "src/sidePanel/main/sidePanel.html";
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setOptions({ path: welcomePage });
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});
chrome.runtime.onStartup.addListener(() => {
  console.log('Web-Annotator started');
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {

  const { path } = await chrome.sidePanel.getOptions({ tabId });
  chrome.sidePanel.setOptions({ path: mainPage, enabled: false });
  chrome.sidePanel.setOptions({ path: mainPage, enabled: true });
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    console.log(
      `Storage key "${key}" in namespace "${namespace}" changed.`,
      `Old value was "${oldValue}", new value is "${newValue}".`
    );
  }
});
