// import { format } from 'date-fns'
import Cookies from 'js-cookie'

const UI_ELEMENTS = {
  BODY: document.querySelector('body'),
  CONTAINER: document.querySelector('.container'),
  BUTTONS: {
    SETTINGS: document.querySelector('.settings'),
  },
  THEME_SWITCHER: document.querySelector('.theme-switcher input'),
  MESSAGE_LIST: document.querySelector('main'),
  TEMPLATE_MESSAGE: document.querySelector('#templateMessage'),
  FORM_MESSAGE: document.querySelector('.send-message'),
  MODAL_WINDOW: {
    WINDOW: document.querySelector('.window'),
    CONTAINER: document.querySelector('.window-container'),
    TITLE: document.querySelector('.title__text'),
    CONTENT: document.querySelector('.window-content'),
    CONTENT_TITLE: document.querySelector('.content-title'),
    CONTENT_FORM: document.querySelector('.content-form'),
    CONTENT_INPUT: document.querySelector('.content-input'),
    CONTENT_BUTTON: document.querySelector('.content-btn'),
    CLOSE_WINDOW: document.querySelector('.title__close'),
    CLOSE_SVG: document.querySelector('.close-svg'),
    SPINNER: document.querySelector('.spinner'),
  },
}
const ERROR_TYPE = {
  SERVER_ERROR: 'Ошибка при запросе на сервер. Попробуйте позже..',
  EMAIL_ERROR: 'Неправильный адрес почты. Попробуйте еще раз..',
  OTHER_ERROR: 'Другая ошибка',
}
const NOTIFICATION = {
  SEND_EMAIL: 'Письмо с кодом успешно отправлено. Проверьте почтовый ящик..',
  SUCCESS: 'Отлично!',
}
const TYPE_MODAL_WINDOW = {
  LOGIN: {
    NAME: 'login',
    TITLE: 'Авторизация',
    CONTENT_TITLE: 'Почта:',
    BUTTON: 'Получить код',
    INPUT_VALUE: '',
    INPUT_TEXT: 'email',
    PLACEHOLDER: 'Введите адрес почты..',
  },
  CODE: {
    NAME: 'code',
    TITLE: 'Подтверждение',
    CONTENT_TITLE: 'Код:',
    BUTTON: 'Войти',
    INPUT_VALUE: '',
    INPUT_TEXT: 'text',
    PLACEHOLDER: 'Введите код из письма..',
  },
  SETTINGS: {
    NAME: 'settings',
    TITLE: 'Настройки',
    CONTENT_TITLE: 'Имя в чате:',
    BUTTON: '->',
    INPUT_VALUE: 'Стив',
    INPUT_TEXT: 'text',
    PLACEHOLDER: 'ваше имя в чате..',
  },
}

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

function showError(errorMessage) {
  const errorBlock = document.createElement('div')
  errorBlock.textContent = errorMessage
  errorBlock.classList.add('error-container', 'active')
  UI_ELEMENTS.BODY.append(errorBlock)

  setTimeout(() => {
    errorBlock.classList.remove('active')
    setTimeout(() => {
      errorBlock.remove()
    }, 1000)
  }, 3000)
}

function showNotification(noteMessage) {
  const noteBlock = document.createElement('div')
  noteBlock.textContent = noteMessage
  noteBlock.classList.add('note-container', 'active')
  UI_ELEMENTS.BODY.append(noteBlock)

  setTimeout(() => {
    noteBlock.classList.remove('active')
    setTimeout(() => {
      noteBlock.remove()
    }, 1000)
  }, 3000)
}

// ==================    ==================

function openModalWindowTemplate({
  NAME,
  TITLE,
  CONTENT_TITLE,
  BUTTON,
  INPUT_VALUE,
  INPUT_TEXT,
  PLACEHOLDER,
}) {
  UI_ELEMENTS.MODAL_WINDOW.WINDOW.classList.add('active')
  UI_ELEMENTS.MODAL_WINDOW.TITLE.textContent = TITLE
  UI_ELEMENTS.MODAL_WINDOW.CONTENT.classList.add('login-code')
  UI_ELEMENTS.MODAL_WINDOW.CONTENT_TITLE.textContent = CONTENT_TITLE
  UI_ELEMENTS.MODAL_WINDOW.CONTENT_BUTTON.textContent = BUTTON
  UI_ELEMENTS.MODAL_WINDOW.CONTENT_INPUT.value = INPUT_VALUE
  UI_ELEMENTS.MODAL_WINDOW.CONTENT_INPUT.type = INPUT_TEXT
  UI_ELEMENTS.MODAL_WINDOW.CONTENT_INPUT.placeholder = PLACEHOLDER

  switch (NAME) {
    case 'login':
      UI_ELEMENTS.MODAL_WINDOW.CONTENT_FORM.addEventListener(
        'submit',
        loginFunc
      )
      break
    case 'code':
      UI_ELEMENTS.MODAL_WINDOW.CONTENT_FORM.addEventListener('submit', codeFunc)
      break
    case 'setting':
      UI_ELEMENTS.MODAL_WINDOW.CONTENT.classList.remove('login-code')
      UI_ELEMENTS.MODAL_WINDOW.CONTENT_FORM.addEventListener(
        'submit',
        settingFunc
      )
      break
    default:
      break
  }
}

