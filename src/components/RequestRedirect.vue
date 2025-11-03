<script setup lang="ts">
import {onMounted, ref, toRaw} from 'vue'
import {loadRuleList, saveRuleList, updateDynamicRules} from '../api/chromeApi'
import type {Rule} from '../types'

onMounted(async () => {
  const ruleList: Rule[] = await loadRuleList()
  console.log('获取看看什么类型', ruleList.toString())
  ruleListRef.value = ruleList;
})
const ruleTest = ref({
  url: '',
  result: '',
})

const ruleListRef = ref([] as Rule[])

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
 * URL 测试功能
 * @param rules 规则列表
 */
// function updateUrlTest(rules: Rule[]): void {
//   const testUrl = ruleTest.value.url
//
//   if (!testUrl) {
//     ruleTest.value.result = ''
//     return;
//   }
//
//   let modifiedUrl = testUrl;
//   for (const rule of rules) {
//     if (rule.enabled && rule.match && rule.replace) {
//       try {
//         const regex = new RegExp(rule.match, 'g');
//         modifiedUrl = modifiedUrl.replace(regex, rule.replace);
//       } catch (e) {
//         console.error(`规则 ${rule.match} 无效: ${e}`);
//       }
//     }
//   }
//   ruleTest.value.result = modifiedUrl;
// }

</script>

<template>
  <div class="card" style="width: 500px">
    <n-form-item label="待测试URL" path="url">
      <n-input v-model:value="ruleTest.url" placeholder="请输入URL(可输入部分内容)"/>
    </n-form-item>
    <n-form-item label="重定向结果" path="result">
      <n-input v-model:value="ruleTest.result" disabled placeholder=""/>
    </n-form-item>
  </div>

  <h4>规则列表</h4>
  <div v-for="(rule, index) in ruleListRef" :key="index" class="card"
       style="width: 500px; margin: 14px 0; display: flex; gap: 10px; align-items: center;">
    <n-input type="text" class="rule-input" v-model:value="rule.match" :disabled="!rule.isEditing"
             placeholder="匹配值，支持正则"/>
    <n-input type="text" class="rule-input" v-model:value="rule.replace" :disabled="!rule.isEditing"
             placeholder="替换值"/>
    <n-switch v-model:value="rule.enabled" @update:value="doSaveRule()"/>
    <n-button v-show="rule.isEditing" type="success" size="small" @click="saveRule(rule)">保存</n-button>
    <n-button v-show="!rule.isEditing" type="warning" size="small" @click="rule.isEditing=true">编辑</n-button>
    <n-button type="error" size="small" @click="removeRule(rule.id)">删除</n-button>
  </div>
  <n-button type="info" @click="addRule">添加规则</n-button>

</template>

<style scoped>

</style>