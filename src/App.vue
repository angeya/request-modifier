<script setup lang="ts">
import RequestRedirect from './components/RequestRedirect.vue'
import HeaderModify from "./components/HeaderModify.vue";
import ApiRequest from "./components/ApiRequest.vue";
</script>

<template>
  <div style="display: flex; align-items: center;">
    <h2>请求修改器</h2>
    <n-button style="margin-left: 20px" type="success">努力工作中...</n-button>
    <n-button style="margin-left: 20px">休息中...</n-button>
  </div>

  <n-tabs type="line" animated>
    <n-tab-pane name="jay chou" tab="请求重定向">
      <request-redirect></request-redirect>
    </n-tab-pane>
    <n-tab-pane name="oasis" tab="请求头修改">
      <api-request></api-request>
    </n-tab-pane>
    <n-tab-pane name="the beatles" tab="接口请求">
      <header-modify></header-modify>
    </n-tab-pane>
  </n-tabs>
</template>

<style scoped>
</style>
