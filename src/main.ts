import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import naive from 'naive-ui'
// import { setupNaiveDiscreteApi } from 'naive-ui'

// setupNaiveDiscreteApi() // 👈 必须调用一次

const app = createApp(App)
app.use(naive)
app.mount('#app')
