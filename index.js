import { format, parseISO } from 'date-fns'
import Cookies from 'js-cookie'

const UI_ELEMENTS = {
  BODY: document.querySelector('body'),
  CONTAINER: document.querySelector('.container'),
  BUTTONS: {
    SETTINGS: document.querySelector('.settings'),
  },
  THEME_SWITCHER: document.querySelector('.theme-switcher input'),
  CONNECTION_LIGHT: document.querySelector('.connection'),
  MESSAGE_LIST: document.querySelector('main'),
  TEMPLATE_MESSAGE: document.querySelector('#templateMessage'),
  FORM_MESSAGE: document.querySelector('.send-message'),
  FORM_TEXTAREA: document.querySelector('.textarea-message'),
  BUTTON_SCROLL: document.querySelector('.scroll'),
  MODAL_WINDOW: {
    WINDOW: document.querySelector('.popup'),
    CONTAINER: document.querySelector('.popup-container'),
    TITLE: document.querySelector('.title__text'),
    CONTENT: document.querySelector('.popup-content'),
    CONTENT_TITLE: document.querySelector('.popup-title'),
    CONTENT_FORM: document.querySelector('.content-form'),
    CONTENT_INPUT: document.querySelector('.content-input'),
    CONTENT_BUTTON: document.querySelector('.content-btn'),
    CLOSE_WINDOW: document.querySelector('.title__close'),
    CLOSE_SVG: document.querySelector('.close-svg'),
    SPINNER: document.querySelector('.spinner'),
  },
}
const ERROR = {
  TYPE: 'error',
  SERVER_ERROR: 'Ошибка при запросе на сервер. Попробуйте позже..',
  EMAIL_ERROR: 'Неправильный адрес почты. Попробуйте еще раз..',
  CODE_ERROR: 'Неправильный КОД. Введите еще раз..',
  OTHER_ERROR: 'Ошибка. Попробуйте зайти позже..',
}
const NOTE = {
  TYPE: 'notification',
  SEND_EMAIL: 'Письмо с кодом успешно отправлено. Проверьте почтовый ящик..',
  SUCCESS: 'Отлично! Сейчас ваше имя в чате: ',
  CHANGE_USERNAME: 'Отлично! Вы поменяли имя на: ',
}
const TYPE_MODAL_WINDOW = {
  LOGIN: {
    NAME: 'LOGIN',
    TITLE: 'Авторизация',
    CONTENT_TITLE: 'Почта:',
    BUTTON_GO: 'Получить код',
    LINK_CODE: 'Уже есть код?',
    INPUT_TYPE: 'email',
    PLACEHOLDER: 'Введите адрес почты..',
  },
  CODE: {
    NAME: 'CODE',
    TITLE: 'Подтверждение',
    CONTENT_TITLE: 'Код:',
    BUTTON_GO: 'Войти',
    LINK_CODE: 'Не пришло письмо с кодом?',
    INPUT_TYPE: 'text',
    PLACEHOLDER: 'Введите код из письма..',
  },
  SETTINGS: {
    NAME: 'SETTINGS',
    TITLE: 'Настройки',
    CONTENT_TITLE: 'Имя в чате:',
    BUTTON_GO: 'Изменить',
    INPUT_TYPE: 'text',
    PLACEHOLDER: 'ваше имя в чате..',
  },
}

let userName = Cookies.get('chat-name') || ''

// ==================  Темы: светлая / темная  ==================

const theme = JSON.parse(localStorage.getItem('theme'))
if (theme) {
  UI_ELEMENTS.BODY.setAttribute('data-theme', theme)
}
if (theme === 'dark') {
  UI_ELEMENTS.THEME_SWITCHER.checked = true
}

UI_ELEMENTS.THEME_SWITCHER.addEventListener('change', (event) => {
  if (event.target.checked) {
    UI_ELEMENTS.BODY.setAttribute('data-theme', 'dark')
    localStorage.setItem('theme', JSON.stringify('dark'))
  } else {
    UI_ELEMENTS.BODY.setAttribute('data-theme', 'light')
    localStorage.setItem('theme', JSON.stringify('light'))
  }
})

// ==================  ОПОВЕЩЕНИЯ  ==================

