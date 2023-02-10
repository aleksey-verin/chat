const UI_ELEMENTS = {
  BODY: document.querySelector('body') as HTMLBodyElement,
  CONTAINER: document.querySelector('.container'),
  BUTTONS: {
    SETTINGS: document.querySelector('.settings') as HTMLButtonElement,
  },
  THEME_SWITCHER: document.querySelector(
    '.theme-switcher input'
  ) as HTMLInputElement,
  CONNECTION_LIGHT: document.querySelector('.connection') as HTMLDivElement,
  BUTTON_EXIT: document.querySelector('.exit') as HTMLButtonElement,
  MESSAGE_LIST: document.querySelector('main') as HTMLDivElement,
  TEMPLATE_MESSAGE: document.querySelector(
    '#templateMessage'
  ) as HTMLTemplateElement,
  FORM_MESSAGE: document.querySelector('.send-message') as HTMLFormElement,
  FORM_TEXTAREA: document.querySelector(
    '.textarea-message'
  ) as HTMLTextAreaElement,
  BUTTON_SCROLL: document.querySelector('.scroll') as HTMLButtonElement,
  MODAL_WINDOW: {
    WINDOW: document.querySelector('.popup'),
    CONTAINER: document.querySelector('.popup-container'),
    TITLE: document.querySelector('.title__text'),
    CONTENT: document.querySelector('.popup-content'),
    CONTENT_TITLE: document.querySelector('.popup-title'),
    CONTENT_FORM: document.querySelector('.content-form'),
    CONTENT_INPUT: document.querySelector('.content-input'),
    CONTENT_BUTTON: document.querySelector('.content-btn'),
    CLOSE_WINDOW: document.querySelector('.title__close'),
    CLOSE_SVG: document.querySelector('.close-svg'),
    SPINNER: document.querySelector('.spinner'),
  },
  AUDIO_INCOME_MESSAGE: document.querySelector(
    '#notification'
  ) as HTMLAudioElement,
}
const ERROR = {
  TYPE: 'error',
  SERVER_ERROR: 'Ошибка при запросе на сервер. Попробуйте позже..',
  EMAIL_ERROR: 'Неправильный адрес почты. Попробуйте еще раз..',
  CODE_ERROR: 'Неправильный КОД. Введите еще раз..',
  OTHER_ERROR: 'Ошибка. Попробуйте зайти позже..',
}
const NOTE = {
  TYPE: 'notification',
  SEND_EMAIL: 'Письмо с кодом успешно отправлено. Проверьте почтовый ящик..',
  SUCCESS: 'Вход выполнен! Ваше имя в чате: ',
  CHANGE_USERNAME: 'Отлично! Вы поменяли имя на: ',
}
const TYPE_MODAL_WINDOW: modalWindowTypes = {
  LOGIN: {
    NAME: 'LOGIN',
    TITLE: 'Авторизация',
    CONTENT_TITLE: 'Почта:',
    BUTTON_GO: 'Получить код',
    LINK_CODE: 'Уже есть код?',
    INPUT_TYPE: 'email',
    PLACEHOLDER: 'Введите адрес почты..',
  },
  CODE: {
    NAME: 'CODE',
    TITLE: 'Подтверждение',
    CONTENT_TITLE: 'Код:',
    BUTTON_GO: 'Войти',
    LINK_CODE: 'Не пришло письмо с кодом?',
    INPUT_TYPE: 'text',
    PLACEHOLDER: 'Введите код из письма..',
  },
  SETTINGS: {
    NAME: 'SETTINGS',
    TITLE: 'Настройки',
    CONTENT_TITLE: 'Имя в чате:',
    BUTTON_GO: 'Изменить',
    INPUT_TYPE: 'text',
    PLACEHOLDER: 'ваше имя в чате..',
  },
}

interface modalWindowTypes {
  [LOGIN: string]: {
    NAME: string
    TITLE: string
    CONTENT_TITLE: string
    BUTTON_GO: string
    LINK_CODE?: string
    INPUT_TYPE: string
    PLACEHOLDER: string
  }
}

export { UI_ELEMENTS, ERROR, NOTE, TYPE_MODAL_WINDOW }
