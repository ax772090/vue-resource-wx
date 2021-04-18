// 这里主要是一些初始化操作
import {initState} from './state'
import {compileToFunction} from './compiler/index'
import {mountComponent} from './lifecycle'

/**
 * @param {*} vue 暴露一个方法，把Vue传进来
 */
export function initMixin(Vue) {
    // 初始化流程
    Vue.prototype._init = function (options) {
        const vm = this
        vm.$options = options
        
        // 初始化状态
        initState(vm)


        // 如果用户传了el属性，需要将页面渲染出来，挂载流程
        if(vm.$options.el){
            vm.$mount(vm.$options.el)//原型上的方法
        }

    }
    Vue.prototype.$mount = function(el){
        const vm = this
        const options = vm.$options
        el = document.querySelector(el)//此时的el就是一个dom元素

        // 查找的顺序是：render方法=>template=>el
        if(!options.render){
            // 模板编译
            let template = options.template
            if(!template && el){//如果没传template并且el有
                template = el.outerHTML
            }
            // 我们需要将template转为render方法
            const render = compileToFunction(template)
            options.render = render
        }
        // 渲染当前组件，挂载这个组件，执行render函数生成虚拟DOM，然后替换掉el就可以
        mountComponent(vm,el)
    }
}