function showNotification(type, noteMessage, name = '') {
  const noteBlock = document.createElement('div')
  noteBlock.textContent = noteMessage + name
  if (type === ERROR.TYPE) {
    noteBlock.classList.add('error-container')
  }
  if (type === NOTE.TYPE) {
    noteBlock.classList.add('note-container')
  }
  noteBlock.addEventListener('click', () => noteBlock.remove())
  UI_ELEMENTS.BODY.append(noteBlock)
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

// ==================  LOADING SPINNER AND DISABLE FORM   ==================

function createLoadingSpinner() {
  const spinner = document.createElement('img')
  spinner.classList.add('spinner') //
  spinner.src = 'spinner.267ff859.svg' //
  spinner.alt = 'spinner'
  return spinner
}

// function removeLoadingSpinner() {
//   document.querySelector('.spinner').remove()
// }

// function showOnlyOneSpinner(active) {
//   const spinner = document.querySelector('.spinner')
//   if (spinner) {
//     if (active) {
//       spinner.classList.add('active')
//     } else {
//       spinner.classList.remove('active')
//     }
//   }
// }

function showLoadingSpinnerForMessages(active) {
  const spinner = document.querySelector('.spinner-messages')
  if (active) {
    spinner.classList.add('active')
  } else {
    spinner.classList.remove('active')
  }
}

function showSpinnerAndDisableForm(active) {
  const spinner = document.querySelector('.spinner')
  const linkToCode = document.querySelector('.link-code')
  const input = document.querySelector('.content-input')
  const button = document.querySelector('.content-btn')

  if (input) input.disabled = active
  if (button) button.disabled = active

  if (spinner) {
    if (active) {
      spinner.classList.add('active')
    } else {
      spinner.classList.remove('active')
    }
  }
  if (linkToCode) {
    if (active) {
      linkToCode.classList.add('disabled')
    } else {
      linkToCode.classList.remove('disabled')
    }
  }
}

// ==================  Закрываем модальное окно  ==================

function removePopup() {
  document.querySelector('.popup').remove()
  console.log(Cookies.get())
}
function closePopupByClickOnEmptySpace(event) {
  if (event.target.classList.contains('popup')) {
    removePopup()
  }
}
function closePopupByPressOnEscape(event) {
  if (event.code === 'Escape') {
    removePopup()
  }
}

// ==================  Создаем модальное окно  ==================

function createPopup(type) {
  const popup = document.createElement('div')
  popup.classList.add('popup', 'active') //

  if (type === TYPE_MODAL_WINDOW.SETTINGS.NAME) {
    popup.addEventListener('mousedown', closePopupByClickOnEmptySpace, {
      once: true,
    })
    popup.addEventListener('keydown', closePopupByPressOnEscape, { once: true })
  }

  const popupContainer = document.createElement('div')
  popupContainer.classList.add('popup-container')

  const popupTitle = document.createElement('div')
  popupTitle.classList.add('popup-title')

  const titleText = document.createElement('div')
  titleText.classList.add('title__text')
  titleText.textContent = TYPE_MODAL_WINDOW[type].TITLE

  const popupContent = document.createElement('div')
  popupContent.classList.add('popup-content', 'login-code') //

  const contentTitle = document.createElement('div')
  contentTitle.classList.add('content-title')
  contentTitle.textContent = TYPE_MODAL_WINDOW[type].CONTENT_TITLE

  const contentForm = document.createElement('form')
  contentForm.classList.add('content-form')

  const contentInput = document.createElement('input')
  contentInput.classList.add('content-input')
  contentInput.type = TYPE_MODAL_WINDOW[type].INPUT_TYPE
  contentInput.placeholder = TYPE_MODAL_WINDOW[type].PLACEHOLDER
  if (!TYPE_MODAL_WINDOW.SETTINGS.NAME) {
    contentInput.autofocus = true
  }

  switch (type) {
    case TYPE_MODAL_WINDOW.LOGIN.NAME:
      contentForm.addEventListener('submit', makeInitialServerRequest)
      break
    case TYPE_MODAL_WINDOW.CODE.NAME:
      contentForm.addEventListener('submit', saveCodeInCookiesAndGetUserName)
      break
    case TYPE_MODAL_WINDOW.SETTINGS.NAME:
      contentInput.value = userName
      contentForm.addEventListener('submit', changeUserName)
      break
    default:
      break
  }

  const contentButton = document.createElement('button')
  contentButton.classList.add('content-btn')
  contentButton.type = 'submit'
  contentButton.textContent = TYPE_MODAL_WINDOW[type].BUTTON_GO

  const spinner = createLoadingSpinner()

  let linkToCode = new DocumentFragment()

  function openOtherPopup() {
    removePopup()
    if (type === TYPE_MODAL_WINDOW.LOGIN.NAME) {
      createPopup(TYPE_MODAL_WINDOW.CODE.NAME)
    }
    if (type === TYPE_MODAL_WINDOW.CODE.NAME) {
      createPopup(TYPE_MODAL_WINDOW.LOGIN.NAME)
    }
  }

  if (type !== TYPE_MODAL_WINDOW.SETTINGS.NAME) {
    linkToCode = document.createElement('a')
    linkToCode.classList.add('link-code')
    linkToCode.textContent = TYPE_MODAL_WINDOW[type].LINK_CODE
    linkToCode.addEventListener('click', openOtherPopup, {
      once: true,
    })
  }

  let titleClose = new DocumentFragment()
  if (type === TYPE_MODAL_WINDOW.SETTINGS.NAME) {
    titleClose = document.createElement('div')
    titleClose.classList.add('title__close')
    titleClose.innerHTML = '&#9587'
    titleClose.addEventListener('click', () => removePopup(), { once: true })
  }

  popupTitle.append(titleText, titleClose)

  contentForm.append(contentInput, contentButton, linkToCode, spinner)
  popupContent.append(contentTitle, contentForm)

  popupContainer.append(popupTitle, popupContent)
  popup.append(popupContainer)

  UI_ELEMENTS.BODY.append(popup)

  console.log(Cookies.get())
}

// ==================  Функции на кнопках модального окна ==================

function makeInitialServerRequest(event) {
  event.preventDefault()
  const userEmail = event.target[0].value
  if (!userEmail.length) {
    return
  }
  event.target.reset()
  showSpinnerAndDisableForm(true)

  const response = fetch('https://edu.strada.one/api/user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: userEmail,
    }),
  })
  response
    .then((answer) => {
      if (answer.ok) {
        showNotification(NOTE.TYPE, NOTE.SEND_EMAIL)
        removePopup()
        createPopup(TYPE_MODAL_WINDOW.CODE.NAME)
        return answer.json()
      }
      return showNotification(ERROR.TYPE, ERROR.EMAIL_ERROR)
    })
    .then((result) => console.log(result))
    .catch(() => {
      showNotification(ERROR.TYPE, ERROR.SERVER_ERROR)
    })
    .finally(() => {
      showSpinnerAndDisableForm(false)
    })
}

