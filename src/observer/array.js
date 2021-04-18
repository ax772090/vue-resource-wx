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