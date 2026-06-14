<template>
  <div class="help-page">
    <header class="help-header">
      <h1>请求修改器 - 使用说明</h1>
      <el-button type="primary" size="small" @click="closePage">关闭页面</el-button>
    </header>

    <div class="help-body">
      <!-- 左侧导航栏 -->
      <nav class="help-nav">
        <a
          v-for="item in navItems"
          :key="item.id"
          :href="'#' + item.id"
          :class="['nav-item', { active: activeSection === item.id }]"
          @click.prevent="scrollToSection(item.id)"
        >{{ item.label }}</a>
      </nav>

      <!-- 右侧内容区 -->
      <main class="help-content" @scroll="onScroll">
        <!-- 简介 -->
        <section id="intro">
          <h3>简介</h3>
          <p>请求修改器是一款浏览器扩展工具，支持 Chrome 和 Edge，可以帮助开发者在开发调试过程中灵活地修改浏览器发出的请求，包括请求重定向和请求头修改。</p>
          <p>所有规则数据通过浏览器扩展的同步存储（chrome.storage.sync）保存，同一账号下多设备自动同步。</p>
        </section>

        <!-- 请求重定向 -->
        <section id="redirect">
          <h3>请求重定向</h3>
          <p>将匹配到的 URL 请求重定向到指定的目标地址，常用于开发环境地址、端口切换等场景。</p>
          <h4>使用方法</h4>
          <p>其实就是很简单的URL地址查找替换。</p>
          <ul>
            <li><strong>匹配值</strong>：输入要匹配的字符串，支持正则表达式。</li>
            <li><strong>替换值</strong>：输入要替换的字符串，支持正则替换语法。留空则将匹配内容替换为空串</li>
            <li><strong>启用/禁用</strong>：通过开关控制单条规则是否生效</li>
            <li><strong>编辑</strong>：点击"编辑"按钮进入编辑模式，修改后点击"保存"</li>
            <li><strong>删除</strong>：点击"删除"按钮移除规则</li>
          </ul>
          <h4>示例</h4>
          <div class="example-block">
            <p>将所有 <code>https://www.baidu.com</code> 的请求重定向到 <code>https://www.taobao.com</code>：</p>
            <table class="example-table">
              <tr><td class="label-col">匹配值</td><td><code>baidu</code></td></tr>
              <tr><td class="label-col">替换值</td><td><code>taobao</code></td></tr>
            </table>
            <p>这样，只要在浏览器请求的地址包含<code>baidu</code>，都将其替换为<code>taobao</code></p>
          </div>
          <p>如下图所示：</p>
          <img :src="redirectImg" alt="请求重定向示例" class="help-img" />
          <h4>URL 测试</h4>
          <p>在规则列表上方的测试区域输入待测试的 URL，可以实时预览URL重定向结果，方便验证规则是否正确。</p>
        </section>

        <!-- 请求头修改 -->
        <section id="header">
          <h3>请求头修改</h3>
          <p>对匹配到的请求添加、修改或删除请求头，常用于模拟特定请求头、注入认证信息等场景。</p>
          <h4>使用方法</h4>
          <ul>
            <li><strong>匹配URL</strong>：输入要匹配的 URL 字符串，只要URL包含则匹配，支持正则表达式。留空表示对所有请求生效</li>
            <li><strong>请求头名称</strong>：输入要操作的请求头参数名称，如 <code>Authorization</code></li>
            <li><strong>请求头值</strong>：要设置的请求头参数的值</li>
            <li><strong>启用/禁用</strong>：通过开关控制单条规则是否生效</li>
            <li><strong>编辑规则</strong>：点击"编辑"按钮进入编辑模式，修改后点击"保存"</li>
            <li><strong>删除规则</strong>：点击"删除"按钮移除规则（需二次确认）</li>
          </ul>
          <h4>示例</h4>
          <div class="example-block">
            <p>为所有请求添加 <code>Authorization</code> 头：</p>
            <table class="example-table">
              <tr><td class="label-col">匹配URL</td><td>留空</td></tr>
              <tr><td class="label-col">Header 名称</td><td><code>Authorization</code></td></tr>
              <tr><td class="label-col">Header 值</td><td><code>Bearer your-token</code></td></tr>
            </table>
          </div>
          <p>配置如下图所示：</p>
          <img :src="headerImg" alt="请求头修改示例" class="help-img" />
        </section>

        <!-- 限制说明 -->
        <section id="restrictions">
          <h3>限制说明</h3>
          <div class="warning-block">
            <h4>响应头修改暂不支持</h4>
            <p>由于 Chrome Manifest V3 的 <code>declarativeNetRequest</code> API 限制，当前版本暂不支持响应头修改功能。后续如 Chrome 放开限制将及时支持。</p>
          </div>
          <h4>禁止修改的请求头</h4>
          <p>浏览器出于安全考虑，以下请求头无法通过扩展修改：</p>
          <table class="restrict-table">
            <thead>
              <tr><th>请求头</th><th>说明</th></tr>
            </thead>
            <tbody>
              <tr><td><code>Host</code></td><td>HTTP 协议核心头，由浏览器自动设置</td></tr>
              <tr><td><code>Origin</code></td><td>防止 CSRF 攻击，浏览器禁止伪造</td></tr>
              <tr><td><code>Referer</code></td><td>受浏览器 Referrer-Policy 控制</td></tr>
              <tr><td><code>Cookie</code></td><td>受 SameSite 等安全策略限制</td></tr>
              <tr><td><code>Connection</code></td><td>连接管理头，由浏览器控制</td></tr>
              <tr><td><code>Keep-Alive</code></td><td>持久连接头，由浏览器控制</td></tr>
              <tr><td><code>Accept-Charset</code></td><td>已废弃，浏览器不再支持修改</td></tr>
              <tr><td><code>Accept-Encoding</code></td><td>编码协商头，由浏览器控制</td></tr>
              <tr><td><code>Access-Control-Request-Headers</code></td><td>CORS 预检头，由浏览器自动设置</td></tr>
              <tr><td><code>Access-Control-Request-Method</code></td><td>CORS 预检头，由浏览器自动设置</td></tr>
              <tr><td>以 <code>Sec-</code> 开头的头</td><td>安全相关头，浏览器禁止修改</td></tr>
              <tr><td>以 <code>Proxy-</code> 开头的头</td><td>代理相关头，浏览器禁止修改</td></tr>
            </tbody>
          </table>
          <p>如需修改以上请求头，建议使用本地代理工具（如 Fiddler、Charles、mitmproxy）。</p>
        </section>

        <!-- 注意事项 -->
        <section id="notes">
          <h3>注意事项</h3>
          <ul>
            <li>匹配值使用正则表达式语法，特殊字符需要转义</li>
            <li>替换值支持正则替换语法，如 <code>$1</code>、<code>$2</code> 引用捕获组；留空则将匹配内容替换为空串</li>
            <li>插件禁用后所有规则将停止生效，重新启用后自动恢复</li>
            <li>请求头修改规则中，匹配URL留空表示匹配所有请求，请谨慎使用</li>
            <li>规则数据通过 <code>chrome.storage.sync</code> 保存，同一账号下多设备自动同步</li>
          </ul>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import redirectImg from '../assets/help/image-20260613214829682.png'
