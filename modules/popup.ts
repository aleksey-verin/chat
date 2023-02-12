import Cookies from 'js-cookie'
import { UI_ELEMENTS, TYPE_MODAL_WINDOW, NOTE, ERROR } from './ui-elements'
import { createLoadingLoader, showNotification } from './handlers'
import {
  changeUserName,
  userAuthentification,
  userIndentification,
} from './fetch'

// ==================  Закрываем модальное окно  ==================

function removePopup() {
  ;(document.querySelector('.popup') as HTMLDivElement).remove()
}
function closePopupByClickOnEmptySpace(event: Event) {
  if ((event.target as HTMLDivElement).classList.contains('popup')) {
    removePopup()
  }
}
function closePopupByPressOnEscape(event: KeyboardEvent) {
  if (event.code === 'Escape') {
    removePopup()
  }
}

// ==================  Создаем модальное окно  ==================

function createPopup(type: string) {
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
  contentForm.addEventListener('submit', (event) => handleWithForm(event, type))

  const contentInput = document.createElement('input')
  contentInput.classList.add('content-input')
  contentInput.type = TYPE_MODAL_WINDOW[type].INPUT_TYPE
  contentInput.placeholder = TYPE_MODAL_WINDOW[type].PLACEHOLDER
  if (!TYPE_MODAL_WINDOW.SETTINGS.NAME) {
    contentInput.autofocus = true
  } else {
    contentInput.value = Cookies.get('chat-name') || ''
  }

  const contentButton = document.createElement('button')
  contentButton.classList.add('content-btn')
  contentButton.type = 'submit'
  contentButton.textContent = TYPE_MODAL_WINDOW[type].BUTTON_GO

  const loader = createLoadingLoader()

  let linkToCode = new DocumentFragment() as any

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

  let titleClose = new DocumentFragment() as any
  if (type === TYPE_MODAL_WINDOW.SETTINGS.NAME) {
    titleClose = document.createElement('div')
    titleClose.classList.add('title__close')
    titleClose.innerHTML = '&#9587'
    titleClose.addEventListener('click', () => removePopup(), { once: true })
  }

  popupTitle.append(titleText, titleClose)

  contentForm.append(contentInput, contentButton, linkToCode, loader)
  popupContent.append(contentTitle, contentForm)

  popupContainer.append(popupTitle, popupContent)
  popup.append(popupContainer)

  if (UI_ELEMENTS.BODY) UI_ELEMENTS.BODY.append(popup)
}

// ==================  Функции на кнопках модального окна ==================

function handleWithForm(event: Event, type: string) {
  event.preventDefault()
  const target = event.target as HTMLFormElement
  const input = target.elements[0] as HTMLInputElement
  const value = input.value
  if (!value.length) {
    return
  }
  // showLoaderAndDisableForm(true)

  // const value = event.target[0].value
  // if (!value.length) return

  // showLoaderAndDisableForm(true)

  switch (type) {
    case TYPE_MODAL_WINDOW.LOGIN.NAME:
      userIndentification(value)
      break
    case TYPE_MODAL_WINDOW.CODE.NAME:
      userAuthentification(value)
      break
    case TYPE_MODAL_WINDOW.SETTINGS.NAME:
      if (value !== Cookies.get('chat-name')) {
        changeUserName(value)
      } else {
        showNotification(
          NOTE.TYPE,
          NOTE.SAME_USERNAME,
          Cookies.get('chat-name')
        )
      }
      break
    default:
      break
  }
}

export { createPopup, removePopup }
