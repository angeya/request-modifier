<template>
  <div class="section-header">
    <h4 class="section-title">规则列表</h4>
    <el-button type="primary" @click="addRule" size="small">添加规则</el-button>
  </div>
  <div v-for="(rule, index) in headerRuleListRef" :key="index" class="rule-card card">
    <!-- 第一行：URL匹配、启用开关和操作按钮 -->
    <div class="rule-row">
      <el-input class="rule-input" v-model="rule.match" :disabled="!rule.isEditing" 
               placeholder="匹配URL，支持正则" size="small"></el-input>
      <el-switch v-model="rule.enabled" @change="doSaveRule()" size="small"></el-switch>
      <div class="rule-actions">
        <el-button :type="rule.isEditing ? 'success' : 'primary'" :plain="!rule.isEditing" size="small" @click="rule.isEditing ? saveRule(rule) : (rule.isEditing = true)">{{ rule.isEditing ? '保存' : '编辑' }}</el-button>
        <el-button type="danger" size="small" plain @click="removeRule(rule.id)">删除</el-button>
      </div>
    </div>
    <!-- 第二行：类型、请求头/响应头名称和值 -->
    <div class="rule-row" style="margin-top: 8px;">
      <el-select v-model="rule.type" :disabled="!rule.isEditing" style="width: 130px; flex-shrink: 0;" placeholder="类型" size="small">
        <el-option v-for="opt in headerTypeOptions" :key="opt.value" :label="opt.label" :value="opt.value" :disabled="opt.disabled"/>
      </el-select>
      <el-input class="rule-input" v-model="rule.headerName" :disabled="!rule.isEditing" 
               :placeholder="rule.type === 'request' ? '请求头名称' : '响应头名称'" size="small"></el-input>
      <el-input class="rule-input" v-model="rule.headerValue" :disabled="!rule.isEditing" 
               :placeholder="rule.type === 'request' ? '请求头值，空值表示删除' : '响应头值，空值表示删除'" size="small"></el-input>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, toRaw} from 'vue'
import {saveHeaderRuleList, loadHeaderRuleList} from '../api/chromeApi'
import type {HeaderRule} from '../types'
import {ElMessage, ElMessageBox} from 'element-plus'

// 头类型选项
const headerTypeOptions = [
  {label: '请求头', value: 'request'},
  {label: '响应头（暂不支持）', value: 'response', disabled: true}
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
  if (!rule.headerName) {
    ElMessage.warning('Header名称不能为空')
    return
  }
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
  ElMessageBox.confirm('确定要删除该规则吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    headerRuleListRef.value = headerRuleListRef.value.filter(rule => rule.id !== id)
    doSaveRule()
    ElMessage.success('删除成功')
  }).catch(() => {
    // 用户取消删除
  })
}
</script>

<style scoped>
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 10px 0;
}

.section-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--neu-text-primary);
  letter-spacing: 0.5px;
}

.rule-card {
  margin-bottom: 8px;
  transition: box-shadow 0.2s;
}

.rule-card:hover {
  box-shadow: 5px 5px 10px var(--neu-shadow-dark),
              -5px -5px 10px var(--neu-shadow-light);
}

.rule-row {
  display: flex;
  gap: 6px;
  align-items: center;
}

.rule-input {
  flex: 1;
  min-width: 0;
}

.rule-actions {
  display: flex;
  gap: 0;
  flex-shrink: 0;
}

.rule-actions :deep(.el-button) {
  padding: 5px 6px;
  font-size: 12px;
}
</style>
