<template>
  <n-card style="max-width: 1200px">
    <n-button type="primary" secondary @click="handleImport">
      从剪切板导入fetch api
    </n-button>
<!--    <n-collapse style="margin-bottom: 20px">-->
<!--      <n-collapse-item title="📥 导入 Fetch 代码 (支持 DevTools Copy as fetch)" name="1">-->
<!--        <n-input v-model:value="importCode"-->
<!--                 type="textarea"-->
<!--                 placeholder="在此粘贴 fetch(...) 代码"-->
<!--                 :autosize="{ minRows: 3, maxRows: 10 }"/>-->
<!--        <n-space style="margin-top: 10px" justify="end">-->
<!--          <n-button type="primary" secondary @click="handleImport">-->
<!--            从剪切板导入fetch api-->
<!--          </n-button>-->
<!--        </n-space>-->
<!--      </n-collapse-item>-->
<!--    </n-collapse>-->

    <!--  请求url-->
    <n-input-group>
      <n-select v-model:value="request.method" :options="methodOptions" style="width: 94px"/>
      <n-input v-model:value="request.url" placeholder="请输入接口地址 (https://...)" style="flex: 1"/>
      <n-button type="primary" @click="sendRequest" :loading="loading">发送</n-button>
    </n-input-group>

    <!--  请求参数  -->
    <n-tabs type="line" animated style="margin-top: 15px">
      <n-tab-pane name="params" tab="Params (Query)">
        <n-dynamic-input v-model:value="request.queryParams"
                         preset="pair" key-placeholder="Key" value-placeholder="Value">
          <template #action="{ index, create, remove }">
            <n-button @click="() => create(index)">
              <n-icon>
                <Add/>
              </n-icon>
            </n-button>
            <n-button @click="() => remove(index)">
              <n-icon>
                <Remove/>
              </n-icon>
            </n-button>
          </template>
        </n-dynamic-input>
      </n-tab-pane>

      <n-tab-pane name="headers" tab="Headers">
        <n-dynamic-input v-model:value="request.headers"
                         preset="pair"
                         key-placeholder="Key"
                         value-placeholder="Value"/>
      </n-tab-pane>

      <n-tab-pane name="body" tab="Body">
        <n-radio-group v-model:value="request.bodyType" name="bodyType">
          <n-space>
            <n-radio value="none">None</n-radio>
            <n-radio value="json">JSON</n-radio>
            <n-radio value="text">Text/Raw</n-radio>
          </n-space>
        </n-radio-group>
        <div style="margin-top: 10px" v-if="request.bodyType !== 'none'">
          <n-input v-model:value="request.bodyContent"
                   type="textarea"
                   placeholder="输入请求体内容"
                   :autosize="{ minRows: 5, maxRows: 15 }"
                   style="font-family: monospace"/>
          <n-button size="tiny" style="margin-top:5px" @click="formatBodyJson" v-if="request.bodyType === 'json'">
            格式化 JSON
          </n-button>
        </div>
      </n-tab-pane>
    </n-tabs>
    <n-divider/>

    <!--  请求响应  -->
    <div v-if="response.status !== 0">
      <n-space align="center" style="margin-bottom: 10px">
        <n-tag :type="response.ok ? 'success' : 'error'">
          Status: {{ response.status }} {{ response.statusText }}
        </n-tag>
        <n-tag type="info">Time: {{ response.time }} ms</n-tag>
      </n-space>

      <n-tabs type="segment">
        <n-tab-pane name="preview" tab="Response Body">
          <n-code :code="response.data"
                  language="json"
                  word-wrap
                  style="max-height: 500px; overflow: auto; background: #f5f5f5; padding: 10px; border-radius: 4px;"/>
        </n-tab-pane>
        <n-tab-pane name="resHeaders" tab="Response Headers">
          <n-table size="small" striped>
            <thead>
            <tr>
              <th>Key</th>
              <th>Value</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(val, key) in response.headers" :key="key">
              <td>{{ key }}</td>
              <td>{{ val }}</td>
            </tr>
            </tbody>
          </n-table>
        </n-tab-pane>
      </n-tabs>
    </div>
    <n-empty v-else description="暂无请求响应" style="margin-top: 40px"/>
  </n-card>
