<script setup lang="ts">
import RequestRedirect from './components/RequestRedirect.vue'
import HeaderModify from "./components/HeaderModify.vue";
import ApiRequest from "./components/ApiRequest.vue";
import {onMounted, ref} from "vue";
import {disablePlugin, enablePlugin, getPluginStatus} from "./api/chromeApi.ts";
// import {useMessage} from 'naive-ui'

// const message = useMessage()

const pluginStatus = ref(true)

onMounted(async () => {
  pluginStatus.value = await getPluginStatus()
  console.log('初始化状态', pluginStatus.value)
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

</script>

<template>
  <div style="display: flex; align-items: center;">
    <h3 style="color: #242424">请求修改器</h3>
    <n-button style="margin-left: 20px" v-show="pluginStatus" type="success" ghost @click="disable">
      <img src="./assets/power-on.svg" alt="">
    </n-button>
    <n-button style="margin-left: 20px" v-show="!pluginStatus" @click="enable">
      <img src="./assets/power-off.svg" alt="">
    </n-button>
    <p v-show="pluginStatus" style="margin-left: 8px; color: #18a058; font-weight: bolder">努力工作中...</p>
    <p v-show="!pluginStatus" style="margin-left: 8px; color: #515151; font-weight: bolder">安心休息中...</p>
    <img v-show="pluginStatus" style="height: 32px; width: 32px; margin-left: auto" src="./assets/cat-work.gif" alt="">
    <img v-show="!pluginStatus" style="height: 32px; width: 32px; margin-left: auto" src="./assets/cat-sleep.gif"
         alt="">
  </div>

  <n-message-provider>
    <n-tabs type="line" animated>
      <n-tab-pane name="requestRedirect" tab="请求重定向" class="tab-pane">
        <request-redirect></request-redirect>
      </n-tab-pane>
      <n-tab-pane name="headerModify" tab="请求头修改" class="tab-pane">
        <header-modify></header-modify>
      </n-tab-pane>
      <n-tab-pane name="apiRequest" tab="接口请求" class="tab-pane">
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
