<script setup lang="ts">
import RequestRedirect from './components/RequestRedirect.vue'
import HeaderModify from "./components/HeaderModify.vue";
import ApiRequest from "./components/ApiRequest.vue";
import {onMounted, ref, computed} from "vue";
import {disablePlugin, enablePlugin, getPluginStatus, loadRuleList, loadHeaderRuleList} from "./api/chromeApi.ts";
import type {Rule, HeaderRule} from './types';

const pluginStatus = ref(true)
const ruleList = ref<Rule[]>([])
const headerRuleList = ref<HeaderRule[]>([])

onMounted(async () => {
  pluginStatus.value = await getPluginStatus()
  console.log('初始化状态', pluginStatus.value)
  
  // 加载规则列表
  await loadRuleLists()
  
  // 监听存储变化，当规则列表发生变化时重新加载
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
      if (changes.ruleList || changes.headerRuleList) {
        loadRuleLists()
      }
    }
  })
})

// 加载所有规则列表
async function loadRuleLists() {
  ruleList.value = await loadRuleList()
  headerRuleList.value = await loadHeaderRuleList()
  console.log('规则列表已更新', ruleList.value, headerRuleList.value)
}

// 计算请求重定向是否有启用的规则
const hasEnabledRedirectRule = computed(() => {
  return ruleList.value.some(rule => rule.enabled)
})

// 计算header修改是否有启用的规则
const hasEnabledHeaderRule = computed(() => {
  return headerRuleList.value.some(rule => rule.enabled)
})

function enable() {
  pluginStatus.value = true
  enablePlugin()
  // message.success('插件已经启用!')
}

function disable() {
  pluginStatus.value = false
  disablePlugin()
}

// 打开帮助页面
function openHelpPage() {
  // 由于Chrome扩展的限制，我们使用chrome.tabs.create来打开新标签页
  // 这里我们直接使用index.html作为帮助页面，因为help.html无法被正确编译
  const helpPageUrl = chrome.runtime.getURL('index.html');
  chrome.tabs.create({ url: helpPageUrl });
}

</script>

<template>
  <div style="display: flex; align-items: center;">
    <h3 style="color: #242424">请求修改器</h3>
    <n-button style="margin-left: 20px" quaternary v-show="pluginStatus" ghost @click="disable">
      <img src="./assets/power-on.svg" alt="">
    </n-button>
    <n-button style="margin-left: 20px" quaternary v-show="!pluginStatus" ghost @click="enable">
      <img src="./assets/power-off.svg" alt="">
    </n-button>
    <p v-show="pluginStatus" style="margin-left: 8px; color: #18a058; font-weight: bolder">努力工作中...</p>
    <p v-show="!pluginStatus" style="margin-left: 8px; color: #515151; font-weight: bolder">安心休息中...</p>
    
    <!-- 帮助按钮 -->
    <n-button style="margin-left: auto; margin-right: 10px" type="info" size="small" @click="openHelpPage">
      帮助
    </n-button>
    
    <img v-show="pluginStatus" style="height: 36px; width: 36px; margin-left: 10px" src="./assets/work.gif" alt="">
    <img v-show="!pluginStatus" style="height: 30px; width: 30px; margin-left: 10px" src="./assets/sleep.gif"
         alt="">
  </div>

  <n-message-provider>
    <n-tabs type="line" animated>
      <n-tab-pane name="requestRedirect" class="tab-pane">
        <template #tab>
          <div style="display: flex; align-items: center; position: relative;">
            请求重定向
            <div style="margin-left: 6px; width: 8px; height: 8px; border-radius: 50%;" 
                 :style="{'background-color': hasEnabledRedirectRule ? '#18a058' : '#c0c4cc'}"></div>
          </div>
        </template>
        <request-redirect></request-redirect>
      </n-tab-pane>
      <n-tab-pane name="headerModify" class="tab-pane">
        <template #tab>
          <div style="display: flex; align-items: center; position: relative;">
            header修改
            <div style="margin-left: 6px; width: 8px; height: 8px; border-radius: 50%;" 
                 :style="{'background-color': hasEnabledHeaderRule ? '#18a058' : '#c0c4cc'}"></div>
          </div>
        </template>
        <header-modify></header-modify>
      </n-tab-pane>
      <n-tab-pane name="apiRequest" class="tab-pane">
        <template #tab>
          <div style="display: flex; align-items: center; position: relative;">
            接口请求
            <div style="margin-left: 6px; width: 8px; height: 8px; border-radius: 50%; background-color: #c0c4cc;"></div>
          </div>
        </template>
        <api-request></api-request>
      </n-tab-pane>
    </n-tabs>
  </n-message-provider>
</template>

<style scoped>
.tab-pane {
  min-height: 400px;
  max-height: 760px;
  overflow-y: scroll;
}
</style>
