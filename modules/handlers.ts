import { UI_ELEMENTS, ERROR, NOTE } from './ui-elements'

// ==================  ОПОВЕЩЕНИЯ / ОШИБКИ ==================

function showNotification(
  type: string,
  noteMessage: string,
  name: string = ''
): void {
  const noteBlock = document.createElement('div')
  noteBlock.textContent = noteMessage + name
  if (type === ERROR.TYPE) {
    noteBlock.classList.add('error-container')
  }
  if (type === NOTE.TYPE) {
    noteBlock.classList.add('note-container')
  }
  noteBlock.addEventListener('click', () => noteBlock.remove())
  if (UI_ELEMENTS.BODY) UI_ELEMENTS.BODY.append(noteBlock)
  setTimeout(() => {
    noteBlock.classList.add('active')
    setTimeout(() => {
      noteBlock.classList.remove('active')
      setTimeout(() => {
        noteBlock.remove()
      }, 1000)
    }, 5000)
  }, 100)
}

// ==================  СВЕТЛАЯ / ТЕМНАЯ ТЕМА   ==================

const theme: string = JSON.parse(localStorage.getItem('theme') || '')
if (theme) {
  if (UI_ELEMENTS.BODY) UI_ELEMENTS.BODY.setAttribute('data-theme', theme)
}
if (theme === 'dark') {
  UI_ELEMENTS.THEME_SWITCHER.checked = true
}

UI_ELEMENTS.THEME_SWITCHER.addEventListener('change', (event) => {
  if ((event.target as HTMLInputElement).checked) {
    if (UI_ELEMENTS.BODY) UI_ELEMENTS.BODY.setAttribute('data-theme', 'dark')
    localStorage.setItem('theme', JSON.stringify('dark'))
  } else {
    if (UI_ELEMENTS.BODY) UI_ELEMENTS.BODY.setAttribute('data-theme', 'light')
    localStorage.setItem('theme', JSON.stringify('light'))
  }
})

// ==================  ПОКАЗ ЗАГРУЗКИ и ОТКЛЮЧЕНИЕ ФОРМЫ   ==================

function createLoadingLoader(): HTMLElement {
  const loader = document.createElement('img')
  loader.classList.add('loader') //
  loader.src = 'loader.5bb898b5.svg' //
  loader.alt = 'loader'
  return loader
}

function showLoader(switcher: boolean, type: string): void {
  const loader: HTMLImageElement | null = document.querySelector(
    type === 'popup' ? '.loader' : '.loader-messages'
  )
  if (loader !== null) {
    switcher
      ? loader.classList.add('active')
      : loader.classList.remove('active')
  }
}

function disableTheForm(switcher: boolean): void {
  const linkToCode: HTMLAnchorElement | null =
    document.querySelector('.link-code')
  const input: HTMLInputElement | null =
    document.querySelector('.content-input')
  const button: HTMLButtonElement | null =
    document.querySelector('.content-btn')

  if (input) input.disabled = switcher

  if (button) button.disabled = switcher

  if (linkToCode) {
    switcher
      ? linkToCode.classList.add('disabled')
      : linkToCode.classList.remove('disabled')
  }
}

// function showLoaderForMessages(switcher: boolean): void {
//   const loader: HTMLImageElement | null =
//     document.querySelector('.loader-messages')
//   if (loader !== null) {
//     switcher
//       ? loader.classList.add('active')
//       : loader.classList.remove('active')
//   }
// }

// function showLoaderAndDisableForm(switcher: boolean): void {
//   const loader = document.querySelector('.loader')
//   const linkToCode = document.querySelector('.link-code')
//   const input = document.querySelector(
//     '.content-input'
//   ) as HTMLInputElement | null
//   const button = document.querySelector('.content-btn') as HTMLButtonElement

//   if (input) input.disabled = switcher
//   if (button) button.disabled = switcher

//   if (loader) {
//     if (switcher) {
//       loader.classList.add('active')
//     } else {
//       loader.classList.remove('active')
//     }
//   }
//   if (linkToCode) {
//     if (switcher) {
//       linkToCode.classList.add('disabled')
//     } else {
//       linkToCode.classList.remove('disabled')
//     }
//   }
// }

// ==================  Прокрутка вниз  ==================

function scrollToLastUserMessage() {
  UI_ELEMENTS.MESSAGE_LIST.scrollTo({ top: -1, left: 0, behavior: 'smooth' })
}
UI_ELEMENTS.BUTTON_SCROLL.addEventListener('click', () => {
  scrollToLastUserMessage()
})

function showScrollButton(e: Event) {
  if ((e.target as HTMLDivElement).scrollTop < -50) {
    UI_ELEMENTS.BUTTON_SCROLL.classList.add('active')
  } else {
    UI_ELEMENTS.BUTTON_SCROLL.classList.remove('active')
  }
}
UI_ELEMENTS.MESSAGE_LIST.addEventListener('scroll', showScrollButton)

// ================== Слушатели для textarea  ==================

function submitOnEnter(event: KeyboardEvent) {
  if (event.code === 'Enter' && !event.shiftKey) {
    const newEvent = new Event('submit') as SubmitEvent
    ;(event.target as HTMLFormElement).form.dispatchEvent(newEvent)
    event.preventDefault()
  }
}
UI_ELEMENTS.FORM_TEXTAREA.addEventListener('keydown', submitOnEnter)

UI_ELEMENTS.FORM_TEXTAREA.addEventListener('input', (e) => {
  const target = e.target as HTMLTextAreaElement
  sessionStorage.setItem('chat-currentInputValue', target.value)
})

if (sessionStorage.getItem('chat-currentInputValue')) {
  UI_ELEMENTS.FORM_TEXTAREA.value =
    sessionStorage.getItem('chat-currentInputValue') || ''
}

// ==================  Высота textarea при наборе текста  ==================

UI_ELEMENTS.FORM_TEXTAREA.addEventListener('input', (e) => {
  let textArea = e.target as HTMLTextAreaElement
  if (parseInt(getComputedStyle(textArea).height, 10) < 100) {
    textArea.style.height = `${textArea.scrollHeight + 2}px`
  }
})

export {
  showNotification,
  createLoadingLoader,
  showLoader,
  disableTheForm,
  scrollToLastUserMessage,
}
