import { defineComponent, inject } from "vue";
import '../editor-list/editor-list.scss'

export default defineComponent({
    setup() {
        const config = inject('config');
        const componentList = config.componentList;
        console.log(componentList);

        return () => {
            return <div className="list-box">{componentList.map((component) => 
                <div className="list-box-item">
                    <span className="list-box-label">{component.label}</span>
                    <span>{component.preview()}</span>
                </div>
            )}</div>
        }
    }
})