import headerImg from '../assets/help/image-20260613215707462.png'

/**
 * 导航项配置
 */
const navItems = [
  { id: 'intro', label: '简介' },
  { id: 'redirect', label: '请求重定向' },
  { id: 'header', label: '请求头修改' },
  { id: 'restrictions', label: '限制说明' },
  { id: 'notes', label: '注意事项' }
]

const activeSection = ref('intro')

/**
 * 滚动到指定章节
 * @param id 章节id
 */
function scrollToSection(id: string): void {
  activeSection.value = id
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

/**
 * 监听内容区滚动，高亮当前导航项
 */
function onScroll(e: Event): void {
  const container = e.target as HTMLElement
  const sections = navItems.map(item => ({
    id: item.id,
    el: document.getElementById(item.id)
  }))
  for (let i = sections.length - 1; i >= 0; i--) {
    const section = sections[i]!
    if (section.el) {
      const rect = section.el.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      if (rect.top - containerRect.top <= 60) {
        activeSection.value = section.id
        break
      }
    }
  }
}

/**
 * 关闭帮助页面
 */
function closePage(): void {
  window.close()
}
</script>

<style>
html {
  overflow: auto !important;
  height: auto !important;
}

body {
  width: 100% !important;
  height: auto !important;
  overflow: auto !important;
  padding: 0 !important;
}
</style>

<style scoped>
.help-page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #fff;
  min-height: 100vh;
  box-sizing: border-box;
}

