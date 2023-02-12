import Cookies from 'js-cookie'
import { format, parseISO } from 'date-fns'
import { showLoader, showNotification } from './handlers'
import { ERROR, UI_ELEMENTS } from './ui-elements'
import { makeFetchRequest, url, _messages } from './fetch'

// ==================  Параметры для псевдо-пагинации  ==================

let allMessages: iMessage[] = []
const step: number = 20
let startPosition = 0
let finalPosition: number = 0

// ==================  Загрузить сообщения с сервера  ==================

interface iUser {
  email: string
  name: string
}

interface iMessage {
  _id: string
  text: string
  user: iUser
  createdAt: string
  updatedAt: string
  __v: number
}
interface iRootMessages {
  messages: iMessage[]
}

async function downloadMessagesFromTheServer(token: string) {
  showLoader(true, 'messages')

  try {
    const headers = { Authorization: `Bearer ${token}` }
    const json: iRootMessages = await makeFetchRequest(
      `${url}${_messages}`,
      'GET',
      headers
    )
    allMessages = json.messages
    finalPosition = allMessages.length
    prepareMessages(startPosition)
  } catch (error) {
    showNotification(ERROR.TYPE, ERROR.SERVER_ERROR)
  } finally {
    showLoader(false, 'messages')
  }
}

// ==================  Подгрузка сообщений при скролле  ==================

UI_ELEMENTS.MESSAGE_LIST.addEventListener('scroll', downloadMoreMessages)

function downloadMoreMessages(event: any) {
  const elem = event.target
  if (
    elem.scrollTop <= elem.clientHeight - elem.scrollHeight + 2 &&
    elem.scrollTop >= elem.clientHeight - elem.scrollHeight - 2 &&
    startPosition + step < finalPosition
  ) {
    startPosition += step
    prepareMessages(startPosition)
  }
  if (startPosition + step >= finalPosition) {
    showEndOfHistory()
  }
}

function showEndOfHistory() {
  const allMessagesLoaded = document.createElement('div')
  allMessagesLoaded.classList.add('note-messages')
  allMessagesLoaded.textContent = 'Вся история загружена'
  UI_ELEMENTS.MESSAGE_LIST.append(allMessagesLoaded)
  UI_ELEMENTS.MESSAGE_LIST.removeEventListener('scroll', downloadMoreMessages)
}

// ==================  Подготовка сообщений для добавления  ==================

function prepareMessages(position: number) {
  allMessages.slice(position, position + step).forEach((item) => {
    addMessage(
      item.text,
      item.user.email,
      item.user.name,
      item.createdAt,
      'fetch'
    )
  })
}

// ==================  Добавление сообщений(я) в верстку  ==================

function addMessage(
  text: string,
  email: string,
  name: string,
  time: string,
  type: string
) {
  const message = UI_ELEMENTS.TEMPLATE_MESSAGE.content.cloneNode(
    true
  ) as HTMLDivElement
  const userEmail = Cookies.get('chat-email')
  const messageUser = message.querySelector('.message__user') as HTMLDivElement
  const messageText = message.querySelector('.message-text') as HTMLDivElement
  const messageTime = message.querySelector('.message__time') as HTMLDivElement

  if (email === userEmail) {
    ;(message.querySelector('.message') as HTMLDivElement).classList.add('user')
  } else {
    ;(message.querySelector('.message') as HTMLDivElement).classList.add(
      'other'
    )
    messageUser.textContent = name.length > 20 ? `${name.slice(0, 20)}..` : name
  }
  messageText.textContent = text
  messageTime.textContent = format(parseISO(time), 'HH:mm')

  if (type === 'fetch') {
    UI_ELEMENTS.MESSAGE_LIST.append(message)
  } else {
    UI_ELEMENTS.MESSAGE_LIST.prepend(message)
  }
}

export { downloadMessagesFromTheServer, addMessage }
