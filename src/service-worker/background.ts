function updateIcon(enabled: boolean): void {
    chrome.action.setIcon({
        path: enabled ? "icon_enabled.png" : "icon_disabled.png"
    });
}

function initIconState(): void {
    chrome.storage.sync.get(['enabledPlugin'], (data) => {
        const enabled = data.enabledPlugin === undefined ? false : data.enabledPlugin;
        updateIcon(enabled);
    });
}

chrome.runtime.onStartup.addListener(() => {
    console.log('浏览器已启动，扩展正在运行');
    initIconState();
});

chrome.runtime.onInstalled.addListener(() => {
    console.log('插件已安装，正在初始化');
    initIconState();
});

chrome.storage.sync.onChanged.addListener((changes) => {
    if (changes.enabledPlugin) {
        console.log('插件状态已变化：', changes.enabledPlugin.newValue);
        updateIcon(changes.enabledPlugin.newValue);
    }
});