.help-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 2px solid #409eff;
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 10;
}

.help-header h1 {
  color: #303133;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.help-body {
  display: flex;
  min-height: calc(100vh - 60px);
}

/* 左侧导航 */
.help-nav {
  width: 180px;
  flex-shrink: 0;
  padding: 20px 0;
  border-right: 1px solid #ebeef5;
  position: sticky;
  top: 60px;
  height: calc(100vh - 60px);
  overflow-y: auto;
  background: #fafbfc;
}

.nav-item {
  display: block;
  padding: 10px 20px;
  color: #606266;
  text-decoration: none;
  font-size: 14px;
  border-left: 3px solid transparent;
  transition: all 0.2s;
  cursor: pointer;
}

.nav-item:hover {
  color: #409eff;
  background: #ecf5ff;
}

.nav-item.active {
  color: #409eff;
  background: #ecf5ff;
  border-left-color: #409eff;
  font-weight: 600;
}

/* 右侧内容 */
.help-content {
  flex: 1;
  padding: 24px 32px;
  overflow-y: auto;
  height: calc(100vh - 60px);
}

section {
  margin-bottom: 28px;
  padding: 20px 24px;
  background-color: #f8f9fb;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

h3 {
  margin-top: 0;
  color: #303133;
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

h4 {
  color: #606266;
  font-size: 14px;
  font-weight: 600;
  margin: 14px 0 8px 0;
}

p {
  color: #606266;
  line-height: 1.7;
  margin-bottom: 10px;
}

ul {
  margin: 8px 0;
  padding-left: 20px;
}

li {
  color: #606266;
  line-height: 1.7;
  margin-bottom: 6px;
}

code {
  background-color: #f0f2f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 13px;
  color: #409eff;
}

/* 示例区块 */
.example-block {
  background: #fff;
  padding: 12px 16px;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  margin: 8px 0;
}

.example-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
}

.example-table td {
  padding: 6px 10px;
  border-bottom: 1px solid #f0f2f5;
  font-size: 13px;
  color: #606266;
}

.label-col {
  width: 80px;
  font-weight: 600;
  color: #303133;
}

/* 警告区块 */
.warning-block {
  background: #fdf6ec;
  border: 1px solid #faecd8;
  border-radius: 6px;
  padding: 14px 18px;
  margin-bottom: 16px;
}

.warning-block h4 {
  color: #e6a23c;
  margin-top: 0;
  font-size: 14px;
}

.warning-block p {
  color: #8a6d3b;
  margin-bottom: 0;
}

/* 限制表格 */
.restrict-table {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
}

.restrict-table th {
  background: #f0f2f5;
  padding: 8px 12px;
  text-align: left;
  font-size: 13px;
  color: #303133;
  border-bottom: 2px solid #dcdfe6;
}

.restrict-table td {
  padding: 8px 12px;
  border-bottom: 1px solid #ebeef5;
  font-size: 13px;
  color: #606266;
}

.restrict-table td code {
    font-size: 12px;
}

/* 帮助图片 */
.help-img {
    max-width: 75%;
    border-radius: 6px;
    border: 1px solid #ebeef5;
    margin: 8px 0;
}
</style>
