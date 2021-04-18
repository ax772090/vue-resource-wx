## vue源码编写

### rollup打包
    1. `npm i rollup @babel/core @babel/preset-env rollup-plugin-babel rollup-plugin-serve cross-env -D`

### vue中对象的数据劫持
```js

import {isObject} from '../utils/index'

/**
 * 观测者
 */
class Observer{
    constructor(data){
        // vue如果数据的层次过多，需要去递归解析对象中属性，依次增加set和get
        this.walk(data)
    }
    walk(data){
        let keys = Object.keys(data)//[name,age,address]
        keys.forEach(key => {
            // 状态响应式核心方法
            defineReactive(data,key,data[key])
        });
    }
}
/**
 * 响应式核心方法
 * @param {*} data 
 * @param {*} key 
 * @param {*} value 
 */
function defineReactive(data,key,value){
    // 递归处理value还是对象的情况
    observe(value)
    Object.defineProperty(data,key,{
        get(){//获取值的时候做一些操作
            return value
        },
        set(newValue,oldValue){
            if(newValue === oldValue) return ;
            observe(newValue)//继续劫持用户设置的值，因为有可能用户设置的值还是一个对象
            value = newValue
        }
    })
}
/**
 * 如果是对象，就去给它劫持
 * @param {*} data 
 * @returns 
 */
export function observe(data){
    if(!isObject(data)){
        return
    }
    // 用来观测数据的
    return new Observer(data)
}
```

### vue中数组的响应式
   + 需要对传入的data进行数组判断，如果是数组，那么就对数组的七个方法进行重写，然后遍历进行`observe`
    ```js
    import {arrayMethods} from './array.js'
    class Observer {
        constructor(data) {
            // data.__ob__ = this//给每个对象添加一个__ob__属性,属性的值为实例，以便能够拿到实例上面的方法
            Object.defineProperty(data, '__ob__', {
                enumerable: false,
                configurable: false,
                value: this//把当前实例赋给__ob__
            })
            // vue如果数据的层次过多，需要去递归解析对象中属性，依次增加set和get
            if (Array.isArray(data)) {
                // 如果是数组，并不需要对数组索引进行监控，因为会导致性能问题
                // 操作数组的方法时重写
                data.__proto__ = arrayMethods
                // 如果数组里面放的是对象，那么再监控
                this.observeArray(data)
            } else {
                ...
            }
        }
        observeArray(data) {
            for (let i = 0; i < data.length; i++) {
                observe(data[i])
            }
        }
        ...
    }
    ```

   +  在`array.js`里面单独对数组进行处理
    ```js
    // 这里需要重写数组的7个方法，push pop unshift shift reverse sort splice,会导致原数组本身方式变化
    let oldArrayMethods = Array.prototype

    // value.__proto__ = arrayMethods 通过原型链查找的方式，先查找我重写的，重写的没有就会继续向上查找
    // arrayMethods.__proto__ = oldArrayMethods
    export let arrayMethods = Object.create(oldArrayMethods)

    const methods = [
        'push',
        'pop',
        'unshift',
        'shift',
        'reverse',
        'sort',
        'splice'
    ]
    methods.forEach(method => {
        // 先走我自定义的方法
        arrayMethods[method] = function (...args) {
            // this:指代当前调用方法的数组
            // AOP切片
            const result = oldArrayMethods[method].apply(this, args)
            const ob = this.__ob__
            let inserted;//当前用户插入的元素
            switch (method) {
                case 'push':
                case 'unshift':
                    inserted = args;
                    break;
                case 'splice':
                    inserted = args.slice(2)
                    break;

                default:
                    break;
            }
            // 如果添加的元素还是一个对象呢？那么就需要对对象进行响应式处理
            if (inserted) ob.observeArray(inserted);
            return result;
        }
    })
    ```

### vue的模板编译
    - 将html模板转换成ast语法树
    - 将ast语法树生成render函数
    - render函数执行生成虚拟DOM，进行比对，替换el
### 每次更新都需要解析成ast语法树吗？
> 不会，只有第一次初次渲染时才会，后面会根据newVnode和oldVnode比对更新

### 组件挂载核心流程
```js
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
```
### patch比对过程是怎样的？

```js
export function patch(oldVnode, vnode) {
    // 初次渲染时，oldVnode就是我们的真实节点，即#app的节点

    // 1.判断是更新还是要渲染，即如果oldVnode是真实节点，那就是要渲染，如果是虚拟节点，那就是要比对更新
    const isRealElement = oldVnode.nodeType//如果有nodeType就是真实节点
    if (isRealElement) {
        const oldElm = oldVnode;//div id=app
        // <div>{{msg}}</div>
        // <div>wx</div>要用这个替换掉上面的那个，怎么替换掉，就是先把这个插到父元素的前面，然后把那个删掉**********
        const parentElm = oldElm.parentNode;//为什么要拿到它的爸爸元素？因为要插到父元素里面

        let el = createElm(vnode)//把虚拟节点转换为真实节点
        // var insertedNode = parentNode.insertBefore(newNode, referenceNode);
        // insertedNode ：被插入节点(newNode)
        // parentNode ：新插入节点的父节点
        // newNode： 用于插入的节点
        // referenceNode ：newNode 将要插在这个节点之前
        parentElm.insertBefore(el, oldElm.nextSibling)//不能用appendChild，就会插到后面

        parentElm.removeChild(oldElm)//然后删掉老的
    }
    // 递归创建真实节点，替换掉老的
}

// 递归树创建虚拟节点对应的新节点
function createElm(vnode) {
    let {tag,children,key,data,text} = vnode
    // 如果是标签，那就创建标签
    if(typeof tag === 'string'){
        vnode.el = document.createElement(tag)
        children.forEach(child=>{
            return vnode.el.appendChild(createElm(child))
        })
    }else{
        // 虚拟节点上映射着真实节点，方便后续更新
        vnode.el = document.createTextNode(text)
    }
    return vnode.el
}
```