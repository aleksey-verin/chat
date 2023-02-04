import Cookies from 'js-cookie'
import { addMessage, scrollToLastUserMessage } from './index'
import { UI_ELEMENTS } from './ui-elements'

function connectionLight(action) {
  if (action) {
    UI_ELEMENTS.CONNECTION_LIGHT.classList.add('connect')
  } else {
    UI_ELEMENTS.CONNECTION_LIGHT.classList.remove('connect')
  }
}

function socketConnection() {
  const socket = new WebSocket(
    `wss://edu.strada.one/websockets?${Cookies.get('chat-token')}`
  )

  socket.onopen = () => {
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

  socket.onclose = (event) => {
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

  function sendMessage(event) {
    event.preventDefault()
    const userMessage = event.target[0].value.trim()
    if (userMessage.length) {
      socket.send(JSON.stringify({ text: userMessage }))
      event.target.reset()
      Cookies.set('chat-currentInputValue', '', { expires: 2 })
      UI_ELEMENTS.FORM_TEXTAREA.style.height = ''
    }
  }
  UI_ELEMENTS.FORM_MESSAGE.addEventListener('submit', sendMessage)
}

export default socketConnection
