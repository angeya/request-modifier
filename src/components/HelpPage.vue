<template>
  <div class="help-page">
    <header class="help-header">
      <h1>请求修改器 - 使用说明</h1>
      <el-button type="primary" @click="closePage">关闭页面</el-button>
    </header>
    
    <main class="help-content">
      <!-- 简介 -->
      <section>
        <h3>简介</h3>
        <p>请求修改器是一款浏览器扩展工具，支持 Chrome 和 Edge，可以帮助开发者在开发调试过程中灵活地修改浏览器发出的请求，包括请求重定向和请求头/响应头修改。</p>
        <p>所有规则数据通过浏览器扩展的同步存储（chrome.storage.sync）保存，同一账号下多设备自动同步。</p>
      </section>

      <!-- 请求重定向 -->
      <section>
        <h3>1. 请求重定向</h3>
        <p>将匹配到的 URL 请求重定向到指定的目标地址，常用于开发环境切换接口地址、调试第三方接口等场景。</p>
        <h4>使用方法：</h4>
        <ul>
          <li><strong>匹配URL</strong>：输入要匹配的 URL 模式，支持正则表达式。例如：<code>https://example.com/api</code> 或 <code>.*example.*</code></li>
          <li><strong>替换值</strong>：输入重定向的目标地址，支持正则替换语法。例如：<code>https://test.example.com/api</code></li>
          <li><strong>启用/禁用</strong>：通过开关控制单条规则是否生效</li>
          <li><strong>编辑规则</strong>：点击"编辑"按钮进入编辑模式，修改后点击"保存"</li>
          <li><strong>删除规则</strong>：点击"删除"按钮移除规则</li>
        </ul>
        <h4>示例：</h4>
        <ul>
          <li>将所有 <code>https://example.com</code> 的请求重定向到 <code>https://test.example.com</code>：</li>
          <li>匹配值：<code>https://example.com(.*)</code></li>
          <li>替换值：<code>https://test.example.com$1</code></li>
        </ul>
        <h4>URL 测试：</h4>
        <p>在规则列表上方的测试区域输入待测试的 URL，可以实时预览重定向结果，方便验证规则是否正确。</p>
      </section>

      <!-- 请求头修改 -->
      <section>
        <h3>2. Header 修改</h3>
        <p>对匹配到的请求添加、修改或删除请求头/响应头，常用于模拟特定请求头、调试跨域问题、注入认证信息等场景。</p>
        <h4>使用方法：</h4>
        <ul>
          <li><strong>类型</strong>：选择修改"请求头"还是"响应头"</li>
          <li><strong>匹配URL</strong>：输入要匹配的 URL 模式，支持正则表达式。留空表示对所有请求生效</li>
          <li><strong>Header 名称</strong>：输入要操作的请求头或响应头名称，如 <code>Authorization</code>、<code>Access-Control-Allow-Origin</code></li>
          <li><strong>Header 值</strong>：
            <ul>
              <li>输入具体值：添加或修改该 Header</li>
              <li>留空：删除该 Header</li>
            </ul>
          </li>
          <li><strong>启用/禁用</strong>：通过开关控制单条规则是否生效</li>
          <li><strong>编辑规则</strong>：点击"编辑"按钮进入编辑模式，修改后点击"保存"</li>
          <li><strong>删除规则</strong>：点击"删除"按钮移除规则</li>
        </ul>
        <h4>示例：</h4>
        <ul>
          <li>为所有请求添加 <code>Authorization</code> 头：</li>
          <li>类型：请求头</li>
          <li>匹配URL：留空</li>
          <li>Header 名称：<code>Authorization</code></li>
          <li>Header 值：<code>Bearer your-token</code></li>
        </ul>
        <ul>
          <li>为特定域名的响应添加跨域头：</li>
          <li>类型：响应头</li>
          <li>匹配URL：<code>https://api.example.com.*</code></li>
          <li>Header 名称：<code>Access-Control-Allow-Origin</code></li>
          <li>Header 值：<code>*</code></li>
        </ul>
      </section>

      <!-- 注意事项 -->
      <section>
        <h3>注意事项</h3>
        <ul>
          <li>匹配值使用正则表达式语法，特殊字符需要转义</li>
          <li>替换值支持正则替换语法，如 <code>$1</code>、<code>$2</code> 引用捕获组</li>
          <li>插件关闭（禁用）后所有规则将停止生效，重新启用后自动恢复</li>
          <li>Header 修改规则中，匹配URL留空表示匹配所有请求，请谨慎使用</li>
        </ul>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
function closePage() {
  window.close();
}
</script>

<style>
body {
  width: 100% !important;
  height: auto !important;
  overflow: auto !important;
  padding: 0 !important;
}

.help-page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  max-width: 720px;
  margin: 0 auto;
  padding: 32px 24px;
  background-color: #fff;
  min-height: 100vh;
  box-sizing: border-box;
}

.help-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  padding-bottom: 16px;
  border-bottom: 2px solid #409eff;
}

.help-header h1 {
  color: #303133;
  font-size: 22px;
  font-weight: 600;
  margin: 0;
}

.help-content {
  line-height: 1.7;
}

section {
  margin-bottom: 24px;
  padding: 16px 20px;
  background-color: #f8f9fb;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

h3 {
  margin-top: 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

h4 {
  color: #606266;
  font-size: 14px;
  font-weight: 600;
  margin: 12px 0 8px 0;
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
</style>
