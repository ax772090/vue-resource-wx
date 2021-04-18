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