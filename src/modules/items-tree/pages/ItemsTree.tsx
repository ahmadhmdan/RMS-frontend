import { useEffect } from 'react'
import { useItemsTree } from '../hooks/useItemsTree'
import { useTranslation } from 'react-i18next'

declare global {
    interface Window {
        $: any
        jQuery: any
    }
}

const ItemsTree = () => {
    const { t } = useTranslation()
    const { fetchNode } = useItemsTree()

    useEffect(() => {
        const $ = window.$

        $('#items-tree').jstree('destroy').empty()

        $('#items-tree').jstree({
            core: {
                themes: {
                    responsive: false,
                    dots: true,
                    icons: true,
                    name: 'default'
                },
                check_callback: true,
                data: fetchNode
            },
            types: {
                root: {
                    icon: 'ki-outline ki-folder-up text-warning fs-2'
                },
                category: {
                    icon: 'ki-outline ki-folder text-primary fs-2'
                },
                item: {
                    icon: 'ki-outline ki-cube-2 text-success fs-2'
                }
            },
            plugins: ['types', 'wholerow', 'state'],
            state: { key: 'items_tree_demo' }
        })

        // Increase font size and improve readability
        const style = document.createElement('style')
        style.innerHTML = `
            #items-tree .jstree-node,
            #items-tree .jstree-anchor {
                font-size: 14px !important;
                line-height: 36px !important;
                min-height: 36px !important;
            }
            #items-tree .jstree-icon {
                height: 24px !important;
                font-size: 17px !important;
                margin-top: 7px;
            }
            #items-tree .jstree-wholerow {
                height: 36px !important;
            }
            #items-tree .jstree-anchor {
                padding-left: 6px !important;
            }
            #items-tree .jstree-clicked,
            #items-tree .jstree-hovered {
                border-radius: 6px !important;
                color: black;
            }
        `
        document.head.appendChild(style)

        return () => {
            $('#items-tree').jstree('destroy')
            document.head.removeChild(style)
        }
    }, [fetchNode])

    const refreshTree = () => {
        window.$('#items-tree').jstree('refresh')
    }

    return (
        <div className="card mb-5 mb-xl-8">
            <div className="card-header border-0 pt-5">
                <h3 className="card-title align-items-start flex-column">
                    <span className="card-label fw-bold fs-3 mb-1">{t('items_tree')}</span>
                </h3>
                <div className="card-toolbar d-flex align-items-center gap-2">
                    <button className="btn btn-sm btn-primary" onClick={refreshTree}>
                        <i className="ki-outline ki-arrows-circle fs-2"></i>
                        {t('refresh')}
                    </button>
                </div>
            </div>
            <div className="card-body pt-6">
                <div
                    id="items-tree"
                    className="w-100"
                    style={{
                        minHeight: '500px',
                        overflowX: 'auto',
                        WebkitOverflowScrolling: 'touch'
                    }}
                ></div>
            </div>
        </div>
    )
}

export default ItemsTree