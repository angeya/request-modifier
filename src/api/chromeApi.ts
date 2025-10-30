import 'chrome'

/**
 * 规则数据结构（来自存储）
 */
interface Rule {
    match: string;
    replace: string;
    enabled: boolean;
}

/**
 * Chrome 声明式网络请求规则
 */
interface DeclarativeRule {
    id: number;
    priority: number;
    action: chrome.declarativeNetRequest.RuleAction;
    condition: chrome.declarativeNetRequest.RuleCondition;
}

/**
 * 加载配置并渲染界面
 */
export async function loadRuleList(): Promise<Rule[]> {
    const data = await getStorage(['ruleList', 'enabled', 'testUrl']);
    const ruleList: Rule[] = data.ruleList || [];
    return ruleList;
}

export function saveRuleList(ruleList: Rule[]): void {
    chrome.storage.sync.set({ruleList})
}

export function getStorage(keys: string[]): Promise<Record<string, any>> {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(keys, (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(result);
            }
        });
    });
}

/**
 * 更新声明性网络请求规则
 * @param rules 规则列表
 * @param enabled 启用状态
 */
export async function updateDynamicRules(rules: Rule[], enabled: boolean): Promise<void> {
    if (!enabled) {
        const dynamicRules = await chrome.declarativeNetRequest.getDynamicRules();
        console.log({dynamicRules});
        const removeRuleIds = dynamicRules.map(rule => rule.id);
        await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds,
            addRules: []
        });
        return;
    }

    const declarativeRules: DeclarativeRule[] = rules
        .map((rule, index): DeclarativeRule | null => {
            const valid = rule.enabled && rule.match && rule.replace;
            if (!valid) {
                return null;
            }
            try {
                return {
                    id: index + 1,
                    priority: 1,
                    action: {
                        type: 'redirect',
                        redirect: {
                            regexSubstitution: rule.replace
                        }
                    },
                    condition: {
                        regexFilter: rule.match,
                        resourceTypes: ['main_frame', 'sub_frame', 'xmlhttprequest', 'other'],
                        excludedRequestDomains: [],
                        isUrlFilterCaseSensitive: false
                    }
                };
            } catch (e) {
                console.error(`规则 ${rule.match} 无效:`, e);
                return null;
            }
        })
        .filter((rule): rule is DeclarativeRule => rule !== null); // 类型守卫

    await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: rules.map((_, index) => index + 1),
        addRules: declarativeRules
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

/**
 * 监听存储变化
 */
chrome.storage.sync.onChanged.addListener(() => {
    chrome.storage.sync.get(['rules', 'enabled'], (data) => {
        const rules = (data.rules?.value as Rule[]) || [];
        const enabled = data.enabled?.value !== false;
        updateDynamicRules(rules, enabled);
        updateIcon(enabled);
    });
});

/**
 * 初始化：设置默认禁用状态
 */
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.get(['rules', 'enabled'], (data) => {
        const rules = (data.rules?.value as Rule[]) || [];
        const enabled =
            data.enabled?.value === undefined ? false : (data.enabled.value as boolean);
        chrome.storage.sync.set({enabled}, () => {
            updateDynamicRules(rules, enabled);
            updateIcon(enabled);
        });
    });
});