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
  CODE_ERROR: 'Неправильный КОД. Введите еще раз..',
  OTHER_ERROR: 'Другая ошибка',
}
const NOTIFICATION = {
  SEND_EMAIL: 'Письмо с кодом успешно отправлено. Проверьте почтовый ящик..',
  SUCCESS: 'Отлично! Сейчас ваше имя в чате: ',
  CHANGE_USERNAME: 'Отлично! Вы поменяли имя на: ',
}
const TYPE_MODAL_WINDOW = {
  LOGIN: {
    NAME: 'login',
    TITLE: 'Авторизация',
    CONTENT_TITLE: 'Почта:',
    BUTTON: 'Получить код',
    INPUT_TEXT: 'email',
    PLACEHOLDER: 'Введите адрес почты..',
  },
  CODE: {
    NAME: 'code',
    TITLE: 'Подтверждение',
    CONTENT_TITLE: 'Код:',
    BUTTON: 'Войти',
    INPUT_TEXT: 'text',
    PLACEHOLDER: 'Введите код из письма..',
  },
  SETTINGS: {
    NAME: 'settings',
    TITLE: 'Настройки',
    CONTENT_TITLE: 'Имя в чате:',
    BUTTON: '->',
    INPUT_TEXT: 'text',
    PLACEHOLDER: 'ваше имя в чате..',
  },
}

console.log(Cookies.get())

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
  }, 5000)
}

function showNotification(noteMessage, name = '') {
  const noteBlock = document.createElement('div')
  noteBlock.textContent = noteMessage + name
  noteBlock.classList.add('note-container', 'active')
  UI_ELEMENTS.BODY.append(noteBlock)

  setTimeout(() => {
    noteBlock.classList.remove('active')
    setTimeout(() => {
      noteBlock.remove()
    }, 1000)
  }, 5000)
}

// ==================  SPINNER AND DISABLE FORM   ==================

function showSpinnerAndDisableForm(active) {
  if (active) {
    UI_ELEMENTS.MODAL_WINDOW.SPINNER.classList.add('active')
    UI_ELEMENTS.MODAL_WINDOW.CONTENT_INPUT.disabled = true
    UI_ELEMENTS.MODAL_WINDOW.CONTENT_BUTTON.disabled = true
  } else {
    UI_ELEMENTS.MODAL_WINDOW.SPINNER.classList.remove('active')
    UI_ELEMENTS.MODAL_WINDOW.CONTENT_INPUT.disabled = false
    UI_ELEMENTS.MODAL_WINDOW.CONTENT_BUTTON.disabled = false
  }
}

// ==================  Открыть шаблон модального окна  ==================

function openModalWindowTemplate({
  NAME,
  TITLE,
  CONTENT_TITLE,
  BUTTON,
  INPUT_TEXT,
  PLACEHOLDER,
}) {
  UI_ELEMENTS.MODAL_WINDOW.WINDOW.classList.add('active')
  UI_ELEMENTS.MODAL_WINDOW.TITLE.textContent = TITLE
  UI_ELEMENTS.MODAL_WINDOW.CONTENT.classList.add('login-code')
  UI_ELEMENTS.MODAL_WINDOW.CONTENT_TITLE.textContent = CONTENT_TITLE
  UI_ELEMENTS.MODAL_WINDOW.CONTENT_BUTTON.textContent = BUTTON
  UI_ELEMENTS.MODAL_WINDOW.CONTENT_INPUT.type = INPUT_TEXT
  UI_ELEMENTS.MODAL_WINDOW.CONTENT_INPUT.placeholder = PLACEHOLDER

  switch (NAME) {
    case 'login':
      UI_ELEMENTS.MODAL_WINDOW.CONTENT_FORM.addEventListener(
        'submit',
        makeInitialServerRequest
      )
      break
    case 'code':
      UI_ELEMENTS.MODAL_WINDOW.CONTENT_FORM.addEventListener(
        'submit',
        saveCodeInCookiesAndGetUserName
      )
      break
    case 'settings':
      UI_ELEMENTS.MODAL_WINDOW.CONTENT.classList.remove('login-code')
      UI_ELEMENTS.MODAL_WINDOW.CONTENT_INPUT.value = userName
      UI_ELEMENTS.MODAL_WINDOW.CONTENT_FORM.addEventListener(
        'submit',
        changeUserName
      )
      addAbilityToCloseTheWindow()
      break
    default:
      break
  }
}

// ==================  Функции на кнопках модального окна ==================