</template>

<script setup lang="ts">
import {reactive, ref} from 'vue';
import {useMessage} from 'naive-ui';
import {Add, Remove} from '@vicons/ionicons5'

// --- 类型定义 ---
interface KeyValue {
  key: string;
  value: string;
}

interface RequestState {
  url: string;
  method: string;
  queryParams: KeyValue[];
  headers: KeyValue[];
  bodyType: 'none' | 'json' | 'text';
  bodyContent: string;
}

interface ResponseState {
  status: number;
  statusText: string;
  ok: boolean;
  data: string;
  headers: Record<string, string>;
  time: number;
}

// --- 状态 ---
const message = useMessage();
const loading = ref(false);
const importCode = ref('');

const methodOptions = [
  {label: 'GET', value: 'GET'},
  {label: 'POST', value: 'POST'},
  {label: 'PUT', value: 'PUT'},
  {label: 'DELETE', value: 'DELETE'},
  {label: 'PATCH', value: 'PATCH'}
];

// 请求状态
const request = reactive<RequestState>({
  url: '',
  method: 'GET',
  queryParams: [],
  headers: [],
  bodyType: 'none',
  bodyContent: ''
});

// 响应状态
const response = reactive<ResponseState>({
  status: 0,
  statusText: '',
  ok: false,
  data: '',
  headers: {},
  time: 0
});

async function getClipboardContent(): Promise<string | null> {
  try {
    const text = await navigator.clipboard.readText();
    console.log('剪贴板内容:', text);
    return text;
  } catch (err) {
    console.error('无法读取剪贴板:', err);
    return null;
  }
}

