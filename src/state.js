import { observe } from './observer/index'
export function initState(vm) {
    const opts = vm.$options
    // vue的数据来源  属性 方法  计算属性 watch
    if (opts.props) {
        initProps(vm)
    }
    if (opts.methods) {
        initMethods(vm)

    }
    if (opts.data) {
        initData(vm)

    }
    if (opts.computed) {
        initComputed(vm)

    }
    if (opts.watch) {
        initWatch(vm)
    }
}


function initProps(vm) { }
function initMethods(vm) { }
function initData(vm) {
    // 数据的初始化
    let data = vm.$options.data//用户传过来的data，有可能是对象，有可能是函数
    // vm._data是将data里面的对象给vm实例上一份
    //data.call(vm)目的就是为了data里面执行语句时this是当前实例
    data = vm._data = typeof data === 'function' ? data.call(vm) : data
    // 对象劫持，用户改变了数据，我希望得到通知=》刷新页面   MVVM模式
    // 对象：Object.defineProperty()给属性增加get和set方法
    observe(data)//响应式原理

}
function initComputed(vm) { }
function initWatch(vm) { }