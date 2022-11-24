<template>
  <div class="app">
    <!-- v-model,vue3语法糖，双向绑定 -->
    <Editor v-model="state"></Editor>
  </div>
</template>

<script>
import { ref,provide } from '@vue/reactivity';
import data from './data.json';
import Editor from './package/editor.jsx';
import { registerConfig } from './utils/editor-config.jsx'

export default {
  name: 'App',
  components: {
    Editor
  },
  provide: {
    'config': registerConfig
  },
  setup() {
    // 这里不能用reactive,因为需要双向绑定,reactive重新赋值对象后不能失去响应式
    var state = ref(data);

    return {
      state
    } 
  }
}
</script>

<style lang="scss">
.app {
  position: fixed;
  top: 10px;
  left: 10px;
  right: 10px;  
  bottom: 10px;
}
</style>
