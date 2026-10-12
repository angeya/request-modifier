<template>
  <div class="test-section card">
    <div class="test-header" @click="toggleTestPanel">
      <span class="test-title">URL 测试</span>
      <svg class="test-arrow" :class="{'is-collapsed': testPanelCollapsed}" viewBox="0 0 1024 1024" width="14" height="14">
        <path fill="currentColor" d="M831.872 340.864 512 652.672 192.128 340.864a30.592 30.592 0 0 0-42.752 0 29.12 29.12 0 0 0 0 41.6L489.664 714.24a32 32 0 0 0 44.672 0l340.288-331.712a29.12 29.12 0 0 0 0-41.728 30.592 30.592 0 0 0-42.752 0z"/>
      </svg>
    </div>
    <el-form v-show="!testPanelCollapsed" label-width="80px" size="small" class="test-form">
      <el-form-item label="待测试URL">
        <el-input v-model="testUrlRef.url" @input="saveAndUpdateUrlTestResult" size="small" placeholder="请输入URL(可输入部分内容)"/>
      </el-form-item>
      <el-form-item label="重定向结果">
        <el-input v-model="testUrlRef.result" size="small" disabled placeholder=""/>
      </el-form-item>
    </el-form>
  </div>

  <div class="section-header">
    <div class="section-header-left">
      <h4 class="section-title">规则列表</h4>
      <el-tooltip :content="layoutMode === 'horizontal' ? '切换为纵向布局' : '切换为横向布局'" placement="top">
        <el-button text size="small" class="layout-toggle-btn" @click="toggleLayout">
          <!-- 当前为横向时展示纵向排列图标，点击切换为上下排列 -->
          <svg v-if="layoutMode === 'horizontal'" viewBox="0 0 24 24" width="15" height="15">
            <path fill="currentColor" d="M4 4h16a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm0 10h16a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1z"/>
          </svg>
          <!-- 当前为纵向时展示横向排列图标，点击切换为左右排列 -->
          <svg v-else viewBox="0 0 24 24" width="15" height="15">
            <path fill="currentColor" d="M4 4h6a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm10 0h6a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"/>
          </svg>
        </el-button>
      </el-tooltip>
    </div>
    <el-button type="primary" @click="addRule" size="small">添加规则</el-button>
  </div>
  <div v-for="(rule, index) in ruleListRef" :key="index" class="rule-card card">
    <!-- 横向布局：匹配值/替换值左右排列 -->
    <div v-if="layoutMode === 'horizontal'" class="rule-row">
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
    <!-- 纵向布局：匹配值/替换值上下排列充分利用宽度，开关和按钮在右侧纵向排列 -->
    <div v-else class="rule-vertical">
      <div class="rule-inputs">
        <el-input v-model="rule.match" :disabled="!rule.isEditing"
               placeholder="匹配值，支持正则" size="small"/>
        <el-input v-model="rule.replace" :disabled="!rule.isEditing"
               :placeholder="rule.isEditing ? '替换值' : ''" size="small"/>
      </div>
      <div class="rule-side">
        <el-switch v-model="rule.enabled" @change="doSaveRule()"/>
        <el-button :type="rule.isEditing ? 'success' : 'primary'" size="small" @click="rule.isEditing ? saveRule(rule) : (rule.isEditing = true)">{{ rule.isEditing ? '保存' : '编辑' }}</el-button>
        <el-button type="danger" size="small" plain @click="removeRule(rule.id)">删除</el-button>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
import {onMounted, ref, toRaw} from 'vue'
import {saveRuleList, saveTestUrl, getTestUrl, loadRuleList, getUiPref, saveUiPref} from '../api/chromeApi'
import type {Rule} from '../types'
import {ElMessage, ElMessageBox} from 'element-plus'


/**
 * 规则布局模式，horizontal为匹配值/替换值左右排列，vertical为上下排列
 */
type RuleLayout = 'horizontal' | 'vertical'

interface TestUrl {
  url: string
  result: string
}

const testUrlRef = ref<TestUrl>({
  url: '',
  result: ''
})

const ruleListRef = ref<Rule[]>([])

// URL测试面板是否折叠
const testPanelCollapsed = ref(false)

// 规则列表布局模式
const layoutMode = ref<RuleLayout>('horizontal')

onMounted(async () => {
  // 加载测试URL
  testUrlRef.value.url = await getTestUrl()

  // 加载规则列表
  const ruleList: Rule[] = await loadRuleList()
  console.log('获取看看什么类型', ruleList.toString())
  ruleListRef.value = ruleList

  // 加载界面偏好：测试面板折叠状态、规则布局模式
  testPanelCollapsed.value = await getUiPref('testPanelCollapsed', false)
  layoutMode.value = await getUiPref<RuleLayout>('ruleLayout', 'horizontal')

  // 更新测试URL结果
  updateUrlTestResult()
})

/**
 * 切换URL测试面板折叠/展开
 */
function toggleTestPanel(): void {
  testPanelCollapsed.value = !testPanelCollapsed.value
  saveUiPref('testPanelCollapsed', testPanelCollapsed.value)
}

/**
 * 切换规则列表布局模式
 */
function toggleLayout(): void {
  layoutMode.value = layoutMode.value === 'horizontal' ? 'vertical' : 'horizontal'
  saveUiPref('ruleLayout', layoutMode.value)
}


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

.test-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
}

.test-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--app-text-primary);
}

.test-arrow {
  color: var(--app-text-muted);
  transition: transform 0.2s;
}

.test-arrow.is-collapsed {
  transform: rotate(-90deg);
}

.test-form {
  margin-top: 10px;
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

.section-header-left {
  display: flex;
  align-items: center;
  gap: 2px;
}

.section-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--app-text-primary);
}

.layout-toggle-btn {
  color: var(--app-text-muted) !important;
  padding: 4px !important;
  margin-left: 4px;
}

.layout-toggle-btn:hover {
  color: var(--app-accent) !important;
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

/* 纵向布局：输入区和右侧控制列横向排列 */
.rule-vertical {
  display: flex;
  gap: 8px;
  align-items: stretch;
}

/* 纵向布局输入区：匹配值/替换值上下排列 */
.rule-inputs {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 右侧控制列：开关和按钮纵向排列，通过两端分布与两行输入框总高度对齐 */
.rule-side {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-shrink: 0;
}

/* 开关拉伸至与按钮同宽，高度与按钮一致 */
.rule-side :deep(.el-switch) {
  width: 100%;
  height: 20px;
  font-size: 12px;
  line-height: 16px;
}

.rule-side :deep(.el-switch__core) {
  width: 100%;
  height: 20px;
}

.rule-side :deep(.el-button) {
  margin-left: 0;
  padding: 2px 8px;
  font-size: 12px;
  height: 20px;
}

.rule-row :deep(.el-switch) {
  margin: 0 2px;
  flex-shrink: 0;
}

.rule-input {
  flex: 1;
  min-width: 0;
}

.rule-inputs :deep(.el-input__wrapper) {
  min-height: 28px;
}

.rule-inputs :deep(.el-input__inner) {
  font-size: 14px;
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
