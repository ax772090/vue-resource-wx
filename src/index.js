import { initMixin } from './init.js'
import { lifecycleMixin } from './lifecycle'
import { renderMixin } from './render'
function Vue(options) {
    // 进行vue的初始化操作
    this._init(options)
}
initMixin(Vue)//_init
lifecycleMixin(Vue)//_update forceUpdate destroy
renderMixin(Vue)//_render nextTick

export default Vue