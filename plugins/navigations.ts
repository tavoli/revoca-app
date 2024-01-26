import GoHomeBtn from "~/components/Navigation/GoHomeBtn.vue";
import GoNewBtn from "~/components/Navigation/GoNewBtn.vue";
import GoBooksBtn from "~/components/Navigation/GoBooksBtn.vue";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component("GoHomeBtn", GoHomeBtn);
  nuxtApp.vueApp.component("GoNewBtn", GoNewBtn);
  nuxtApp.vueApp.component("GoBooksBtn", GoBooksBtn);
});
