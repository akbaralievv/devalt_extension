async function updateStaticRules(enableRulesetIds, disableCandidateIds) {
  let options = { enableRulesetIds: enableRulesetIds, disableRulesetIds: disableCandidateIds };
  const enabledStaticCount = await chrome.declarativeNetRequest.getEnabledRulesets();
  const proposedCount = enableRulesetIds.length;
  if (
    enabledStaticCount + proposedCount >
    chrome.declarativeNetRequest.MAX_NUMBER_OF_ENABLED_STATIC_RULESETS
  ) {
    options.disableRulesetIds = disableCandidateIds;
  }
  await chrome.declarativeNetRequest.updateEnabledRulesets(options);
}

export async function getRulesEnabledState() {
  const enabledRuleSets = await chrome.declarativeNetRequest.getEnabledRulesets();
  return enabledRuleSets.length > 0;
}

export async function enableRulesForCurrentPage() {
  const enableRuleSetIds = ['ruleset_1'];
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (activeTab) {
    await updateStaticRules(enableRuleSetIds, []);
  }
}

export async function disableRulesForCurrentPage() {
  const disableRuleSetIds = ['ruleset_1'];
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (activeTab) {
    await updateStaticRules([], disableRuleSetIds);
  }
}

// proxy-i2.censortracker.org:6679
// proxy-i1.censortracker.org:3859
// proxy-i1.censortracker.org:644331
// const enabledProxyFunc = () => {
//   const pacScript =
//     'function FindProxyForURL(url, host) {\n' +
//     "  return 'HTTPS proxy-i2.censortracker.org:6679;';\n" +
//     '}';

//   const config = {
//     mode: 'pac_script',
//     pacScript: {
//       data: pacScript,
//     },
//   };

//   chrome.proxy.settings.set({ value: config, scope: 'regular' }, function () {});
// };

// const disabledProxyFunc = () => {
//   const config = {
//     mode: 'direct',
//   };

//   chrome.proxy.settings.set({ value: config, scope: 'regular' }, function () {});
// };

// export const isProxyFunc = (isTrue) => {
//   if (isTrue) {
//     enabledProxyFunc();
//   } else {
//     disabledProxyFunc();
//   }
// };
