<script setup lang="ts">
import {ref, onMounted} from 'vue'
import { toRaw } from 'vue';
import {updateDynamicRules, saveRuleList, loadRuleList} from '../api/chromeApi'
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

function generateRuleId(): number {
  return Math.floor(Math.random() * 1000000000) + 1; // 1 ~ 999,999,999
}

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

function saveRule(rule: Rule): void {
  rule.isEditing = false
  console.log('最新列表数值：' + JSON.stringify(ruleListRef.value))
  saveRuleList(toRaw(ruleListRef.value));
  updateDynamicRules(ruleListRef.value, true)
}

function removeRule(id: number): void {
  ruleListRef.value = ruleListRef.value.filter(rule => rule.id !== id)
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
    <n-switch v-model:value="rule.enabled" @update:value=""/>
    <n-button v-if="rule.isEditing" type="success" size="small" @click="saveRule(rule)">保存</n-button>
    <n-button v-else type="warning" size="small" @click="rule.isEditing=true">编辑</n-button>
    <n-button type="error" size="small" @click="removeRule(rule.id)">删除</n-button>
  </div>
  <n-button type="info" @click="addRule">添加规则</n-button>

</template>

<style scoped>

</style>