function saveCodeInCookiesAndGetUserName(event) {
  event.preventDefault()
  const token = event.target[0].value
  if (!token.length) {
    return
  }
  event.target.reset()
  showSpinnerAndDisableForm(true)

  const response = fetch('https://edu.strada.one/api/user/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  response
    .then((answer) => {
      if (answer.ok) {
        return answer.json()
      }
      return showNotification(ERROR.TYPE, ERROR.CODE_ERROR)
    })
    .then((json) => {
      if (json) {
        const { name, email, token: userToken } = json
        userName = name
        Cookies.set('chat-name', name)
        Cookies.set('chat-token', userToken)
        Cookies.set('chat-email', email)
        showNotification(NOTE.TYPE, NOTE.SUCCESS, name)
        removePopup()
        downloadMessagesFromTheServer()
      }
    })
    .catch((error) => {
      if (error.message === 'Failed to fetch') {
        showNotification(ERROR.TYPE, ERROR.SERVER_ERROR)
      } else {
        showNotification(ERROR.TYPE, ERROR.OTHER_ERROR)
      }
    })
    .finally(() => {
      showSpinnerAndDisableForm(false)
    })
  console.log(Cookies.get())
}

function changeUserName(event) {
  event.preventDefault()

  const newUserName = event.target[0].value
  if (!newUserName.length || newUserName === userName) {
    return
  }
  showSpinnerAndDisableForm(true)

  const response = fetch('https://edu.strada.one/api/user', {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${Cookies.get('chat-token')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: newUserName,
    }),
  })
  response
    .then((answer) => {
      if (answer.ok) {
        return answer.json()
      }
      return showNotification(ERROR.TYPE, ERROR.SERVER_ERROR)
    })
    .then(({ name }) => {
      showNotification(NOTE.TYPE, NOTE.CHANGE_USERNAME, name)
      userName = name
      Cookies.set('chat-name', name)
      console.log(Cookies.get())
    })
    .catch(() => {
      showNotification(ERROR.TYPE, ERROR.SERVER_ERROR)
    })
    .finally(() => {
      showSpinnerAndDisableForm(false)
      window.location.reload()
    })
}

// ==================  Кнопка "Настройки"  ==================

UI_ELEMENTS.BUTTONS.SETTINGS.addEventListener('click', () => {
  createPopup(TYPE_MODAL_WINDOW.SETTINGS.NAME)
})

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
      allMessagesLoaded.classList.add('date')
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
      // renderMessages()
    }
  }
  console.log(finish)
}

