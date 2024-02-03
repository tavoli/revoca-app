import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'

const newPopover = (view: any, pos: any) => {
  const popover = document.createElement('div')

  popover.id = 'popover'

  popover.classList.add(
    'absolute',
    'top-10',
    'left-0',
  )

  const popoverContent = document.createElement('div')

  popoverContent.classList.add(
    'p-2',
    'flex',
    'flex-col',
    'min-w-[8rem]',
    'rounded-lg',
    'bg-gray-900',
    'dark:bg-black',
    'shadow-sm',
    'border',
    'border-slate-800',
    'dark:border-neutral-800'
  )

  const option = document.createElement('button')
  const optionContent = document.createElement('button')

  optionContent.classList.add(
    'flex',
    'items-center',
    'gap-2',
    'p-1.5',
    'text-sm',
    'font-medium',
    'text-neutral-500',
    'dark:text-neutral-400',
    'text-left',
    'bg-transparent',
    'w-full',
    'rounded',
    'hover:text-neutral-200',
    'dark:hover:bg-neutral-900',
    'dark:hover:text-neutral-200'
  )

  optionContent.innerHTML = 'infuse pins'

  optionContent.addEventListener('click', () => {
    // change the content of the paragraph using pos
    const {state, dispatch} = view
    
  })

  option.appendChild(optionContent)

  popoverContent.appendChild(option)

  popover.appendChild(popoverContent)

  return popover
}

const newMenuButton = (view: any, pos: any) => {
 const menu = document.createElement('button')

  menu.classList.add(
    'flex',
    'group',
    'items-center',
    'justify-center',
    'border',
    'text-sm',
    'font-semibold',
    'rounded-md',
    'disabled:opacity-50',
    'whitespace-nowrap',
    'border-transparent',
    'text-neutral-500',
    'hover:bg-black/5',
    'hover:text-neutral-700',
    'active:bg-black/10',
    'active:text-neutral-800',
    'hover:bg-white/10',
    'hover:text-neutral-300',
    'active:text-neutral-200',
    'h-8',
    'gap-1',
    'w-[2rem]',
    'px-2',
  )

  menu.style.position = 'absolute'
  menu.style.zIndex = '10'
  menu.style.top = `1.4rem`
  menu.style.left = `-1rem`
  menu.id = 'hover-menu'
  menu.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>`

  menu.addEventListener('click', () => {
    const popover = newPopover(view, pos)

    if (menu.querySelector('#popover')) return

    menu.appendChild(popover)
  })

  return menu
}

export const Hover = Extension.create({
  name: 'hover',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('hover'),
        props: {
          handleDOMEvents: {
            mouseover(view, event) {
              if (event.target instanceof HTMLParagraphElement) {
                const pos = view.posAtDOM(event.target, 0)
                const menu = newMenuButton(view, pos)

                if (event.target.querySelector('#hover-menu')) return

                event.target.appendChild(menu)

                event.target.addEventListener('mouseleave', () => {
                  const hoverMenu = (event.target as any)?.querySelector('#hover-menu')
                  if (hoverMenu) {
                    hoverMenu.remove()
                  }
                })
              }
            },
          }
        },
      }),
    ]
  },
})
