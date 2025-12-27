// /**
//  * 更新声明性网络请求规则
//  * @param rules 规则列表
//  * @param enabled 启用状态
//  */
// async function updateDynamicRules(rules, enabled) {
//     if (!enabled) {
//         const dynamicRules = await chrome.declarativeNetRequest.getDynamicRules()
//         console.log({dynamicRules})
//         const removeRuleIds = dynamicRules.map(rule => rule.id);
//         chrome.declarativeNetRequest.updateDynamicRules({
//             // removeRuleIds: rules.map((_, index) => index + 1),
//             removeRuleIds,
//             addRules: []
//         });
//         return;
//     }
//
//     const declarativeRules = rules.map((rule, index) => {
//         const valid = rule.enabled && rule.match && rule.replace
//         if (!valid) {
//             return null;
//         }
//         try {
//             // 添加规则，同时记录原始和修改后的 URL
//             return {
//                 id: index + 1,
//                 priority: 1,
//                 action: {
//                     type: "redirect",
//                     redirect: {
//                         regexSubstitution: rule.replace
//                     }
//                 },
//                 condition: {
//                     regexFilter: rule.match,
//                     resourceTypes: ["main_frame", "sub_frame", "xmlhttprequest", "other"],
//                     // 排除已修改的 URL，避免循环
//                     excludedRequestDomains: [], // 动态排除
//                     isUrlFilterCaseSensitive: false
//                 }
//             };
//         } catch (e) {
//             console.error(`规则 ${rule.match} 无效: ${e}`);
//             return null;
//         }
//     }).filter(rule => rule !== null);
//     chrome.declarativeNetRequest.updateDynamicRules({
//         removeRuleIds: rules.map((_, index) => index + 1),
//         addRules: declarativeRules
//     }, () => {
//         if (chrome.runtime.lastError) {
//             console.error(`更新规则失败: ${chrome.runtime.lastError.message}`);
//         } else {
//             console.log('规则更新成功');
//         }
//     });
// }
//
// /**
//  * 更新工具栏图标
//  * @param enabled 启用状态
//  */
// function updateIcon(enabled) {
//     chrome.action.setIcon({
//         path: enabled ? "icon_enabled.png" : "icon_disabled.png"
//     });
// }
//
// /**
//  * 监听存储变化
//  */
// chrome.storage.sync.onChanged.addListener((changes) => {
//     chrome.storage.sync.get(['rules', 'enabled'], (data) => {
//         const rules = data.rules || [];
//         const enabled = data.enabled !== false;
//         updateDynamicRules(rules, enabled);
//         updateIcon(enabled);
//     });
// });
//
// /**
//  * 初始化：设置默认禁用状态
//  */
// chrome.runtime.onInstalled.addListener(() => {
//     chrome.storage.sync.get(['rules', 'enabled'], (data) => {
//         const rules = data.rules || [];
//         const enabled = data.enabled === undefined ? false : data.enabled;
//         chrome.storage.sync.set({enabled}, () => {
//             updateDynamicRules(rules, enabled);
//             updateIcon(enabled);
//         });
//     });
// });


chrome.runtime.onStartup.addListener(() => {
    console.log('浏览器已启动，扩展正在运行');
    chrome.storage.sync.get(['enabledPlugin'], (data) => {
        const enabled = data.enabled === undefined ? false : data.enabled;
        chrome.action.setIcon({
            path: enabled ? "icon_enabled.png" : "icon_disabled.png"
        });

    });
});