const handleImport = async () => {
  // const code = importCode.value.trim();
  const code = await getClipboardContent()
  if (!code) {
    message.warning('请先粘贴 fetch 代码');
    return;
  }

  try {
    // 1. 提取 URL
    const urlMatch = code.match(/fetch\s*\(\s*(["'`])(.*?)\1/);
    if (!urlMatch) {
      throw new Error('未找到有效的 fetch URL');
    }
    // 修复之前的 TS 报错：添加 || '' 确保类型为 string
    let rawUrl = urlMatch[2] || '';

    // 2. 提取 Options 对象字符串
    // 匹配第二个参数：fetch("url", { ... }) 中的 { ... }
    const optionsMatch = code.match(/fetch\s*\(.*,\s*({[\s\S]*})\s*\);?/);

    let options: any = {};
    if (optionsMatch) {
      let jsonStr = optionsMatch[1] || '';

      try {
        // --- 核心修复：手动清洗字符串以符合 JSON 规范 ---

        // 1. 去除尾随逗号 (JSON 不允许，但 Copy as fetch 经常有)
        // 例如: { "a": 1, } -> { "a": 1 }
        jsonStr = jsonStr.replace(/,\s*([\]}])/g, '$1');

        // 2. 尝试处理未加引号的 key (有些浏览器可能会这样输出)
        // 匹配: { key: "value" } -> { "key": "value" }
        // 注意：这只是一个简单的正则修复，应对简单情况
        jsonStr = jsonStr.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');

        // 3. 尝试将单引号替换为双引号 (如果 key 或 value 用了单引号)
        // 警告：如果内容本身包含引号，这里可能会误伤，但在标准 fetch copy 中比较少见
        // 为了安全起见，我们先尝试直接 parse，如果失败再尝试替换单引号

        options = JSON.parse(jsonStr);
      } catch (e) {
        // 如果直接 Parse 失败，尝试一种激进的单引号替换法再试一次
        try {
          // 替换 key/value 的单引号为双引号，保留转义
          // 这是一个比较简陋的修正，专门针对非标准 JSON 格式
          const fixedQuotes = jsonStr.replace(/'/g, '"');
          options = JSON.parse(fixedQuotes);
        } catch (err) {
          console.error('JSON Parse failed:', e);
          message.error('解析配置失败：请确保内容接近 JSON 格式');
          return;
        }
      }
    }

    // --- 后续逻辑保持不变 ---

    // A. URL & Query Params
    const urlObj = new URL(rawUrl);
    request.url = urlObj.origin + urlObj.pathname;

    const newParams: KeyValue[] = [];
    urlObj.searchParams.forEach((value, key) => {
      newParams.push({key, value});
    });
    request.queryParams = newParams;

    // B. Method
    request.method = (options.method || 'GET').toUpperCase();

    // C. Headers
    const newHeaders: KeyValue[] = [];
    if (options.headers) {
      for (const [key, value] of Object.entries(options.headers)) {
        newHeaders.push({key, value: String(value)});
      }
    }
    request.headers = newHeaders;

    // D. Body
    if (options.body) {
      let bodyStr = options.body;
      try {
        const parsed = JSON.parse(bodyStr);
        if (typeof parsed === 'object') {
          request.bodyType = 'json';
          request.bodyContent = JSON.stringify(parsed, null, 2);
        } else {
          request.bodyType = 'text';
          request.bodyContent = bodyStr;
        }
      } catch (e) {
        request.bodyType = 'text';
        request.bodyContent = bodyStr;
      }
    } else {
      request.bodyType = 'none';
      request.bodyContent = '';
    }

    message.success('导入成功！');

  } catch (e: any) {
    console.error(e);
    message.error(`导入失败: ${e.message}`);
  }
};
// 辅助：格式化 JSON
const formatBodyJson = () => {
  try {
    const obj = JSON.parse(request.bodyContent);
    request.bodyContent = JSON.stringify(obj, null, 2);
  } catch (e) {
    message.warning('内容不是有效的 JSON');
  }
};

// --- 核心逻辑 2: 发送请求 ---
const sendRequest = async () => {
  if (!request.url) {
    message.warning('请输入 URL');
    return;
  }

  loading.value = true;
  const startTime = performance.now();

  // 重置响应
  response.status = 0;
  response.data = '';

  try {
    // 1. 构建 URL + Query Params
    const urlObj = new URL(request.url);
    request.queryParams.forEach(p => {
      if (p.key) urlObj.searchParams.append(p.key, p.value);
    });

    // 2. 构建 Headers
    const headersObj: Record<string, string> = {};
    request.headers.forEach(h => {
      if (h.key) headersObj[h.key] = h.value;
    });

    // 3. 构建 Body
    let bodyPayload: BodyInit | null = null;
    if (request.method !== 'GET' && request.method !== 'HEAD' && request.bodyType !== 'none') {
      bodyPayload = request.bodyContent;
    }

    // 4. 执行 Fetch
    const res = await fetch(urlObj.toString(), {
      method: request.method,
      headers: headersObj,
      body: bodyPayload
    });

    const endTime = performance.now();
    response.time = Math.round(endTime - startTime);
    response.status = res.status;
    response.statusText = res.statusText;
    response.ok = res.ok;

    // 提取响应头
    response.headers = {};
    res.headers.forEach((val, key) => {
      response.headers[key] = val;
    });

    // 提取响应体
    const contentType = res.headers.get('content-type') || '';
    const textData = await res.text();

    if (contentType.includes('application/json')) {
      try {
        response.data = JSON.stringify(JSON.parse(textData), null, 2);
      } catch {
        response.data = textData;
      }
    } else {
      response.data = textData;
    }

  } catch (e: any) {
    message.error(`请求失败: ${e.message}`);
    response.data = `Error: ${e.message}`;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* 简单的样式调整 */
:deep(.n-dynamic-input .n-button) {
  margin-left: 10px;
}
</style>