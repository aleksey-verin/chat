import { UI_ELEMENTS, ERROR, NOTE } from './ui-elements'

// ==================  ОПОВЕЩЕНИЯ / ОШИБКИ ==================

export function showNotification(type, noteMessage, name = '') {
  const noteBlock = document.createElement('div')
  noteBlock.textContent = noteMessage + name
  if (type === ERROR.TYPE) {
    noteBlock.classList.add('error-container')
  }
  if (type === NOTE.TYPE) {
    noteBlock.classList.add('note-container')
  }
  noteBlock.addEventListener('click', () => noteBlock.remove())
  UI_ELEMENTS.BODY.append(noteBlock)
  setTimeout(() => {
    noteBlock.classList.add('active')
    setTimeout(() => {
      noteBlock.classList.remove('active')
      setTimeout(() => {
        noteBlock.remove()
      }, 1000)
    }, 5000)
  }, 100)
}

export function changeTheme(event) {
  if (event.target.checked) {
    UI_ELEMENTS.BODY.setAttribute('data-theme', 'dark')
    localStorage.setItem('theme', JSON.stringify('dark'))
  } else {
    UI_ELEMENTS.BODY.setAttribute('data-theme', 'light')
    localStorage.setItem('theme', JSON.stringify('light'))
  }
}

// ==================  ПОКАЗ ЗАГРУЗКИ и ОТКЛЮЧЕНИЕ ФОРМЫ   ==================

export function createLoadingSpinner() {
  const spinner = document.createElement('img')
  spinner.classList.add('spinner') //
  spinner.src = 'spinner.267ff859.svg' //
  spinner.alt = 'spinner'
  return spinner
}

export function showLoadingSpinnerForMessages(active) {
  const spinner = document.querySelector('.spinner-messages')
  if (active) {
    spinner.classList.add('active')
  } else {
    spinner.classList.remove('active')
  }
}

export function showSpinnerAndDisableForm(active) {
  const spinner = document.querySelector('.spinner')
  const linkToCode = document.querySelector('.link-code')
  const input = document.querySelector('.content-input')
  const button = document.querySelector('.content-btn')

  if (input) input.disabled = active
  if (button) button.disabled = active

  if (spinner) {
    if (active) {
      spinner.classList.add('active')
    } else {
      spinner.classList.remove('active')
    }
  }
  if (linkToCode) {
    if (active) {
      linkToCode.classList.add('disabled')
    } else {
      linkToCode.classList.remove('disabled')
    }
  }
}
