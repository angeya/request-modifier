<script setup lang="ts">
import RequestRedirect from './components/RequestRedirect.vue'
import HeaderModify from "./components/HeaderModify.vue";
import {onMounted, ref, computed} from "vue";
import {disablePlugin, enablePlugin, getPluginStatus, loadRuleList, loadHeaderRuleList} from "./api/chromeApi.ts";
import type {Rule, HeaderRule} from './types';
import zhifubaoImg from './assets/zhifubao.png'

const pluginStatus = ref(true)
const ruleList = ref<Rule[]>([])
const headerRuleList = ref<HeaderRule[]>([])
const showAppreciate = ref(false)
const activeTab = ref('requestRedirect')
const installTime = ref<number | null>(null)

onMounted(async () => {
  pluginStatus.value = await getPluginStatus()
  console.log('初始化状态', pluginStatus.value)
  
  await loadRuleLists()
  await recordInstallTime()
  
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
      if (changes.ruleList || changes.headerRuleList) {
        loadRuleLists()
      }
    }
  })
})

/**
 * 记录插件安装时间，首次安装时写入当前时间戳
 */
async function recordInstallTime() {
  const result = await chrome.storage.sync.get('installTime')
  if (result.installTime) {
    installTime.value = result.installTime
  } else {
    const now = Date.now()
    await chrome.storage.sync.set({ installTime: now })
    installTime.value = now
  }
}

/**
 * 判断是否已安装超过2天
 */
const isInstalledOverTwoDays = computed(() => {
  if (!installTime.value) return false
  const twoDaysMs = 2 * 24 * 60 * 60 * 1000
  return Date.now() - installTime.value > twoDaysMs
})

/**
 * 总规则数
 */
const totalRuleCount = computed(() => {
  return ruleList.value.length + headerRuleList.value.length
})

/**
 * 是否显示赞赏链接
 */
const showAppreciateLink = computed(() => {
  return isInstalledOverTwoDays.value && totalRuleCount.value > 0
})

async function loadRuleLists() {
  ruleList.value = await loadRuleList()
  headerRuleList.value = await loadHeaderRuleList()
  console.log('规则列表已更新', ruleList.value, headerRuleList.value)
}

const hasEnabledRedirectRule = computed(() => {
  return ruleList.value.some(rule => rule.enabled)
})

const hasEnabledHeaderRule = computed(() => {
  return headerRuleList.value.some(rule => rule.enabled)
})

function enable() {
  pluginStatus.value = true
  enablePlugin()
}

function disable() {
  pluginStatus.value = false
  disablePlugin()
}

function openHelpPage() {
  const helpPageUrl = chrome.runtime.getURL('help.html');
  chrome.tabs.create({ url: helpPageUrl });
}
</script>

<template>
  <div class="app-container">
    <!-- 顶部标题栏 -->
    <div class="header-bar">
      <h3 class="app-title">请求修改器</h3>
      <el-button class="power-btn" text v-show="pluginStatus" @click="disable">
        <img src="./assets/power-on.svg" alt="">
      </el-button>
      <el-button class="power-btn" text v-show="!pluginStatus" @click="enable">
        <img src="./assets/power-off.svg" alt="">
      </el-button>
      <span v-show="pluginStatus" class="status-text status-on">努力工作中...</span>
      <span v-show="!pluginStatus" class="status-text status-off">安心休息中...</span>
      
      <img v-show="pluginStatus" class="status-gif" style="height: 36px; width: 36px;" src="./assets/work.gif" alt="">
      <img v-show="!pluginStatus" class="status-gif" style="height: 36px; width: 36px;" src="./assets/sleep.gif" alt="">
    </div>

    <!-- 中间内容区 -->
    <div class="tabs-wrapper">
      <el-tabs v-model="activeTab">
        <el-tab-pane name="requestRedirect" class="tab-pane">
          <template #label>
            <span class="tab-label">
              请求重定向
              <span class="dot" :class="hasEnabledRedirectRule ? 'dot-on' : 'dot-off'"></span>
            </span>
          </template>
          <request-redirect></request-redirect>
        </el-tab-pane>
        <el-tab-pane name="headerModify" class="tab-pane">
          <template #label>
            <span class="tab-label">
              Header修改
              <span class="dot" :class="hasEnabledHeaderRule ? 'dot-on' : 'dot-off'"></span>
            </span>
          </template>
          <header-modify></header-modify>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 底部栏 -->
    <div class="footer-bar">
      <a href="#" class="footer-link" @click.prevent="openHelpPage">帮助</a>
      <a href="#" class="footer-link appreciate-link" v-show="showAppreciateLink" @click.prevent="showAppreciate = true">如果插件有帮助到你，可以考虑赞赏1块钱哦</a>
    </div>

    <!-- 赞赏弹窗 -->
    <el-dialog v-model="showAppreciate" title="赞赏支持" width="280px" :close-on-click-modal="true" align-center>
      <div style="text-align: center;">
        <img :src="zhifubaoImg" alt="赞赏二维码" style="width: 100%; border-radius: 6px;" />
        <p style="margin: 10px 0 0; color: #909399; font-size: 12px;">支付宝扫码赞赏</p>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.header-bar {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding: 10px 16px;
  background-color: var(--neu-bg-card);
  border-radius: var(--neu-radius);
  box-shadow: 3px 3px 8px var(--neu-shadow-dark),
              -3px -3px 8px var(--neu-shadow-light);
  margin-bottom: 10px;
  overflow: hidden;
}

