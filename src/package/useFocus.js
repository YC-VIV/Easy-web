/* 
  处理内容区的元素焦点选中问题
*/

import { computed, ref } from "vue";

export function useFocus(data, callback) {
  let selectIndex = ref(-1);
  let lastSelectBlock = computed(()=>{
    return data.value.blocks[selectIndex.value]
  })

  // 元素点击事件，用于获取焦点
  const blockMousedown = function (e, block, index) {
    e.stopPropagation();
    e.preventDefault();
    if (e.shiftKey) {
      if( focusData.value.length <= 1 ) {
        // 防止只有一个元素时，失去焦点后拖动依旧触发拖动事件
        block.focus = true;
      } else {
        block.focus = !block.focus;
      }
    } else {
      if (!block.focus) {
        clearFocus();
        block.focus = true;
      }
    }

    selectIndex.value = index;

    // 注意：这里回调函数传入的是点击事件对象
    callback(e);
  };

  // 保存焦点状态,用computed是为了实时更新数据
  const focusData = computed(() => {
    var focusList = [];
    var unfocusList = [];
    data.value.blocks.map((block) => {
      (block.focus ? focusList : unfocusList).push(block);
    });

    return { focusList, unfocusList };
  });

  // 清除焦点
  const clearFocus = function () {
    data.value.blocks.map((item) => {
      item.focus = false;
    });

    selectIndex.value = -1;
  };

  //   callback();
  return {
    blockMousedown,
    focusData,
    lastSelectBlock
  };
}
