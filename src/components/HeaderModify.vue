<template>
  <h4>header修改规则</h4>
  <div v-for="(rule, index) in headerRuleListRef" :key="index" class="card" 
       style="width: 480px; margin: 14px 0; display: flex; flex-direction: column; gap: 10px; padding: 10px; border: 1px solid #e0e0e0; border-radius: 6px;">
    <!-- 第一行：URL匹配、启用开关和操作按钮 -->
    <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
      <n-input type="text" class="rule-input" v-model:value="rule.match" :disabled="!rule.isEditing" 
               placeholder="匹配URL，支持正则" style="flex: 1;"></n-input>
      <n-switch v-model:value="rule.enabled" @update:value="doSaveRule()"></n-switch>
      <div style="margin-left: auto; display: flex; gap: 5px;">
        <n-button v-show="rule.isEditing" type="success" size="small" @click="saveRule(rule)">保存</n-button>
        <n-button v-show="!rule.isEditing" type="warning" size="small" @click="rule.isEditing=true">编辑</n-button>
        <n-button type="error" size="small" @click="removeRule(rule.id)">删除</n-button>
      </div>
    </div>
    <!-- 第二行：类型、请求头/响应头名称和值 -->
    <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
      <n-select v-model:value="rule.type" :disabled="!rule.isEditing" :options="headerTypeOptions" style="width: 100px;" transfer popper-placement="bottom-start"></n-select>
      <n-input type="text" class="rule-input" v-model:value="rule.headerName" :disabled="!rule.isEditing" 
               :placeholder="rule.type === 'request' ? '请求头名称' : '响应头名称'" style="flex: 1; min-width: 150px;"></n-input>
      <n-input type="text" class="rule-input" v-model:value="rule.headerValue" :disabled="!rule.isEditing" 
               :placeholder="rule.type === 'request' ? '请求头值，空值表示删除' : '响应头值，空值表示删除'" style="flex: 1; min-width: 150px;"></n-input>
    </div>
  </div>
  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
    <n-button type="info" @click="addRule" size="small">添加规则</n-button>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, toRaw} from 'vue'
import {saveHeaderRuleList, loadHeaderRuleList} from '../api/chromeApi'
import type {HeaderRule} from '../types'

// 头类型选项
const headerTypeOptions = [
  {label: '请求头', value: 'request'},
  {label: '响应头', value: 'response'}
]

const headerRuleListRef = ref<HeaderRule[]>([])

onMounted(async () => {
  // 加载规则列表
  const headerRuleList: HeaderRule[] = await loadHeaderRuleList()
  console.log('获取请求头规则：', headerRuleList)
  headerRuleListRef.value = headerRuleList
})

/**
 * 生成规则id
 */
function generateRuleId(): number {
  return Math.floor(Math.random() * 1000000000) + 1
}

/**
 * 添加规则
 */
function addRule(): void {
  const rule = {
    id: generateRuleId(),
    match: '',
    headerName: '',
    headerValue: '',
    enabled: true,
    isEditing: true,
    type: 'request'
  } as HeaderRule
  headerRuleListRef.value.push(rule)
}

/**
 * 保存规则
 */
function saveRule(rule: HeaderRule): void {
  rule.isEditing = false
  doSaveRule()
}

/**
 * 保存所有规则
 */
function doSaveRule(): void {
  console.log('保存请求头规则：', JSON.stringify(headerRuleListRef.value))
  // 数据持久化的时候需要脱响应式，否则数据结构可能与预期不符
  saveHeaderRuleList(toRaw(headerRuleListRef.value))
}

/**
 * 删除规则
 * @param id 规则id
 */
function removeRule(id: number): void {
  headerRuleListRef.value = headerRuleListRef.value.filter(rule => rule.id !== id)
  doSaveRule()
}
</script>

<style scoped>
.rule-input {
  flex: 1;
}

.info {
  font-size: 12px;
  color: #666;
}
</style>