// function createCodeWindow() {
//   console.log('window-code is rendered')
//   UI_ELEMENTS.MODAL_WINDOW.CONTENT_FORM.addEventListener('submit', codeFunc)
// }
function codeFunc(event) {
  event.preventDefault()
  const token = event.target[0].value
  Cookies.set('token', token)

  showNotification(NOTIFICATION.SUCCESS)
  closeModalWindow()
  console.log(Cookies.get('token'))
}

// function createSettingsWindow() {
//   UI_ELEMENTS.MODAL_WINDOW.CONTENT.classList.remove('login-code')
//   console.log('window-settings is rendered')
//   UI_ELEMENTS.MODAL_WINDOW.CONTENT_FORM.addEventListener('submit', settingFunc)
// }
function settingFunc(event) {
  event.preventDefault()
  // const token = event.target[0].value
  let token = Cookies.get('token')
  const response = fetch('https://edu.strada.one/api/user/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    // {_id: '63d3a641f7b1780011fe683a', name: 'verevaa@yandex.ru', email: 'verevaa@yandex.ru', token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6I…xMjN9.gqh-HoI4991nMS_c-HEvVIcGlDyZkwUcUUt7vV2hXdo', __v: 0},
  })
  response.then((answer) => answer.json()).then((result) => console.log(result))
}

// function createLoginWindow() {
//   UI_ELEMENTS.MODAL_WINDOW.CONTENT_FORM.addEventListener('submit', loginFunc)
// }
function loginFunc(event) {
  event.preventDefault()
  const userEmail = event.target[0].value
  if (!userEmail.length) {
    return
  }
  UI_ELEMENTS.MODAL_WINDOW.SPINNER.classList.add('active')
  UI_ELEMENTS.MODAL_WINDOW.CONTENT_INPUT.disabled = true
  UI_ELEMENTS.MODAL_WINDOW.CONTENT_BUTTON.disabled = true

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
        showNotification(NOTIFICATION.SEND_EMAIL)
        UI_ELEMENTS.MODAL_WINDOW.CONTENT_FORM.removeEventListener(
          'submit',
          loginFunc
        )
        openModalWindowTemplate(TYPE_MODAL_WINDOW.CODE)
        // createCodeWindow()
        return answer.json()
      }
      return showError(ERROR_TYPE.EMAIL_ERROR)
    })
    .then((result) => console.log(result))
    .catch(() => {
      showError(ERROR_TYPE.SERVER_ERROR)
    })
    .finally(() => {
      UI_ELEMENTS.MODAL_WINDOW.SPINNER.classList.remove('active')
      UI_ELEMENTS.MODAL_WINDOW.CONTENT_INPUT.disabled = false
      UI_ELEMENTS.MODAL_WINDOW.CONTENT_BUTTON.disabled = false
    })

  event.target.reset()
}

// ==================  ВХОД  ==================

// openModalWindowTemplate(TYPE_MODAL_WINDOW.LOGIN)

if (!Cookies.get('token')) {
  openModalWindowTemplate(TYPE_MODAL_WINDOW.LOGIN)
  // createLoginWindow()
}

// ==================  Закрытие модального окна  ==================

function closeModalWindow() {
  UI_ELEMENTS.MODAL_WINDOW.WINDOW.classList.remove('active')
  UI_ELEMENTS.MODAL_WINDOW.CONTENT_FORM.removeEventListener('submit', loginFunc)
  UI_ELEMENTS.MODAL_WINDOW.CONTENT_FORM.removeEventListener('submit', codeFunc)
  UI_ELEMENTS.MODAL_WINDOW.CONTENT_FORM.removeEventListener(
    'submit',
    settingFunc
  )
}

UI_ELEMENTS.MODAL_WINDOW.CLOSE_WINDOW.addEventListener('click', () => {
  closeModalWindow()
})
UI_ELEMENTS.MODAL_WINDOW.WINDOW.addEventListener('click', (event) => {
  if (event.target.classList.contains('window')) {
    closeModalWindow()
  }
})
document.addEventListener('keydown', (event) => {
  if (
    // eslint-disable-next-line operator-linebreak
    event.code === 'Escape' &&
    UI_ELEMENTS.MODAL_WINDOW.WINDOW.classList.contains('active')
  ) {
    closeModalWindow()
  }
})

// ==================  Кнопка "настройки"  ==================

UI_ELEMENTS.BUTTONS.SETTINGS.addEventListener('click', () => {
  openModalWindowTemplate(TYPE_MODAL_WINDOW.SETTINGS)
  createSettingsWindow()
})

// ==================  Добавить НОВОЕ СООБЩЕНИЕ  ==================

function addMessage(text, type) {
  const message = UI_ELEMENTS.TEMPLATE_MESSAGE.content.cloneNode(true)
  message.querySelector('.message').classList.add(type)

  const messageText = message.querySelector('.message__text')
  if (type === 'user') {
    messageText.textContent = `Я: ${text}`
  } else {
    messageText.textContent = `${type}: ${text}`
  }

  const messageTime = message.querySelector('.message__time')
  messageTime.textContent = `${`0${new Date().getHours()}`.slice(-2)}
  :${`0${new Date().getMinutes()}`.slice(-2)}`
  // messageTime.textContent = format(new Date(), 'kk:mm')
  UI_ELEMENTS.MESSAGE_LIST.prepend(message)
}

UI_ELEMENTS.FORM_MESSAGE.addEventListener('submit', (event) => {
  event.preventDefault()
  if (event.target[0].value.trim().length) {
    addMessage(event.target[0].value, 'user')
    event.target.reset()
  }
})