function downloadMessagesFromTheServer() {
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
// function loadMoreData() {
//   if (finish === allMessages.length) {
//     const allMessagesLoaded = document.createElement('div')
//     allMessagesLoaded.classList.add('date')
//     allMessagesLoaded.textContent = 'Вся история загружена'
//     UI_ELEMENTS.MESSAGE_LIST.append(allMessagesLoaded)
//     UI_ELEMENTS.MESSAGE_LIST.removeEventListener('scroll', scrollMessagesList)
//   } else {
//     if (finish >= allMessages.length - step) {
//       finish = allMessages.length
//     } else {
//       finish += step
//     }
//     start += step
//     renderMessages()
//   }
// }

// ==================  ВХОД  ==================

// Cookies.remove('chat-name')
// Cookies.remove('chat-token')
// Cookies.remove('chat-email')

if (!Cookies.get('chat-token')) {
  createPopup(TYPE_MODAL_WINDOW.LOGIN.NAME)
} else {
  downloadMessagesFromTheServer()
}

function connectionLight(action) {
  if (action) {
    UI_ELEMENTS.CONNECTION_LIGHT.classList.add('connect')
  } else {
    UI_ELEMENTS.CONNECTION_LIGHT.classList.remove('connect')
  }
}

const socket = new WebSocket(
  `wss://edu.strada.one/websockets?${Cookies.get('chat-token')}`
)
socket.onopen = () => {
  console.log('Соединение установлено')
  connectionLight(true)
}
socket.onmessage = (event) => {
  const {
    createdAt,
    text,
    user: { email, name },
  } = JSON.parse(event.data)

  addMessage(text, email, name, createdAt)

  if (
    email === Cookies.get('chat-email') ||
    UI_ELEMENTS.MESSAGE_LIST.scrollTop > -300
  ) {
    scrollToLastUserMessage()
  }
}

socket.onclose = function (event) {
  console.log('Соединение закрыто', event)
  if (UI_ELEMENTS.CONNECTION_LIGHT.classList.contains('connect')) {
    connectionLight(false)
    window.location.reload()
  }
}

UI_ELEMENTS.CONNECTION_LIGHT.addEventListener('click', () => {
  if (UI_ELEMENTS.CONNECTION_LIGHT.classList.contains('connect')) {
    UI_ELEMENTS.CONNECTION_LIGHT.classList.remove('connect')
    socket.close(1000, 'работа закончена')
  } else {
    window.location.reload()
  }
})

// ================== функция Добавить НОВОЕ СООБЩЕНИЕ  ==================

function addMessage(text, email, name, time, type) {
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

  // if (date) {
  //   const dateInList = document.createElement('div')
  //   if (format(parseISO(time), 'd MMMM') === format(new Date(), 'd MMMM')) {
  //     dateInList.textContent = 'Today'
  //   } else {
  //     dateInList.textContent = format(parseISO(time), 'd MMMM')
  //   }
  //   dateInList.classList.add('date')
  //   message.append(dateInList)
  // }

  // if (showFrom === 0) {
  //   UI_ELEMENTS.MESSAGE_LIST.prepend(message)
  // } else {
  if (type) {
    UI_ELEMENTS.MESSAGE_LIST.append(message)
  } else {
    UI_ELEMENTS.MESSAGE_LIST.prepend(message)
  }
}

function scrollToLastUserMessage() {
  UI_ELEMENTS.MESSAGE_LIST.scrollTo({ top: -1, left: 0, behavior: 'smooth' })
}

UI_ELEMENTS.FORM_MESSAGE.addEventListener('submit', sendMessage)
function sendMessage(event) {
  event.preventDefault()
  const userMessage = event.target[0].value.trim()
  if (userMessage.length) {
    socket.send(JSON.stringify({ text: userMessage }))
    event.target.reset()
    Cookies.set('currentInputValue', '')
    UI_ELEMENTS.FORM_TEXTAREA.style.height = ''
  }
}

// {
// "_id":"63da1a60d1fd72001178338d",
// "text":"тест",
// "user":
//   {"email":"verevaa@yandex.ru",
//   "name":"Aleksey Verin"},
// "createdAt":"2023-02-01T07:53:04.163Z",
// "updatedAt":"2023-02-01T07:53:04.163Z",
// "__v":0
// }

UI_ELEMENTS.FORM_TEXTAREA.addEventListener('input', (e) => {
  if (parseInt(getComputedStyle(e.target).height) < 100) {
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
  Cookies.set('currentInputValue', e.target.value)
})

if (Cookies.get('currentInputValue')) {
  UI_ELEMENTS.FORM_TEXTAREA.value = Cookies.get('currentInputValue')
}
