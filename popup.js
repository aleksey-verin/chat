import Cookies from 'js-cookie'
import { UI_ELEMENTS, TYPE_MODAL_WINDOW, NOTE, ERROR } from './ui-elements'
import {
  createLoadingSpinner,
  showSpinnerAndDisableForm,
  showNotification,
} from './handlers'
import { socketConnection } from './socket'
import { downloadMessagesFromTheServer } from './index'

let userName = Cookies.get('chat-name') || ''

// ==================  Кнопка "Настройки"  ==================

UI_ELEMENTS.BUTTONS.SETTINGS.addEventListener('click', () => {
  createPopup(TYPE_MODAL_WINDOW.SETTINGS.NAME)
})

// ==================  Закрываем модальное окно  ==================

export function removePopup() {
  document.querySelector('.popup').remove()
}
export function closePopupByClickOnEmptySpace(event) {
  if (event.target.classList.contains('popup')) {
    removePopup()
  }
}
export function closePopupByPressOnEscape(event) {
  if (event.code === 'Escape') {
    removePopup()
  }
}

// ==================  Создаем модальное окно  ==================

export function createPopup(type) {
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
      contentForm.addEventListener('submit', userIndentification)
      break
    case TYPE_MODAL_WINDOW.CODE.NAME:
      contentForm.addEventListener('submit', userAuthentification)
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
}

// ==================  Функции на кнопках модального окна ==================

function userIndentification(event) {
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
    .catch(() => {
      showNotification(ERROR.TYPE, ERROR.SERVER_ERROR)
    })
    .finally(() => {
      showSpinnerAndDisableForm(false)
    })
}

function userAuthentification(event) {
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
        Cookies.set('chat-name', name, { expires: 2 })
        Cookies.set('chat-token', userToken, { expires: 2 })
        Cookies.set('chat-email', email, { expires: 2 })
        showNotification(NOTE.TYPE, NOTE.SUCCESS, name)
        removePopup()
        downloadMessagesFromTheServer()
        socketConnection()
      }
    })
    .catch((error) => {
      if (error.message === 'Failed to fetch') {
        showNotification(ERROR.TYPE, ERROR.SERVER_ERROR)
      }
    })
    .finally(() => {
      showSpinnerAndDisableForm(false)
    })
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
      Cookies.set('chat-name', name, { expires: 2 })
    })
    .catch(() => {
      showNotification(ERROR.TYPE, ERROR.SERVER_ERROR)
    })
    .finally(() => {
      showSpinnerAndDisableForm(false)
      window.location.reload()
    })
}
