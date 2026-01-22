<template>
  <div class="help-page">
    <header class="help-header">
      <h1>请求修改器 - 使用说明</h1>
      <n-button type="primary" @click="closePage">关闭页面</n-button>
    </header>
    
    <main class="help-content">
      <!-- 请求重定向 -->
      <section>
        <h3>1. 请求重定向</h3>
        <p>请求重定向功能允许您根据规则列表将匹配的URL重定向到指定URL。</p>
        <h4>使用方法：</h4>
        <ul>
          <li><strong>匹配URL</strong>：输入要匹配的URL，支持正则表达式。例如：<code>https://example.com/api</code> 或 <code>.*example.*</code></li>
          <li><strong>替换值</strong>：输入要重定向到的URL，支持正则替换。例如：<code>https://test.example.com/api</code></li>
          <li><strong>启用/禁用</strong>：使用开关控制规则是否启用</li>
          <li><strong>添加规则</strong>：点击"添加规则"按钮添加新的规则</li>
          <li><strong>编辑规则</strong>：点击"编辑"按钮修改现有规则</li>
          <li><strong>删除规则</strong>：点击"删除"按钮删除规则</li>
        </ul>
        <h4>示例：</h4>
        <ul>
          <li>将所有 <code>https://example.com</code> 开头的请求重定向到 <code>https://test.example.com</code>：</li>
          <li>匹配值：<code>https://example.com(.*)</code></li>
          <li>替换值：<code>https://test.example.com$1</code></li>
        </ul>
      </section>

      <!-- 请求头修改 -->
      <section>
        <h3>2. Header修改</h3>
        <p>Header修改功能允许您根据规则列表修改请求头或响应头。</p>
        <h4>使用方法：</h4>
        <ul>
          <li><strong>类型</strong>：选择要修改的是请求头还是响应头</li>
          <li><strong>匹配URL</strong>：输入要匹配的URL，支持正则表达式。留空表示对所有请求生效。</li>
          <li><strong>请求头/响应头名称</strong>：输入要修改的请求头或响应头名称</li>
          <li><strong>请求头/响应头值</strong>：
            <ul>
              <li>输入具体值：表示添加或修改该请求头/响应头</li>
              <li>留空：表示删除该请求头/响应头</li>
            </ul>
          </li>
          <li><strong>启用/禁用</strong>：使用开关控制规则是否启用</li>
          <li><strong>添加规则</strong>：点击"添加规则"按钮添加新的规则</li>
          <li><strong>编辑规则</strong>：点击"编辑"按钮修改现有规则</li>
          <li><strong>删除规则</strong>：点击"删除"按钮删除规则</li>
        </ul>
        <h4>示例：</h4>
        <ul>
          <li>为所有请求添加 <code>Authorization</code> 头：</li>
          <li>类型：请求头</li>
          <li>匹配URL：留空</li>
          <li>请求头名称：<code>Authorization</code></li>
          <li>请求头值：<code>Bearer your-token</code></li>
        </ul>
      </section>

      <!-- 接口请求 -->
      <section>
        <h3>3. 接口请求</h3>
        <p>接口请求功能允许您发送HTTP请求并查看响应结果。</p>
        <h4>使用方法：</h4>
        <ul>
          <li><strong>请求方法</strong>：选择HTTP请求方法（GET、POST、PUT、DELETE、PATCH）</li>
          <li><strong>请求URL</strong>：输入要请求的URL</li>
          <li><strong>Params (Query)</strong>：添加URL查询参数</li>
          <li><strong>Headers</strong>：添加请求头</li>
          <li><strong>Body</strong>：
            <ul>
              <li>None：不发送请求体</li>
              <li>JSON：发送JSON格式的请求体</li>
              <li>Text/Raw：发送原始文本请求体</li>
            </ul>
          </li>
          <li><strong>发送请求</strong>：点击"发送"按钮发送请求</li>
          <li><strong>查看响应</strong>：在下方查看响应结果，包括状态码、响应头和响应体</li>
        </ul>
        <h4>示例：</h4>
        <ul>
          <li>发送GET请求到 <code>https://jsonplaceholder.typicode.com/todos/1</code></li>
          <li>方法：GET</li>
          <li>URL：<code>https://jsonplaceholder.typicode.com/todos/1</code></li>
          <li>点击"发送"按钮，查看响应结果</li>
        </ul>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
// 关闭页面
function closePage() {
  window.close();
}
</script>

<style scoped>
.help-page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  min-height: 100vh;
}

.help-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e0e0e0;
}

.help-header h1 {
  color: #242424;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.help-content {
  line-height: 1.6;
}

section {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

h3 {
  margin-top: 0;
  color: #242424;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
}

h4 {
  color: #555;
  font-size: 14px;
  font-weight: 600;
  margin: 15px 0 10px 0;
}

p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 15px;
}

ul {
  margin: 10px 0;
  padding-left: 20px;
}

li {
  color: #666;
  line-height: 1.6;
  margin-bottom: 8px;
}

code {
  background-color: #e0e0e0;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 13px;
  color: #333;
}
</style>