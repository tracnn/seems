// components.d.ts
declare module "@vue/runtime-core" {
  export interface GlobalComponents {
    RouterLink: typeof import("vue-router")["RouterLink"];
    RouterView: typeof import("vue-router")["RouterView"];
    BaseBlock: typeof import("./src/components/BaseBlock.vue");
    BaseBackground: typeof import("./src/components/BaseBackground.vue");
    BasePageHeading: typeof import("./src/components/BasePageHeading.vue");
    
    // PrimeVue Components
    Button: typeof import("primevue/button")["default"];
    DataTable: typeof import("primevue/datatable")["default"];
    Column: typeof import("primevue/column")["default"];
    Toolbar: typeof import("primevue/toolbar")["default"];
    FileUpload: typeof import("primevue/fileupload")["default"];
    InputText: typeof import("primevue/inputtext")["default"];
    IconField: typeof import("primevue/iconfield")["default"];
    InputIcon: typeof import("primevue/inputicon")["default"];
    Dialog: typeof import("primevue/dialog")["default"];
    Rating: typeof import("primevue/rating")["default"];
    Tag: typeof import("primevue/tag")["default"];
    Select: typeof import("primevue/select")["default"];
    RadioButton: typeof import("primevue/radiobutton")["default"];
    InputNumber: typeof import("primevue/inputnumber")["default"];
    Textarea: typeof import("primevue/textarea")["default"];
    Toast: typeof import("primevue/toast")["default"];
    Accordion: typeof import("primevue/accordion")["default"];
    AccordionPanel: typeof import("primevue/accordionpanel")["default"];
    AccordionHeader: typeof import("primevue/accordionheader")["default"];
    AccordionContent: typeof import("primevue/accordioncontent")["default"];
    DatePicker: typeof import("primevue/datepicker")["default"];
    Dropdown: typeof import("primevue/dropdown")["default"];
    ConfirmDialog: typeof import("primevue/confirmdialog")["default"];
    Calendar: typeof import("primevue/calendar")["default"];
  }
}

export {};
