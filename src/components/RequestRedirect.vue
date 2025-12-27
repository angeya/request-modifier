<template>
  <div class="card" style="width: 480px">
    <n-form label-placement="left" size="small" class="test-form" :show-feedback="false">
      <n-form-item label="待测试URL" path="url">
        <n-input v-model:value="testUrlRef.url" @update:value="saveAndUpdateUrlTestResult" size="small" placeholder="请输入URL(可输入部分内容)"/>
      </n-form-item>
      <n-form-item label="重定向结果" path="result">
        <n-input v-model:value="testUrlRef.result" size="small" disabled placeholder=""/>
      </n-form-item>
    </n-form>
  </div>

  <h4>规则列表</h4>
  <div v-for="(rule, index) in ruleListRef" :key="index" class="card"
       style="width: 480px; margin: 14px 0; display: flex; gap: 10px; align-items: center;">
    <n-input type="text" class="rule-input" v-model:value="rule.match" :disabled="!rule.isEditing"
             placeholder="匹配值，支持正则"/>
    <n-input type="text" class="rule-input" v-model:value="rule.replace" :disabled="!rule.isEditing"
             placeholder="替换值"/>
    <n-switch v-model:value="rule.enabled" @update:value="doSaveRule()"/>
    <n-button v-show="rule.isEditing" type="success" size="small" @click="saveRule(rule)">保存</n-button>
    <n-button v-show="!rule.isEditing" type="warning" size="small" @click="rule.isEditing=true">编辑</n-button>
    <n-button type="error" size="small" @click="removeRule(rule.id)">删除</n-button>
  </div>
  <n-button type="info" @click="addRule" size="small">添加规则</n-button>

</template>

<script setup lang="ts">
import {onMounted, ref, toRaw} from 'vue'
import {saveRuleList, saveTestUrl, getTestUrl, loadRuleList, updateDynamicRules} from '../api/chromeApi'
import type {Rule} from '../types'


interface TestUrl {
  url: string
  result: string
}

const testUrlRef = ref<TestUrl>({
  url: '',
  result: ''
})

const ruleListRef = ref<Rule[]>([])

onMounted(async () => {
  // 加载测试URL
  testUrlRef.value.url = await getTestUrl()

  // 加载规则列表
  const ruleList: Rule[] = await loadRuleList()
  console.log('获取看看什么类型', ruleList.toString())
  ruleListRef.value = ruleList

  // 更新测试URL结果
  updateUrlTestResult()
})


/**
 * 生成规则id
 */
function generateRuleId(): number {
  return Math.floor(Math.random() * 1000000000) + 1;
}

/**
 * 添加规则
 */
function addRule(): void {
  const rule = {
    id: generateRuleId(),
    match: '',
    replace: '',
    enabled: true,
    isEditing: true,
  } as Rule
  ruleListRef.value.push(rule)
}

/**
 * 保存规则
 */
function saveRule(rule: Rule): void {
  console.log('最新列表数值：' + JSON.stringify(ruleListRef.value))
  rule.isEditing = false
  doSaveRule()
}

/**
 * 保存规则
 */
function doSaveRule(): void {
  console.log('最新列表数值：' + JSON.stringify(ruleListRef.value))
  // 数据持久化的时候需要脱响应式，否则数据机构可能与预期不符
  saveRuleList(toRaw(ruleListRef.value));
  updateDynamicRules(ruleListRef.value)
  updateUrlTestResult()
}

function saveAndUpdateUrlTestResult(testUrl: string) {
  saveTestUrl(testUrl)
  updateUrlTestResult()
}

/**
 * 删除规则
 * @param id
 */
function removeRule(id: number): void {
  ruleListRef.value = ruleListRef.value.filter(rule => rule.id !== id)
  doSaveRule()
}

/**
 * 更新url测试结果
 */
function updateUrlTestResult(): void {
  const testUrl = testUrlRef.value.url
  const rules = ruleListRef.value
  if (!testUrl) {
    return;
  }

  let modifiedUrl = testUrl;
  for (const rule of rules) {
    if (rule.enabled && rule.match && rule.replace) {
      try {
        const regex = new RegExp(rule.match, 'g');
        modifiedUrl = modifiedUrl.replace(regex, rule.replace);
      } catch (e) {
        console.error(`规则 ${rule.match} 无效: ${e}`);
      }
    }
  }
  testUrlRef.value.result = modifiedUrl;
}

</script>

<style scoped>
.test-form :deep(.n-form-item) {
  margin-bottom: 4px; /* 默认大概 16~24px */
}
</style>