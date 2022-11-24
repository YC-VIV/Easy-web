import { ElButton, ElDialog, ElInput } from "element-plus";
import { defineComponent, createVNode, render, reactive } from "vue";

const dialogComponent = defineComponent({
  props: {
    option: { type: Object },
  },
  setup(props, context) {
    const state = reactive({
      isShow: false,
      option: props.option
    });

    // 通过expose向外界暴露方法，用于修改内部参数
    context.expose({
      showDialog(option) {
        state.isShow = true;
        // 重复点击按钮后,更新option数据
        state.option = option;
      },
    });

    // 点击取消事件
    const onCancel = function() {
        state.isShow = false;
    }
    // 点击确定事件
    const onConfirm = function() {
        state.isShow = false;
        state.option.confirm && state.option.confirm(state.option.content);
    }

    return () => {
      return (
        <ElDialog v-model={state.isShow} title={state.option.title}>
          {{
            /* vue3插槽 */
            default: () => (
              <ElInput
                type="textarea"
                v-model={state.option.content}
                rows={10}
              ></ElInput>
            ),
            footer: () =>
              state.option.footer && (
                <div>
                  <ElButton type="danger" onclick={onCancel}>取消</ElButton>
                  <ElButton type="primary" onclick={onConfirm}>确定</ElButton>
                </div>
              ),
          }}
        </ElDialog>
      );
    };
  },
});

let vm;
export function $dialog(option) {
  // 如果dialog已经存在,则无需重复生成
  if (!vm) {
    /* 还不太懂 */
    // 创建元素
    let box = document.createElement("div");
    // 将组件渲染为虚拟节点
    vm = createVNode(dialogComponent, { option });
    // 虚拟节点渲染为真实节点并渲染到页面上
    document.body.appendChild((render(vm, box), box));
  }

  let { showDialog } = vm.component.exposed;
  showDialog(option);
}
