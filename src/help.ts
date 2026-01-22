import { createApp } from 'vue'
import NaiveUi from 'naive-ui'
import HelpPage from './components/HelpPage.vue'
import './style.css'

const app = createApp(HelpPage)
app.use(NaiveUi)
app.mount('#app')