/* 
    定义菜单栏的按钮功能
*/
const { onUnmounted } = require("vue");
import deepcopy from "deepcopy";
import { events } from "./events";

export function useCommand(data) {
  // 状态
  let state = {
    // 前进后退的索引
    current: -1,
    // 操作命令
    queue: [],
    // 保存命令名和对应执行函数的映射表
    commands: {},
    // 存放所有命令
    commandArray: [],
    // 取消订阅的事件数组
    destroyArray: [],
  };

  // 事件注册
  const registry = (command) => {
    state.commandArray.push(command);
    state.commands[command.name] = (...args) => {
      // 获取注册的事件
      const { redo, undo } = command.excute(...args);
      redo();

      if (!command.pushQueue) {
        return;
      }
      let { queue, current } = state;
      /* 考虑到放置过程中撤销的情况 */
      if (queue.length > 0) {
        queue = queue.slice(0, current + 1);
        state.queue = queue;
      }

      // 保存指令的前进后退
      queue.push({ redo, undo });
      state.current++;
    };
  };

  registry({
    name: "redo",
    Keyboard: "ctrl+y",
    excute() {
      return {
        redo() {
          if (state.current < -1) {
            return;
          }

          let item = state.queue[state.current + 1];
          if (item) {
            item.redo && item.redo();
            state.current++;
          }
        },
      };
    },
  }),
    registry({
      name: "undo",
      Keyboard: "ctrl+z",
      excute() {
        return {
          redo() {
            console.log(state.current);
            if (state.current === -1) {
              return;
            }

            let item = state.queue[state.current];
            if (item) {
              item.undo && item.undo();
              state.current--;
            }
          },
        };
      },
    }),
    /* 
        拖拽的事件控制
    */

    registry({
      name: "drag",
      pushQueue: true,
      init() {
        this.before = null;
        // 保存拖拽前的状态，记录拖拽前的数据
        var start = () => {
          this.before = deepcopy(data.value.blocks);
          return this.before;
        };
        // 定义拖拽后触发的事件
        var end = () => {
          return state.commands.drag();
        };
        events.on("start", start);
        events.on("end", end);
        // 返回事件销毁
        return () => {
          events.off("start");
          events.off("end");
        };
      },
      excute() {
        // 这里就是state.command.drag
        let before = this.before;
        let after = data.value.blocks;
        return {
          /* 更新配置数据，改变为上一步、下一步的内容 */
          //   下一步
          redo() {
            data.value = { ...data.value, blocks: after };
          },
          //   上一步
          undo() {
            data.value = { ...data.value, blocks: before };
          },
        };
      },
    });

    /* 用于实现可撤销的更新内容区的操作 */
    registry({
      name: 'updateContent',
      pushQueue: true,
      excute(newVal) {
        let before = data.value;
        let after = newVal;
        return {
          redo: () => {
            data.value =after;
          },
          undo: () => {
            data.value = before;
          }
        }
      }
    })

  // 定义键盘点击事件监控快捷键
  const keyboardEvent = (() => {
    const keyCodes = {
      90: "z",
      89: "y",
    };
    const onKeyDown = function(e) {
      const { ctrlKey, keyCode } = e;
      let keyString = [];
      if (ctrlKey) {
        keyString.push("ctrl");
        keyString.push(keyCodes[keyCode]);
        keyString = keyString.join("+");
        console.log(keyString);
        // 遍历所有注册的事件，如果有对应的快捷键，则触发该事件
        state.commandArray.map(({ Keyboard, name }) => {
          if (Keyboard === keyString) {
            state.commands[name]();
            e.preventDefault();
          }
        });
      } else {
        return;
      }
    };
    const init = () => {
      // 绑定键盘监听事件
      window.addEventListener('keydown',(e)=>{ onKeyDown(e) })
      // 返回清除事件
      return () => {
        window.removeEventListener("keydown", onKeyDown);
      };
    };
    return init;
  })();

  (() => {
    state.destroyArray.push(keyboardEvent());

    // 执行指令并更新清理取消订阅的事件
    state.commandArray.forEach((command) => {
      command.init && state.destroyArray.push(command.init());
    });
  })();

  // 清理绑定事件
  onUnmounted(() => {
    state.destoryArray.forEach((fn) => {
      if (fn) {
        fn();
      }
    });
  });

  return state;
}
