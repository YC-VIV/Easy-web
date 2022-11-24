/* 
    从组件库拖拽到内容区相关方法的封装
*/

import { events } from "./events";

export function useDragger(data,containerContent) {
  var curComponent = null;

  /* 绑定、销毁事件 */
  // 绑定拖拽事件
  const dragStart = function (e, component) {
    const containerDom = containerContent.value;
    curComponent = component;
    containerDom.addEventListener("dragenter", dragenter);
    containerDom.addEventListener("dragover", dragover);
    containerDom.addEventListener("dragleave", dragleave);
    containerDom.addEventListener("drop", drop);

    // 发布事件
    events.emit('start');
  };

  // 销毁拖拽事件
  const dragEnd = function (e, component) {
    // console.log("销毁事件成功！");
    const containerDom = containerContent.value;
    containerDom.removeEventListener("dragenter", dragenter);
    containerDom.removeEventListener("dragover", dragover);
    containerDom.removeEventListener("dragleave", dragleave);
    containerDom.removeEventListener("drop", drop);
    events.emit('end');
  };

  /* 
      四种拖拽事件的定义
    */
  const dragenter = function (e) {
    e.dataTransfer.dropEffect = "move";
  };
  const dragover = function (e) {
    // 注意：这里必须阻止默认事件，否则无法触发drop
    e.preventDefault();
  };
  const dragleave = function (e) {
    e.dataTransfer.dropEffect = "none";
  };
  const drop = function (e) {
    /* 
        获取内容区的页面配置，将当前拖拽的元素相对于内容区盒子的位置的参数推入blocks中，并更新页面配置数据
    */
    let blocks = data.value.blocks;
    data.value = {
      ...data.value,
      blocks: [
        ...blocks,
        {
          top: e.offsetY,
          left: e.offsetX,
          zIndex: 1,
          key: curComponent.key,
          center: "true",
        },
      ],
    };
  };

  return {
    dragStart,
    dragEnd
  };
}
