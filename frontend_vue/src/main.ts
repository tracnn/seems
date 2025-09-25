import { createApp, type App as VueApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import 'primeflex/primeflex.css'
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import InputText from 'primevue/inputtext';
import ToastService from 'primevue/toastservice';
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Toolbar from 'primevue/toolbar'
import Button from 'primevue/button'
import FileUpload from 'primevue/fileupload'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Dialog from 'primevue/dialog'
import Rating from 'primevue/rating'
import Tag from 'primevue/tag'
import Select from 'primevue/select'
import RadioButton from 'primevue/radiobutton'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import 'primeicons/primeicons.css'
import Toast from 'primevue/toast'
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import AccordionHeader from 'primevue/accordionheader'
import AccordionContent from 'primevue/accordioncontent'
import DatePicker from 'primevue/datepicker'
import ConfirmationService from 'primevue/confirmationservice'
import ConfirmDialog from 'primevue/confirmdialog'

// Auth utils
import authUtils from '@/utils/auth.utils';
import errorHandler from '@/utils/error.handler';
import tokenManager from '@/utils/tokenManager';

// You can use the following starter router instead of the default one as a clean starting point
// import router from "./router/starter";
import router from "./router";

// Template components
import BaseBlock from "@/components/BaseBlock.vue";
import BaseBackground from "@/components/BaseBackground.vue";
import BasePageHeading from "@/components/BasePageHeading.vue";

// Template directives
import clickRipple from "@/directives/clickRipple";

// Bootstrap framework
import * as bootstrap from "bootstrap";

// Extend Window interface to include bootstrap
declare global {
  interface Window {
    bootstrap: typeof bootstrap;
  }
}

window.bootstrap = bootstrap;

// Craft new application
const app: VueApp = createApp(App);

app.use(PrimeVue, { unstyled: false, theme: { preset: Aura } });
app.use(ConfirmationService) // PHẢI CÓ
app.use(ToastService)

// Register global components
app.component("BaseBlock", BaseBlock);
app.component("BaseBackground", BaseBackground);
app.component("BasePageHeading", BasePageHeading);
app.component('Button', Button);
app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('Toolbar', Toolbar)
app.component('FileUpload', FileUpload)
app.component('InputText', InputText)
app.component('IconField', IconField)
app.component('InputIcon', InputIcon)
app.component('Dialog', Dialog)
app.component('Rating', Rating)
app.component('Tag', Tag)
app.component('Select', Select)
app.component('RadioButton', RadioButton)
app.component('InputNumber', InputNumber)
app.component('Textarea', Textarea)
app.component('Toast', Toast)
app.component('Accordion', Accordion)
app.component('AccordionPanel', AccordionPanel)
app.component('AccordionHeader', AccordionHeader)
app.component('AccordionContent', AccordionContent)
app.component('DatePicker', DatePicker)
app.component('ConfirmDialog', ConfirmDialog)

// Register global directives
app.directive("click-ripple", clickRipple);

// Use Pinia and Vue Router
app.use(createPinia());
app.use(router);

// ..and finally mount it!
app.mount("#app");

// Khởi tạo auth utils
authUtils.init();

// Khởi tạo token manager
tokenManager.init();

// Khởi tạo error handler
errorHandler.init();

// Cleanup khi page unload
window.addEventListener('beforeunload', () => {
  authUtils.cleanup();
  tokenManager.destroy();
}); 