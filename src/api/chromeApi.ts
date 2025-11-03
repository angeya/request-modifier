import type {Rule} from '../types'

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
 * 加载配置并渲染界面
 */
export async function loadRuleList(): Promise<Rule[]> {
    const data = await getStorage(['ruleList', 'enabled', 'testUrl']);
    console.log('读取：' + data)
    const ruleList: Rule[] = data.ruleList || [];
    return ruleList
}

/**
 * 规则列表持久化
 * @param ruleList 规则列表
 */
export async function saveRuleList(ruleList: Rule[]): Promise<void> {
    console.log('保存规则' + ruleList.toString())
    await chrome.storage.sync.set({'ruleList': ruleList})
    await updateDynamicRules(ruleList)
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
 * 禁用插件
 */
export async function disablePlugin(): Promise<void> {
    const dynamicRules = await chrome.declarativeNetRequest.getDynamicRules();
    console.log({dynamicRules});
    const removeRuleIds = dynamicRules.map(rule => rule.id);
    await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds,
        addRules: []
    });
    return;
}

/**
 * 启用插件
 */
export async function enablePlugin(): Promise<void> {
    const ruleList: Rule[] = await loadRuleList()
    await updateDynamicRules(ruleList)
}

/**
 * 更新声明性网络请求规则
 * @param ruleList 规则列表
 */
export async function updateDynamicRules(ruleList: Rule[]): Promise<void> {
    console.log('更新规则' + ruleList.toString())
    const declarativeRules: DeclarativeRule[] = ruleList
        .map((rule): DeclarativeRule | null => {
            const isValid = rule.enabled && rule.match && rule.replace;
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
        removeRuleIds: ruleList.map((rule) => rule.id),
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
    console.log('插件数据变化')
    chrome.storage.sync.get(['rules', 'enabled'], (data) => {
        const rules = (data.rules?.value as Rule[]) || [];
        const enabled = data.enabled?.value !== false;
        updateDynamicRules(rules);
        updateIcon(enabled);
    });
});

/**
 * 初始化：设置默认禁用状态
 */
chrome.runtime.onInstalled.addListener(() => {
    console.log('插件初始化')
    chrome.storage.sync.get(['ruleList', 'enabled'], (data) => {
        const ruleList = (data.ruleList?.value as Rule[]) || [];
        const enabled =
            data.enabled?.value === undefined ? false : (data.enabled.value as boolean);
        chrome.storage.sync.set({enabled}, () => {
            updateDynamicRules(ruleList);
            updateIcon(enabled);
        });
    });
});