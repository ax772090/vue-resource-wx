export function createElement(tag,data,...children){
    // TODO
}

export function createTextNode(text){
    // TODO
}

// 虚拟节点
function vnode(tag,data,key,children,text){
    return {
        tag,
        data,
        key,
        children,
        text
    }
}