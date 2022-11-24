import mitt from 'mitt';
/* 
    mitt是发布订阅模式的一个库
    这里用到发布订阅的思想：
        订阅者先订阅事件，发布者保存订阅者留下的事件，当发布者一发布事件后，
        发布者就会触发订阅者留下的事件
*/


export const events = mitt();