/* 
  内容区渲染
*/
import { computed, defineComponent, inject, onMounted, ref } from "vue";

export default defineComponent({
  props: {
    // 这里传进来的是data.json内的数据
    data: { type: Object },
  },
  setup(props) {

    const blockRef = ref(null);

    /* 拖拽渲染完成后，修正位置 */
    onMounted(() => {
      const blockDom = blockRef.value;
      if( props.data.center === "true" ) {
        props.data.top = props.data.top - blockDom.offsetHeight/2;
        props.data.left = props.data.left - blockDom.offsetWidth/2;
        props.data.center = "false";
      } 
      
      props.data.width = blockDom.offsetWidth;
      props.data.height = blockDom.offsetHeight;
    })

    // console.log(props.data)
    let blockStyle = computed(() => ({
      top: `${props.data.top}px`,
      left: `${props.data.left}px`,
      zIndex: `${props.data.zIndex}`,
    }));
  
    // 获取配置
    const config = inject("config");
    const componentMap = config.componentMap;
    // 根据组件映射找到对应的组件默认配置的render树
    const component = componentMap[props.data.key].render();

    return () => {
      return (
        <div className="editor-box" style={blockStyle.value} ref={blockRef}>
          {component}
        </div>
      );
    };
  },
});
