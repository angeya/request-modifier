<template>
  <div class="test-section card">
    <el-form label-width="80px" size="small" class="test-form">
      <el-form-item label="待测试URL">
        <el-input v-model="testUrlRef.url" @input="saveAndUpdateUrlTestResult" size="small" placeholder="请输入URL(可输入部分内容)"/>
      </el-form-item>
      <el-form-item label="重定向结果">
        <el-input v-model="testUrlRef.result" size="small" disabled placeholder=""/>
      </el-form-item>
    </el-form>
  </div>

  <div class="section-header">
    <h4 class="section-title">规则列表</h4>
    <el-button type="primary" @click="addRule" size="small">添加规则</el-button>
  </div>
  <div v-for="(rule, index) in ruleListRef" :key="index" class="rule-card card">
    <div class="rule-row">
      <el-input class="rule-input" v-model="rule.match" :disabled="!rule.isEditing"
             placeholder="匹配值，支持正则" size="small"/>
      <el-input class="rule-input" v-model="rule.replace" :disabled="!rule.isEditing"
             :placeholder="rule.isEditing ? '替换值' : ''" size="small"/>
      <el-switch v-model="rule.enabled" @change="doSaveRule()" size="small"/>
      <div class="rule-actions">
        <el-button :type="rule.isEditing ? 'success' : 'primary'" size="small" @click="rule.isEditing ? saveRule(rule) : (rule.isEditing = true)">{{ rule.isEditing ? '保存' : '编辑' }}</el-button>
        <el-button type="danger" size="small" plain @click="removeRule(rule.id)">删除</el-button>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
import {onMounted, ref, toRaw} from 'vue'
import {saveRuleList, saveTestUrl, getTestUrl, loadRuleList} from '../api/chromeApi'
import type {Rule} from '../types'
import {ElMessage, ElMessageBox} from 'element-plus'


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
  if (!rule.match) {
    ElMessage.warning('URL匹配值不能为空')
    return
  }
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
  ElMessageBox.confirm('确定要删除该规则吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ruleListRef.value = ruleListRef.value.filter(rule => rule.id !== id)
    doSaveRule()
    ElMessage.success('删除成功')
  }).catch(() => {
    // 用户取消删除
  })
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
    if (rule.enabled && rule.match) {
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
.test-section {
  margin-bottom: 12px;
}

.test-form :deep(.el-form-item) {
  margin-bottom: 6px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 10px 0;
}

.section-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--app-text-primary);
}

.rule-card {
  margin-bottom: 10px;
  transition: box-shadow 0.2s, transform 0.2s;
}

.rule-card:hover {
  box-shadow: var(--app-shadow-md);
}

.rule-row {
  display: flex;
  gap: 6px;
  align-items: center;
}

.rule-row :deep(.el-switch) {
  margin: 0 2px;
  flex-shrink: 0;
}

.rule-input {
  flex: 1;
  min-width: 0;
}

.rule-input :deep(.el-input__wrapper) {
  min-height: 28px;
}

.rule-input :deep(.el-input__inner) {
  font-size: 14px;
}

.rule-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.rule-actions :deep(.el-button) {
  padding: 6px 8px;
  font-size: 13px;
  margin-left: 0;
}

.rule-actions :deep(.el-button + .el-button) {
  margin-left: 0;
}
</style>