.app-title {
  color: var(--neu-text-primary);
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.power-btn {
  margin-left: 12px;
  padding: 4px !important;
  border-radius: 50% !important;
  box-shadow: 2px 2px 4px var(--neu-shadow-dark),
              -2px -2px 4px var(--neu-shadow-light) !important;
}

.status-text {
  margin-left: 8px;
  font-size: 13px;
  font-weight: 500;
}

.status-on {
  color: var(--neu-success);
}

.status-off {
  color: var(--neu-text-muted);
}

.status-gif {
  margin-left: auto;
}

.tabs-wrapper {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 10px 14px;
  background-color: var(--neu-bg);
  border-radius: var(--neu-radius);
  box-shadow: inset 2px 2px 5px var(--neu-shadow-dark),
              inset -2px -2px 5px var(--neu-shadow-light);
}

.tabs-wrapper :deep(.el-tabs) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.tabs-wrapper :deep(.el-tabs__header) {
  margin-bottom: 0;
  border-radius: var(--neu-radius-sm);
  overflow: hidden;
}

.tabs-wrapper :deep(.el-tabs__content) {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 10px 0;
}

.tabs-wrapper :deep(.el-tab-pane) {
  height: 100%;
  overflow-y: auto;
}

.tab-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  box-shadow: inset 1px 1px 2px var(--neu-shadow-dark),
              inset -1px -1px 2px var(--neu-shadow-light);
}

.dot-on {
  background-color: var(--neu-success);
}

.dot-off {
  background-color: var(--neu-text-muted);
}

/* 滚动条 */
.tabs-wrapper :deep(.el-tab-pane)::-webkit-scrollbar {
  width: 5px;
}

.tabs-wrapper :deep(.el-tab-pane)::-webkit-scrollbar-track {
  background: transparent;
}

.tabs-wrapper :deep(.el-tab-pane)::-webkit-scrollbar-thumb {
  background-color: rgba(163, 177, 198, 0.3);
  border-radius: 3px;
}

.tabs-wrapper :deep(.el-tab-pane)::-webkit-scrollbar-thumb:hover {
  background-color: rgba(163, 177, 198, 0.5);
}

.footer-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  padding: 2px 16px;
  margin-top: 4px;
  background-color: var(--neu-bg-card);
  border-radius: var(--neu-radius);
  box-shadow: 3px 3px 8px var(--neu-shadow-dark),
              -3px -3px 8px var(--neu-shadow-light);
  overflow: hidden;
}

.footer-link {
  font-size: 12px;
  color: var(--neu-accent);
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s;
}

.footer-link:hover {
  color: var(--neu-accent-light);
}

.appreciate-link {
  color: var(--neu-text-muted);
}

.appreciate-link:hover {
  color: var(--neu-accent);
}
</style>
