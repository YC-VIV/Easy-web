const { defineComponent, computed, inject, ref } = require("vue");
const deepcopy = require("deepcopy");
import "./editor.scss";
import EditorBlock from "./editor-block";
import { useDragger } from "./useDragger";
import { useFocus } from "./useFocus";
import { useBlockDragger } from "./useBlockDragger";
import { useCommand } from "./useCommand"
("./useDragger");
import 'font-awesome/css/font-awesome.css'
import { $dialog } from "./dialog.jsx";
// import EditorList from "../components/editor-list/editor-list";

export default defineComponent({
  props: {
    modelValue: { type: Object },
  },
  components: {
    EditorBlock,
  },
  setup(props, context) {
    const data = computed({
      get() {
        return props.modelValue;
      },
      set(newVal) {
        context.emit("update:modelValue", deepcopy(newVal));
      },
    });

    // 注入配置以及组件列表
    const config = inject("config");
    const componentList = config.componentList;

    // 内容区ref对象
    const containerContent = ref(null);
    /* 
    json实现样式修改修改思路：
    将data传入，放入计算属性中（便于实时监听更新以及缓存提高性能）
    动态绑定内联样式实现更改
    */
    const containerStyle = computed(() => ({
      width: data.value.container.width + "px",
      height: data.value.container.height + "px",
    }));

    /* 
      焦点处理
    */
    let { blockMousedown, focusData, lastSelectBlock } = useFocus(data, (e) => {
      mouseDown(e);
      console.log(lastSelectBlock.value);
    });

    let { mouseDown, markLine } = useBlockDragger(focusData, lastSelectBlock);

    // 清除焦点
    const clearFocus = function () {
      data.value.blocks.map((item) => {
        item.focus = false;
      });
    };

    // 空白点击事件，用于清除焦点
    const containerMousedown = function () {
      clearFocus();
    };

    const { dragStart, dragEnd } = useDragger(data, containerContent);

    /* 菜单按钮事件管理 */
    const { commands } = useCommand(data);
    let menuButtons = [
      {
        label: "撤销",
        icon: "fa fa-reply fa-lg",
        handle: () => {
          commands.undo()
        }
      },
      {
        label: "前进",
        icon: "fa fa-share fa-lg",
        handle: () => {
          commands.redo()
        }
      },
      {
        label: "导入",
        icon: "fa fa-sign-in fa-lg",
        handle: () => {
          // 弹出提示框
          $dialog({
            title: '导入json配置',
            content: '',
            footer: true,
            confirm(json) {
              // 点击确认后改变新值,这样做不能更改历史记录
              // data.value = JSON.parse(json);
              commands.updateContent(JSON.parse(json))
            }
          })
        }
      },
      {
        label: "导出",
        icon: "fa fa-sign-out fa-lg",
        handle: () => {
          $dialog({
            title: '导出json配置',
            content: JSON.stringify(data.value)
          })
        }
      },
    ];

    return () => (
      <div className="editor">
        <div className="editor-left">
          {/* <EditorList></EditorList> */}
          <div className="list-box">
            {componentList.map((component) => (
              <div
                className="list-box-item"
                draggable
                onDragstart={(e) => {
                  dragStart(e, component);
                }}
                onDragend={(e) => {
                  dragEnd(e, component);
                }}
              >
                <span className="list-box-label">{component.label}</span>
                <span>{component.preview()}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="editor-top">
          {menuButtons.map((item) => {
            return (
              <div className="editor-top-item" onClick={item.handle}>
                <i className={item.icon}></i>
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>
        <div className="editor-right">属性控制栏</div>
        <div className="editor-container">
          <div className="editor-container-box">
            <div
              className="editor-container-content"
              ref={containerContent}
              style={containerStyle.value}
              /* 点击内容区取消焦点选择 */
              onMousedown={(e) => containerMousedown(e)}
            >
              {/* 
                    内容区实现根据json渲染思路： 
                    遍历相关json，
                    然后抽离一个组件专门用于根据属性生成不同类型元素
                  */}
              内容区
              {data.value.blocks.map((item, index) => {
                return (
                  <EditorBlock
                    data={item}
                    className={
                      item.focus ? "editor-box editor-box-focus" : "editor-box"
                    }
                    /* 点击元素获取焦点 */
                    onMousedown={(e) => blockMousedown(e, item, index)}
                  ></EditorBlock>
                );
              })}
              {markLine.x !== null && (
                <div
                  className="line-x"
                  style={{ left: markLine.x + "px" }}
                ></div>
              )}
              {markLine.y !== null && (
                <div
                  className="line-y"
                  style={{ top: markLine.y + "px" }}
                ></div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
});
