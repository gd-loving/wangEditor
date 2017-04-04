/*
    菜单集合
*/
import { objForEach } from '../util/util.js'
import MenuConstructors from './menu-list.js'

// 构造函数
function Menus(editor) {
    this.editor = editor
    this.menus = {}
}

// 修改原型
Menus.prototype = {
    constructor: Menus,

    // 初始化菜单
    init: function () {
        const editor = this.editor
        const config = editor.config || {}
        const configMenus = config.menus || []  // 获取配置中的菜单

        // 根据配置信息，创建菜单
        configMenus.forEach(menuKey => {
            const MenuConstructor = MenuConstructors[menuKey]
            if (MenuConstructor && typeof MenuConstructor === 'function') {
                // 创建单个菜单
                this.menus[menuKey] = new MenuConstructor(editor)
            }
        })

        // 添加到菜单栏
        this._addToToolbar()

        // 绑定事件
        this._bindEvent()
    },

    // 添加到菜单栏
    _addToToolbar: function () {
        const editor = this.editor
        const $toolbarElem = editor.$toolbarElem
        const menus = this.menus
        objForEach(menus, (key, menu) => {
            const $elem = menu.$elem
            if ($elem) {
                $toolbarElem.append($elem)
            }
        })
    },

    // 绑定菜单 click mouseenter 事件
    _bindEvent: function () {
        const menus = this.menus
        objForEach(menus, (key, menu) => {
            const type = menu.type
            if (!type) {
                return
            }
            const $elem = menu.$elem
            const droplist = menu.droplist
            const panel = menu.panel

            // 点击类型，例如 bold
            if (type === 'click' && menu.onClick) {
                $elem.on('click', e => {
                    menu.onClick(e)
                })
            }

            // 下拉框，例如 head
            if (type === 'droplist' && droplist) {
                $elem.on('mouseenter', e => {
                    // 显示
                    if (droplist.hideTimeoutId) {
                        // 清除之前的定时隐藏
                        clearTimeout(droplist.hideTimeoutId)
                    }
                    droplist.show()
                }).on('mouseleave', e => {
                    // 定时隐藏
                    droplist.hideTimeoutId = setTimeout(() => {
                        droplist.hide()
                    }, 500)
                })
            }

            // 弹框类型，例如 link
            if (type === 'panel' && panel) {
                $elem.on('click', e => {
                    panel.show()
                })
            }
        })
    },

    // 尝试修改菜单状态
    changeActive: function () {
        const menus = this.menus
        objForEach(menus, (key, menu) => {
            if (menu.tryChangeActive) {
                menu.tryChangeActive()
            }
        })
    }
}

export default Menus