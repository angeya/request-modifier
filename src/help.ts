import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import HelpPage from './components/HelpPage.vue'
import './style.css'

const app = createApp(HelpPage)
app.use(ElementPlus)
app.mount('#app')
