import Cookies from 'js-cookie'
import { downloadMessagesFromTheServer } from './messages'
import { createPopup } from './popup'
import socketConnection from './socket'
import { UI_ELEMENTS, TYPE_MODAL_WINDOW } from './ui-elements'

// ==================  ВХОД  ==================

let isAuth: string | null = Cookies.get('chat-token') || null

isAuth ? startConnections() : createPopup(TYPE_MODAL_WINDOW.LOGIN.NAME)

function startConnections() {
  downloadMessagesFromTheServer(isAuth as string)
  socketConnection(isAuth as string)
}

// ==================  Кнопка "Настройки"  ==================
if (UI_ELEMENTS.BUTTONS.SETTINGS) {
  UI_ELEMENTS.BUTTONS.SETTINGS.addEventListener('click', () => {
    createPopup(TYPE_MODAL_WINDOW.SETTINGS.NAME)
  })
}

// // ==================  Кнопка "Выйти"  ==================

// function loginOut() {
//   // socket.close(1000, 'работа закончена')
//   Cookies.remove('chat-name')
//   Cookies.remove('chat-token')
//   Cookies.remove('chat-email')
//   sessionStorage.removeItem('chat-currentInputValue')
//   window.location.reload()
// }
// UI_ELEMENTS.BUTTON_EXIT.addEventListener('click', loginOut)
