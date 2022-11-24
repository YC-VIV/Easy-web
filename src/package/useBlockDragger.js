/* 
  内容区内组件的拖拽相关方法的封装
*/
const { reactive } = require('vue');
import { events } from './events'
import data from '../data.json'

export function useBlockDragger(focusData,lastSelectBlock) {

  let dragState = {
    startX: 0,
    startY: 0,
    // 判断是否正在拖拽
    dragging: false
  };
  let markLine = reactive({
    x: null,
    y: null
  })
  // 点击鼠标
  const mouseDown = function (e) {
    
    const { width: Bwidth , height: Bheight } = lastSelectBlock.value;

    events.emit('start');

    // 事件绑定
    document.addEventListener("mouseup", mouseup);
    document.addEventListener("mousemove", mousemove);
    // 记录原始位置
    dragState = {
      startX: e.clientX,
      startY: e.clientY,
      startPos: focusData.value.focusList.map(({ top, left }) => ({
        top,
        left,
      })),
      startLeft: lastSelectBlock.value.left,
      startTop: lastSelectBlock.value.top,
      /* 使用自执行函数计算辅助线的位置，
      通过遍历所有为选中元素，
      计算这些元素与最后一个元素之间的关系：
      需要的辅助线对齐方式横竖各5条 */
      lines: (() => {
        const { unfocusList } = focusData.value;
        // x、y分别是横线和竖线
        let lines = { x: [] , y: [] };
        [...unfocusList,{
          top: 0,
          left: 0,
          width: data.container.width,
          height: data.container.height
        }].map((block) => {
          /* 
            以下，A是未选中的元素，B是被拖拽的元素 
            showTop是显示辅助线的位置
            第二个参数是当前元素B相对于A的位置，用于计算A与B的距离
          */
            let { top:Atop , left:Aleft , width:Awidth , height:Aheight } 
            = block;
            lines.y.push({showTop: Atop,top: Atop});
            lines.y.push({showTop: Atop,top: Atop - Bheight});
            lines.y.push({showTop: Atop+Aheight/2,top: Atop+Aheight/2-Bheight/2});
            lines.y.push({showTop: Atop+Aheight,top: Atop+Aheight});
            lines.y.push({showTop: Atop+Aheight,top: Atop+Aheight-Bheight});

            lines.x.push({showLeft: Aleft,left: Aleft});
            lines.x.push({showLeft: Aleft+Awidth,left: Aleft+Awidth});
            lines.x.push({showLeft: Aleft+Awidth/2,left: Aleft+Awidth/2-Bwidth/2});
            lines.x.push({showLeft: Aleft+Awidth,left: Aleft+Awidth-Bwidth});
            lines.x.push({showLeft: Aleft,left: Aleft-Bwidth});

        })

        return lines;
      })()
    };
  };
  // 拖动鼠标
  const mousemove = function (e) {
    dragState.dragging = true;
    // 获取移动时自身的位置（相对于浏览器）
    let { clientX: moveX, clientY: moveY } = e;
    
    // 保存B移动后的新位置 移动后相对于浏览器的位置 - 移动前相对于浏览器的位置 + 移动前元素的位置
    let left = moveX - dragState.startX + dragState.startLeft;
    let top = moveY - dragState.startY + dragState.startTop;

    /* 
      拖拽辅助线以及辅助线的贴合
    */
    let y = null;
    for( let i = 0 ; i<dragState.lines.y.length ; i++ ) {
      const { showTop:s,top:t } = dragState.lines.y[i]
      if( Math.abs(t - top) < 5 ) {
        // 当拖拽元素与其他元素距离小于5px的时候，记录横线位置，使横线渲染出来
        y = s;
        // 拖拽的元素贴合横线
        moveY = dragState.startY - dragState.startTop + t;

        break;
      }
    }
    
    let x = null;
    for( let i = 0 ; i<dragState.lines.x.length ; i++ ) {
      const { showLeft:s,left:l } = dragState.lines.x[i]
      if( Math.abs(l - left) < 5 ) {
        x = s;
        moveX = dragState.startX - dragState.startLeft + l;

        break;
      }
    }
    markLine.x = x;
    markLine.y = y;

    /* 
      更改拖动后元素的位置
    */
    focusData.value.focusList.map((block, index) => {
      // 新位置 = 原本的位置 + 自身的位置（相对于浏览器） - 起始的位置（相对于浏览器）
      block.top = dragState.startPos[index].top + moveY - dragState.startY;
      block.left = dragState.startPos[index].left + moveX - dragState.startX;
    });

    // console.log(markLine)

  };
  // 放下鼠标
  const mouseup = function (e) {
    if( dragState.dragging ) {
      events.emit('end');
    }

    // 清空事件
    document.removeEventListener("mouseup", mouseup);
    document.removeEventListener("mousemove", mousemove);
    markLine.x = null;
    markLine.y = null;
  };

  return {
    mouseDown,
    markLine
  };
}
