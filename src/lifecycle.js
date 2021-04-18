import Watcher from './observer/watcher'
import { patch } from './vdom/patch'
export function lifecycleMixin(Vue) {
    // 将虚拟DOM转换为真实dom
    Vue.prototype._update = function (vnode) {
        const vm = this
        // 我要通过虚拟dom 渲染出真实的DOM
        // patch进行比对过程
        vm.$el = patch(vm.$el, vnode)
    }
}

// 挂载组件核心方法
export function mountComponent(vm, el) {
    const options = vm.$options
    vm.$el = el//vm.$el目前还是'#app'

    // 渲染页面
    // 无论是渲染还是更新都会调用此方法
    let updateComponent = () => {
        // 1.vm._render()返回的是虚拟dom
        // 2.vm._update是将虚拟dom变为真实dom
        vm._update(vm._render())
    }
    // 靠的就是渲染watcher，每个组件都有一个watcher
    new Watcher(vm, updateComponent, () => { }, true)//true表示它是一个渲染watcher
}