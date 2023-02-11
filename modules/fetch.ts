import Cookies from 'js-cookie'
import { showLoaderAndDisableForm, showNotification } from './handlers'
import { downloadMessagesFromTheServer } from './messages'
import { createPopup, removePopup } from './popup'
import socketConnection from './socket'
import { ERROR, NOTE, TYPE_MODAL_WINDOW } from './ui-elements'

const url = 'https://edu.strada.one/api/'
const _user = 'user/'
const _messages = 'messages/'

interface iChangeName {
  name: string
}

interface iUserData {
  _id: string
  name: string
  email: string
  token: string
  __v: number
}

// ==================  Общий fetch-запрос на сервер ==================

async function makeFetchRequest(
  url: string,
  method: string,
  headers: Record<string, string>,
  body?: Record<string, string>
) {
  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    showNotification(ERROR.TYPE, ERROR.SERVER_ERROR)
    throw new Error(response.statusText)
  }

  return response.json()
}

// ==================  Идентификация пользователя ==================

async function userIndentification(userEmail: string) {
  showLoaderAndDisableForm(true)

  try {
    const headers = { 'Content-Type': 'application/json' }
    const body = { email: userEmail }
    await makeFetchRequest(`${url}${_user}`, 'POST', headers, body)
    showNotification(NOTE.TYPE, NOTE.SEND_EMAIL)
    removePopup()
    createPopup(TYPE_MODAL_WINDOW.CODE.NAME)
  } catch (error) {
    showNotification(ERROR.TYPE, ERROR.EMAIL_ERROR)
  } finally {
    showLoaderAndDisableForm(false)
  }
}

// ==================  Авторизация пользователя ==================

async function userAuthentification(token: string) {
  showLoaderAndDisableForm(true)

  try {
    const headers = { Authorization: `Bearer ${token}` }
    const json = await makeFetchRequest(`${url}${_user}/me`, 'GET', headers)
    const { name, email, token: userToken } = json as iUserData
    Cookies.set('chat-name', name, { expires: 2 })
    Cookies.set('chat-token', userToken, { expires: 2 })
    Cookies.set('chat-email', email, { expires: 2 })
    showNotification(NOTE.TYPE, NOTE.SUCCESS, name)
    removePopup()
    downloadMessagesFromTheServer(token)
    socketConnection(userToken)
  } catch (error) {
    if ((error as Error).message === 'Failed to fetch') {
      showNotification(ERROR.TYPE, ERROR.SERVER_ERROR)
    } else {
      showNotification(ERROR.TYPE, ERROR.CODE_ERROR)
    }
  } finally {
    showLoaderAndDisableForm(false)
  }
}

// ==================  Изменение имени пользователя ==================

async function changeUserName(newUserName: string) {
  showLoaderAndDisableForm(true)

  try {
    const headers = {
      Authorization: `Bearer ${Cookies.get('chat-token')}`,
      'Content-Type': 'application/json',
    }
    const body = { name: newUserName }
    const json = await makeFetchRequest(
      `${url}${_user}`,
      'PATCH',
      headers,
      body
    )
    const { name } = json as iChangeName
    showNotification(NOTE.TYPE, NOTE.CHANGE_USERNAME, name)
    Cookies.set('chat-name', name, { expires: 2 })
  } catch (error) {
    showNotification(ERROR.TYPE, ERROR.SERVER_ERROR)
  } finally {
    showLoaderAndDisableForm(false)
    // window.location.reload()
  }
}

export {
  makeFetchRequest,
  userIndentification,
  userAuthentification,
  changeUserName,
  url,
  _messages,
}
