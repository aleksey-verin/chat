import Cookies from 'js-cookie'
import { scrollToLastUserMessage } from './handlers'
import { addMessage } from './messages'
import { UI_ELEMENTS } from './ui-elements'

const url = 'wss://edu.strada.one/websockets?'

function connectionLight(action: boolean) {
  if (action) {
    UI_ELEMENTS.CONNECTION_LIGHT.classList.add('connect')
  } else {
    UI_ELEMENTS.CONNECTION_LIGHT.classList.remove('connect')
  }
}

function socketConnection(token: string | null) {
  // debugger
  if (!token) {
    return
  }

  const socket = new WebSocket(`${url}${token}`)

  socket.onopen = () => {
    connectionLight(true)
    console.log('Connected')
  }
  socket.onmessage = (event) => {
    const {
      createdAt,
      text,
      user: { email, name },
    } = JSON.parse(event.data)
    addMessage(text, email, name, createdAt, 'socket')

    if (email !== Cookies.get('chat-email')) {
      UI_ELEMENTS.AUDIO_INCOME_MESSAGE.muted = false
      UI_ELEMENTS.AUDIO_INCOME_MESSAGE.play()
    }

    if (
      email === Cookies.get('chat-email') ||
      UI_ELEMENTS.MESSAGE_LIST.scrollTop > -300
    ) {
      scrollToLastUserMessage()
    }
  }

  socket.onclose = () => {
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

  function sendMessage(event: Event) {
    event.preventDefault()
    const userMessage: string = UI_ELEMENTS.FORM_TEXTAREA.value.trim()
    if (userMessage.length) {
      socket.send(JSON.stringify({ text: userMessage }))
      ;(event.target as HTMLFormElement).reset()
      sessionStorage.removeItem('chat-currentInputValue')
      UI_ELEMENTS.FORM_TEXTAREA.style.height = ''
    }
  }
  UI_ELEMENTS.FORM_MESSAGE.addEventListener('submit', sendMessage)

  function loginOut() {
    socket.close(1000, 'работа закончена')
    Cookies.remove('chat-name')
    Cookies.remove('chat-token')
    Cookies.remove('chat-email')
    sessionStorage.removeItem('chat-currentInputValue')
    window.location.reload()
  }

  UI_ELEMENTS.BUTTON_EXIT.addEventListener('click', loginOut)
}

export default socketConnection
