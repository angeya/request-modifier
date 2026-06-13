import type {Rule, HeaderRule} from '../types'

/**
 * Chrome 声明式网络请求规则
 */
interface DeclarativeRule {
    /**
     * id，int范围
     */
    id: number;

    /**
     * 优先级
     */
    priority: number;

    /**
     * 规则条件，如规则应该匹配什么样的请求。匹配什么样的路径
     */
    condition: chrome.declarativeNetRequest.RuleCondition;

    /**
     * 请求被匹配之后，所什么操作？请求重定向、路径替换等
     */
    action: chrome.declarativeNetRequest.RuleAction;
}

/**
 * 加载重定向规则列表
 */
export async function loadRuleList(): Promise<Rule[]> {
    const data = await getStorage(['ruleList']);
    console.log('读取重定向规则：' + JSON.stringify(data))
    const ruleList: Rule[] = data.ruleList || [];
    return ruleList
}

/**
 * 加载请求头修改规则列表
 */
export async function loadHeaderRuleList(): Promise<HeaderRule[]> {
    const data = await getStorage(['headerRuleList']);
    console.log('读取请求头规则：' + JSON.stringify(data))
    const headerRuleList: HeaderRule[] = data.headerRuleList || [];
    return headerRuleList
}

/**
 * 重定向规则列表持久化
 * @param ruleList 规则列表
 */
export async function saveRuleList(ruleList: Rule[]): Promise<void> {
    console.log('保存重定向规则' + JSON.stringify(ruleList))
    await chrome.storage.sync.set({'ruleList': ruleList})
    const headerRuleList: HeaderRule[] = await loadHeaderRuleList()
    await updateDynamicRules(ruleList, headerRuleList)
}

/**
 * 请求头规则列表持久化
 * @param headerRuleList 请求头规则列表
 */
export async function saveHeaderRuleList(headerRuleList: HeaderRule[]): Promise<void> {
    console.log('保存请求头规则' + JSON.stringify(headerRuleList))
    await chrome.storage.sync.set({'headerRuleList': headerRuleList})
    const ruleList: Rule[] = await loadRuleList()
    await updateDynamicRules(ruleList, headerRuleList)
}

export function getStorage(keys: string[]): Promise<Record<string, any>> {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(keys, (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                console.log('获取存储 Is array?', Array.isArray(result.ruleList))
                resolve(result);
            }
        });
    });
}

/**
 * 获取测试URL
 */
export async function getTestUrl(): Promise<string> {
    const data = await getStorage(['testUrl']);
    console.log('读取：' + data)
    return data.testUrl || '';
}

/**
 * 保存测试URL
 * @param testUrl 测试URL
 */
export async function saveTestUrl(testUrl: string): Promise<void> {
    await chrome.storage.sync.set({'testUrl': testUrl})
}


/**
 * 获取插件状态
 */
export async function getPluginStatus(): Promise<boolean> {
    const data = await getStorage(['enabledPlugin']);
    console.log('读取：' + data)
    return data.enabledPlugin || false;
}

/**
 * 禁用插件
 */
export async function disablePlugin(): Promise<void> {
    await chrome.storage.sync.set({'enabledPlugin': false})
    const dynamicRules = await chrome.declarativeNetRequest.getDynamicRules();
    console.log({dynamicRules});
    const removeRuleIds = dynamicRules.map(rule => rule.id);
    await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds,
        addRules: []
    });
    updateIcon(false)
}

/**
 * 启用插件
 */
export async function enablePlugin(): Promise<void> {
    const ruleList: Rule[] = await loadRuleList()
    const headerRuleList: HeaderRule[] = await loadHeaderRuleList()
    await chrome.storage.sync.set({'enabledPlugin': true})
    await updateDynamicRules(ruleList, headerRuleList)
    updateIcon(true)
}

/**
 * 更新声明性网络请求规则
 * @param ruleList 重定向规则列表
 * @param headerRuleList 请求头规则列表
 */