function makeInitialServerRequest(event) {
  event.preventDefault()
  const userEmail = event.target[0].value
  if (!userEmail.length) {
    return
  }
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
        showNotification(NOTIFICATION.SEND_EMAIL)
        UI_ELEMENTS.MODAL_WINDOW.CONTENT_FORM.removeEventListener(
          'submit',
          makeInitialServerRequest
        )
        removeListeners()
        openModalWindowTemplate(TYPE_MODAL_WINDOW.CODE)
        return answer.json()
      }
      return showError(ERROR_TYPE.EMAIL_ERROR)
    })
    .then((result) => console.log(result))
    .catch(() => {
      showError(ERROR_TYPE.SERVER_ERROR)
    })
    .finally(() => {
      showSpinnerAndDisableForm(false)
    })

  event.target.reset()
}

function saveCodeInCookiesAndGetUserName(event) {
  event.preventDefault()
  const token = event.target[0].value
  Cookies.set('chat-token', token)

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
        UI_ELEMENTS.MODAL_WINDOW.CONTENT_FORM.removeEventListener(
          'submit',
          makeInitialServerRequest
        )
        return answer.json()
      }
      return showError(ERROR_TYPE.SERVER_ERROR)
    })
    .then(({ name }) => {
      userName = name
      Cookies.set('chat-name', name)
      showNotification(NOTIFICATION.SUCCESS, name)
      removeListeners()
      closeModalWindow()
    })
    .catch(() => {
      showError(ERROR_TYPE.CODE_ERROR)
    })
    .finally(() => {
      showSpinnerAndDisableForm(false)
    })
  console.log(Cookies.get('chat-token'))
}

function changeUserName(event) {
  event.preventDefault()

  const newUserName = event.target[0].value
  if (!newUserName.length) {
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
        showNotification(NOTIFICATION.CHANGE_USERNAME)
        return answer.json()
      }
      return showError(ERROR_TYPE.SERVER_ERROR)
    })
    .then(({ name }) => {
      console.log(name)
      userName = name
      Cookies.set('chat-name', name)
      console.log(Cookies.get())
    })
    .catch(() => {
      showError(ERROR_TYPE.SERVER_ERROR)
    })
    .finally(() => {
      showSpinnerAndDisableForm(false)
    })
}

// ==================  ВХОД  ==================

// Cookies.remove()

if (!Cookies.get('chat-token')) {
  openModalWindowTemplate(TYPE_MODAL_WINDOW.LOGIN)
}

// ==================  Удаление обработчиков с кнопок  ==================

function removeListeners() {
  UI_ELEMENTS.MODAL_WINDOW.CONTENT_FORM.removeEventListener(
    'submit',
    makeInitialServerRequest
  )
  UI_ELEMENTS.MODAL_WINDOW.CONTENT_FORM.removeEventListener(
    'submit',
    saveCodeInCookiesAndGetUserName
  )
  UI_ELEMENTS.MODAL_WINDOW.CONTENT_FORM.removeEventListener(
    'submit',
    changeUserName
  )
}

// ==================  Закрытие модального окна  ==================

function closeModalWindow() {
  UI_ELEMENTS.MODAL_WINDOW.WINDOW.classList.remove('active')
}

function addAbilityToCloseTheWindow() {
  UI_ELEMENTS.MODAL_WINDOW.CLOSE_WINDOW.addEventListener('click', closeOnButton)
  function closeOnButton() {
    closeModalWindow()
    UI_ELEMENTS.MODAL_WINDOW.CLOSE_WINDOW.removeEventListener(
      'click',
      closeOnButton
    )
  }
  UI_ELEMENTS.MODAL_WINDOW.WINDOW.addEventListener('click', closeOnEmptySpace)
  function closeOnEmptySpace(event) {
    if (event.target.classList.contains('window')) {
      closeModalWindow()
      UI_ELEMENTS.MODAL_WINDOW.WINDOW.removeEventListener(
        'click',
        closeOnEmptySpace
      )
    }
  }
  document.addEventListener('keydown', closeOnEscape)
  function closeOnEscape(event) {
    if (
      // eslint-disable-next-line operator-linebreak
      event.code === 'Escape' &&
      UI_ELEMENTS.MODAL_WINDOW.WINDOW.classList.contains('active')
    ) {
      closeModalWindow()
      document.removeEventListener('keydown', closeOnEscape)
    }
  }
}

// ==================  Кнопка "настройки"  ==================

UI_ELEMENTS.BUTTONS.SETTINGS.addEventListener('click', () => {
  openModalWindowTemplate(TYPE_MODAL_WINDOW.SETTINGS)
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
