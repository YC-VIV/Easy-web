// 用于创建预设组件
import { ElButton,ElInput } from 'element-plus'

function createEditorConfig() {
    // 保存组件
    let componentList = [];
    // 根据组件的key进行映射
    let componentMap = [];

    return {
        componentMap,
        componentList,
        register: (component) => {
            // 将组件放入预览列表中，并建立映射
            componentList.push(component);
            componentMap[component.key] = component;
        }
    } 
    
}

export let registerConfig = createEditorConfig();

// 组件注册
registerConfig.register({
    label: '测试组件',
    // 组件名称
    preview: () => '预览组件',
    // 预览render树
    render: () => '渲染组件',
    // 渲染render树
    key: 'text'
    // 组件类型
})

registerConfig.register({
    label: '按钮组件',
    preview: () => <ElButton>预览按钮</ElButton>,
    render: () => <ElButton>渲染按钮</ElButton>,
    key: 'button'
})

registerConfig.register({
    label: '输入组件',
    preview: () => <ElInput disabled='true'>预览输入</ElInput>,
    render: () => <ElInput>渲染输入</ElInput>,
    key: 'input'
})