export async function updateDynamicRules(ruleList?: Rule[], headerRuleList?: HeaderRule[]): Promise<void> {
    // 获取所有当前规则，用于后续删除
    const currentRules = await chrome.declarativeNetRequest.getDynamicRules();
    const allRuleIds = currentRules.map(rule => rule.id);
    
    // 构建所有规则
    const allDeclarativeRules: DeclarativeRule[] = [];
    
    // 处理重定向规则
    if (ruleList) {
        console.log('更新重定向规则' + JSON.stringify(ruleList))
        const redirectRules = ruleList
            .map((rule): DeclarativeRule | null => {
                const isValid = rule.enabled && rule.match;
                if (!isValid) {
                    return null;
                }
                try {
                    return {
                        id: rule.id,
                        priority: 1,
                        action: {
                            type: 'redirect',
                            redirect: {
                                regexSubstitution: rule.replace
                            }
                        },
                        condition: {
                            regexFilter: rule.match,
                            resourceTypes: ['main_frame', 'sub_frame', 'xmlhttprequest', 'websocket',
                                'media', 'image', 'stylesheet','object','font','webtransport','ping','other'],
                            isUrlFilterCaseSensitive: false
                        }
                    };
                } catch (e) {
                    console.error(`重定向规则 ${rule.match} 无效:`, e);
                    return null;
                }
            })
            .filter((rule): rule is DeclarativeRule => rule !== null); // 类型守卫
        
        allDeclarativeRules.push(...redirectRules);
    }
    
    // 处理请求头修改规则
    if (headerRuleList) {
        console.log('更新请求头规则' + JSON.stringify(headerRuleList))
        const headerRules = headerRuleList
            .map((rule): DeclarativeRule | null => {
                const isValid = rule.enabled && rule.headerName;
                if (!isValid) {
                    return null;
                }
                try {
                    // 构建 Header 操作项
                    const isRemove = rule.headerValue === '';
                    const headerOperation: chrome.declarativeNetRequest.ModifyHeaderInfo = {
                        header: rule.headerName,
                        operation: isRemove ? 'remove' : 'set'
                    };
                    if (!isRemove) {
                        headerOperation.value = rule.headerValue;
                    }

                    // 根据规则类型构建动作，不设置的字段需完全省略而非设为 undefined
                    const action: chrome.declarativeNetRequest.RuleAction = {
                        type: 'modifyHeaders',
                        ...(rule.type === 'request'
                            ? { requestHeaders: [headerOperation] }
                            : { responseHeaders: [headerOperation] })
                    };
                    
                    // 匹配URL为空时使用 urlFilter 通配符匹配所有请求
                    // regexFilter 不支持 ".*" 这种过于宽泛的正则，改用 urlFilter
                    const condition: chrome.declarativeNetRequest.RuleCondition = {
                        resourceTypes: ['main_frame', 'sub_frame', 'xmlhttprequest', 'websocket',
                            'media', 'image', 'stylesheet','object','font','webtransport','ping','other'],
                        isUrlFilterCaseSensitive: false
                    };
                    if (rule.match) {
                        condition.regexFilter = rule.match;
                    } else {
                        condition.urlFilter = '*';
                    }

                    return {
                        id: rule.id + 10000, // 避免ID冲突，请求头规则使用10000以上的ID
                        priority: 1,
                        action,
                        condition
                    };
                } catch (e) {
                    console.error(`请求头规则 ${rule.match} 无效:`, e);
                    return null;
                }
            })
            .filter((rule): rule is DeclarativeRule => rule !== null); // 类型守卫
        
        allDeclarativeRules.push(...headerRules);
    }
    
    // 更新规则
    await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: allRuleIds,
        addRules: allDeclarativeRules
    });

    if (chrome.runtime.lastError) {
        console.error(`更新规则失败: ${chrome.runtime.lastError.message}`);
    } else {
        console.log('规则更新成功');
    }
}

/**
 * 更新工具栏图标
 * @param enabled 启用状态
 */
function updateIcon(enabled: boolean): void {
    chrome.action.setIcon({
        path: enabled ? './icon_enabled.png' : './icon_disabled.png'
    });
}

// /**
//  * 监听存储变化
//  */
// chrome.storage.sync.onChanged.addListener(() => {
//     console.log('插件数据变化')
//     chrome.storage.sync.get(['rules', 'enabled'], (data) => {
//         const rules = (data.rules?.value as Rule[]) || [];
//         const enabled = data.enabled?.value !== false;
//         updateDynamicRules(rules);
//         updateIcon(enabled);
//     });
// });
//
// /**
//  * 初始化：设置默认禁用状态
//  */
// chrome.runtime.onInstalled.addListener(() => {
//     console.log('插件初始化')
//     chrome.storage.sync.get(['ruleList', 'enabled'], (data) => {
//         const ruleList = (data.ruleList?.value as Rule[]) || [];
//         const enabled =
//             data.enabled?.value === undefined ? false : (data.enabled.value as boolean);
//         chrome.storage.sync.set({enabled}, () => {
//             updateDynamicRules(ruleList);
//             updateIcon(enabled);
//         });
//     });
// });
