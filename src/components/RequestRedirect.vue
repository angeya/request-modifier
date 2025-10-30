<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {updateDynamicRules, saveRuleList, loadRuleList} from '../api/chromeApi'
import type {Rule} from '../types'

onMounted(() => {
  const ruleList: Rule[] = loadRuleList()
  ruleListRef.value = ruleList
})
const ruleTest = ref({
  url: '',
  result: '',
})

const ruleListRef = ref([
      {
        id: 1,
        match: '',
        replace: '',
        enabled: true,
        isEditing: false,
      },
      {
        id: 2,
        match: '',
        replace: '',
        enabled: false,
        isEditing: true,
      }
    ] as Rule[]
)

function addRule(): void {
  const rule = {
    id: Date.now(),
    match: '',
    replace: '',
    enabled: true,
    isEditing: true,
  } as Rule
  ruleListRef.value.push(rule)
}

function saveRule(rule: Rule): void {
  rule.isEditing = false
  saveRuleList(ruleListRef.value);
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
  <div class="card" style="width: 600px">
    <n-form-item label="待测试URL" path="url">
      <n-input v-model:value="ruleTest.url" placeholder="请输入URL(可输入部分内容)"/>
    </n-form-item>
    <n-form-item label="重定向结果" path="result">
      <n-input v-model:value="ruleTest.result" disabled placeholder=""/>
    </n-form-item>
  </div>

  <h4>规则列表</h4>
  <div v-for="(rule, index) in ruleListRef" :key="index" class="card"
       style="width: 600px; margin: 14px 0; display: flex; gap: 10px; align-items: center;">
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