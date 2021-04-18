
import { isObject } from '../utils/index'

import { arrayMethods } from './array.js'
/**
 * 观测者
 */
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
            this.walk(data)//对对象监控
        }
    }
    observeArray(data) {
        for (let i = 0; i < data.length; i++) {
            observe(data[i])
        }
    }
    walk(data) {
        let keys = Object.keys(data)//[name,age,address]
        keys.forEach(key => {
            // 状态响应式核心方法
            defineReactive(data, key, data[key])
        });
    }
}
/**
 * 响应式核心方法
 * @param {*} data 
 * @param {*} key 
 * @param {*} value 
 */
function defineReactive(data, key, value) {
    // 递归处理value还是对象的情况
    observe(value)
    Object.defineProperty(data, key, {
        get() {//获取值的时候做一些操作
            return value
        },
        set(newValue, oldValue) {
            if (newValue === oldValue) return;
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
export function observe(data) {
    if (!isObject(data)) {
        return
    }
    // 用来观测数据的
    return new Observer(data)
}