# 请求修改器（Request Modifier）

一款基于 Chrome Manifest V3 的浏览器扩展工具，支持 Chrome 和 Edge，帮助开发者在开发调试过程中灵活修改浏览器发出的请求，包括请求重定向和请求头/响应头修改。

## 功能特性

- **请求重定向**：将匹配到的 URL 请求重定向到指定目标地址，支持正则表达式匹配与替换
- **Header 修改**：对匹配到的请求添加、修改或删除请求头/响应头，支持正则匹配 URL
- **全局开关**：一键启用/禁用插件，禁用后所有规则停止生效，启用后自动恢复
- **URL 测试**：在重定向规则区域输入 URL 实时预览重定向结果，方便验证规则正确性
- **数据同步**：规则数据通过 `chrome.storage.sync` 保存，同一账号下多设备自动同步

## 技术栈

- **前端框架**：Vue 3 + TypeScript
- **UI 组件库**：Element Plus
- **构建工具**：Vite
- **扩展规范**：Chrome Manifest V3
- **核心 API**：`chrome.declarativeNetRequest`、`chrome.storage.sync`

## 工作原理

### 整体架构

```
┌─────────────────────────────────────────────────────┐
│                   Popup 页面 (Vue 3)                 │
│  ┌──────────────┐  ┌──────────────────────────────┐ │
│  │ 请求重定向    │  │ Header 修改                   │ │
│  │ RequestRedirect│ │ HeaderModify                 │ │
│  └──────┬───────┘  └──────────┬───────────────────┘ │
│         │                     │                      │
│         └─────────┬───────────┘                      │
│                   ▼                                  │
│          chromeApi.ts (API 层)                       │
│     ┌─────────────┴──────────────┐                  │
│     │                            │                  │
│     ▼                            ▼                  │
│  chrome.storage.sync    chrome.declarativeNetRequest │
│  (规则持久化)            (动态规则生效)               │
└─────────────────────────────────────────────────────┘
```

### 核心流程

1. **用户在 Popup 中配置规则**：通过 Vue 组件界面添加/编辑/删除/启禁用规则
2. **规则持久化**：规则变更后通过 `chrome.storage.sync` 保存，确保数据不丢失且跨设备同步
3. **动态规则更新**：规则保存时，调用 `chrome.declarativeNetRequest.updateDynamicRules()` 将用户规则转换为声明式网络请求规则，浏览器自动拦截并处理匹配的请求
4. **全局开关控制**：禁用时清除所有动态规则，启用时重新注册规则

### 请求重定向原理

利用 `declarativeNetRequest` 的 `redirect` 动作类型：

- 用户配置的匹配值映射为 `regexFilter`（正则过滤条件）
- 用户配置的替换值映射为 `regexSubstitution`（正则替换模板）
- 匹配的请求会被浏览器自动重定向到替换后的 URL

### Header 修改原理

利用 `declarativeNetRequest` 的 `modifyHeaders` 动作类型：

- 请求头规则：通过 `requestHeaders` 字段设置，支持 `set`（添加/修改）和 `remove`（删除）操作
- 响应头规则：通过 `responseHeaders` 字段设置，操作方式同上
- Header 值为空时自动执行 `remove` 操作，否则执行 `set` 操作

## 项目结构

```
src/
├── api/
│   └── chromeApi.ts          # Chrome API 封装层（存储读写、动态规则更新、插件状态管理）
├── assets/                    # 静态资源（图标、动图等）
├── components/
│   ├── RequestRedirect.vue    # 请求重定向规则管理组件
│   ├── HeaderModify.vue       # Header 修改规则管理组件
│   ├── HelpPage.vue           # 帮助页面组件
│   └── HelpModal.vue          # 帮助弹窗组件
├── service-worker/
│   └── background.ts          # Service Worker（图标状态管理）
├── types/
│   └── index.ts               # TypeScript 类型定义
├── App.vue                     # 主应用组件（Popup 入口）
├── main.ts                     # Popup 入口文件
├── help.ts                     # 帮助页面入口文件
└── style.css                   # 全局样式
```

## 开发

### 环境要求

- Node.js
- npm

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建

```bash
npm run build
```

构建产物输出到 `dist/` 目录，可直接作为 Chrome 扩展加载。

### 监听模式

```bash
npm run watch
```

开发时自动监听文件变化并重新构建。

## 安装扩展

1. 执行 `npm run build` 生成 `dist/` 目录
2. 打开 Chrome/Edge，进入扩展管理页面（`chrome://extensions/`）
3. 开启「开发者模式」
4. 点击「加载已解压的扩展程序」，选择 `dist/` 目录
5. 扩展安装完成，点击工具栏图标即可使用

## 使用示例

### 请求重定向

将 `https://example.com` 的请求重定向到 `https://test.example.com`：

| 字段   | 值                              |
|--------|--------------------------------|
| 匹配值 | `https://example.com(.*)`      |
| 替换值 | `https://test.example.com$1`   |

### 添加请求头

为所有请求添加 `Authorization` 头：

| 字段         | 值                    |
|-------------|-----------------------|
| 类型         | 请求头                 |
| 匹配 URL    | （留空）               |
| Header 名称 | `Authorization`       |
| Header 值   | `Bearer your-token`   |

### 添加跨域响应头

为特定域名的响应添加跨域头：

| 字段         | 值                                |
|-------------|-----------------------------------|
| 类型         | 响应头                             |
| 匹配 URL    | `https://api.example.com.*`       |
| Header 名称 | `Access-Control-Allow-Origin`     |
| Header 值   | `*`                               |

## 注意事项

- 匹配值使用正则表达式语法，特殊字符需要转义
- 替换值支持正则替换语法，如 `$1`、`$2` 引用捕获组
- 插件禁用后所有规则将停止生效，重新启用后自动恢复
- Header 修改规则中，匹配 URL 留空表示匹配所有请求，请谨慎使用
