import Cookies from 'js-cookie'
import { showLoaderAndDisableForm, showNotification } from './handlers'
import { downloadMessagesFromTheServer } from './messages'
import { createPopup, removePopup } from './popup'
import socketConnection from './socket'
import { ERROR, NOTE, TYPE_MODAL_WINDOW } from './ui-elements'

const url = 'https://edu.strada.one/api/user'

// ==================  Идентификация пользователя ==================

function userIndentification(userEmail: string) {
  const response = fetch(url, {
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
      showLoaderAndDisableForm(false)
    })
}

// ==================  Авторизация пользователя ==================

function userAuthentification(token: string) {
  const response = fetch(`${url}/me`, {
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
        Cookies.set('chat-name', name, { expires: 2 })
        Cookies.set('chat-token', userToken, { expires: 2 })
        Cookies.set('chat-email', email, { expires: 2 })
        showNotification(NOTE.TYPE, NOTE.SUCCESS, name)
        removePopup()
        downloadMessagesFromTheServer()
        socketConnection(userToken)
      }
    })
    .catch((error) => {
      if (error.message === 'Failed to fetch') {
        showNotification(ERROR.TYPE, ERROR.SERVER_ERROR)
      }
    })
    .finally(() => {
      showLoaderAndDisableForm(false)
    })
}

// ==================  Изменение имени пользователя ==================

function changeUserName(newUserName: string) {
  const response = fetch(url, {
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
      Cookies.set('chat-name', name, { expires: 2 })
    })
    .catch(() => {
      showNotification(ERROR.TYPE, ERROR.SERVER_ERROR)
    })
    .finally(() => {
      showLoaderAndDisableForm(false)
      window.location.reload()
    })
}

export { userIndentification, userAuthentification, changeUserName }
