import { format, parseISO } from 'date-fns'
import Cookies from 'js-cookie'

import { UI_ELEMENTS, ERROR, TYPE_MODAL_WINDOW } from './ui-elements'
import { createPopup } from './popup'
import {
  showNotification,
  changeTheme,
  showLoadingSpinnerForMessages,
} from './handlers'
import socketConnection from './socket'

// ==================  ВХОД  ==================

Cookies.remove('chat-name')
Cookies.remove('chat-token')
Cookies.remove('chat-email')
Cookies.remove('currentInputValue')

if (!Cookies.get('chat-token')) {
  createPopup(TYPE_MODAL_WINDOW.LOGIN.NAME)
} else {
  downloadMessagesFromTheServer()
}
socketConnection()

// ==================  Темы: светлая / темная  ==================

const theme = JSON.parse(localStorage.getItem('theme'))
if (theme) {
  UI_ELEMENTS.BODY.setAttribute('data-theme', theme)
}
if (theme === 'dark') {
  UI_ELEMENTS.THEME_SWITCHER.checked = true
}

UI_ELEMENTS.THEME_SWITCHER.addEventListener('change', changeTheme)

// ==================  Загрузить сообщения с сервера (пагинация)  ==================

let allMessages = []
const step = 20
let start = 0
let finish = start + step

function renderMessages(type) {
  if (finish !== allMessages.length) {
    allMessages.slice(start, finish).forEach((item) => {
      addMessage(
        item.text,
        item.user.email,
        item.user.name,
        item.createdAt,
        'messages'
      )
    })
  }
  if (type) {
    if (finish === allMessages.length) {
      const allMessagesLoaded = document.createElement('div')
      allMessagesLoaded.classList.add('note-messages')
      allMessagesLoaded.textContent = 'Вся история загружена'
      UI_ELEMENTS.MESSAGE_LIST.append(allMessagesLoaded)
      UI_ELEMENTS.MESSAGE_LIST.removeEventListener('scroll', scrollMessagesList)
    } else {
      if (finish >= allMessages.length - step) {
        finish = allMessages.length
      } else {
        finish += step
      }
      start += step
    }
  }
}

export function downloadMessagesFromTheServer() {
  showLoadingSpinnerForMessages(true)
  const response = fetch('https://edu.strada.one/api/messages/', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${Cookies.get('chat-token')}`,
    },
  })
  response
    .then((answer) => answer.json())
    .then((messages) => {
      allMessages = messages.messages
      renderMessages()
    })
    .catch(() => {
      showNotification(ERROR.TYPE, ERROR.SERVER_ERROR)
    })
    .finally(() => {
      showLoadingSpinnerForMessages(false)
    })
}

// ==================  Прокрутка вниз по кнопке  ==================

UI_ELEMENTS.BUTTON_SCROLL.addEventListener('click', () => {
  scrollToLastUserMessage()
})

UI_ELEMENTS.MESSAGE_LIST.addEventListener('scroll', showScrollButton)
function showScrollButton(event) {
  if (event.target.scrollTop < -50) {
    UI_ELEMENTS.BUTTON_SCROLL.classList.add('active')
  } else {
    UI_ELEMENTS.BUTTON_SCROLL.classList.remove('active')
  }
}

UI_ELEMENTS.MESSAGE_LIST.addEventListener('scroll', scrollMessagesList)
function scrollMessagesList(event) {
  const elem = event.target
  if (
    elem.scrollTop <= elem.clientHeight - elem.scrollHeight + 2 &&
    elem.scrollTop >= elem.clientHeight - elem.scrollHeight - 2
  ) {
    renderMessages('messages')
  }
}

// ================== функция Добавить НОВОЕ СООБЩЕНИЕ  ==================

export function addMessage(text, email, name, time, type) {
  const message = UI_ELEMENTS.TEMPLATE_MESSAGE.content.cloneNode(true)
  const userEmail = Cookies.get('chat-email')
  const messageUser = message.querySelector('.message__user')
  const messageText = message.querySelector('.message-text')
  const messageTime = message.querySelector('.message__time')

  if (email === userEmail) {
    message.querySelector('.message').classList.add('user')
  } else {
    message.querySelector('.message').classList.add('other')
    messageUser.textContent = name.length > 20 ? `${name.slice(0, 20)}..` : name
  }
  messageText.textContent = text
  messageTime.textContent = format(parseISO(time), 'HH:mm')

  if (type) {
    UI_ELEMENTS.MESSAGE_LIST.append(message)
  } else {
    UI_ELEMENTS.MESSAGE_LIST.prepend(message)
  }
}

export function scrollToLastUserMessage() {
  UI_ELEMENTS.MESSAGE_LIST.scrollTo({ top: -1, left: 0, behavior: 'smooth' })
}

UI_ELEMENTS.FORM_TEXTAREA.addEventListener('input', (e) => {
  if (parseInt(getComputedStyle(e.target).height, 10) < 100) {
    e.target.style.height = `${e.target.scrollHeight + 2}px`
  }
})

function submitOnEnter(event) {
  if (event.code === 'Enter' && !event.shiftKey) {
    const newEvent = new Event('submit')
    event.target.form.dispatchEvent(newEvent)
    event.preventDefault()
  }
}
UI_ELEMENTS.FORM_TEXTAREA.addEventListener('keydown', submitOnEnter)

UI_ELEMENTS.FORM_TEXTAREA.addEventListener('input', (e) => {
  Cookies.set('chat-currentInputValue', e.target.value, { expires: 2 })
})

if (Cookies.get('chat-currentInputValue')) {
  UI_ELEMENTS.FORM_TEXTAREA.value = Cookies.get('chat-currentInputValue')
}
