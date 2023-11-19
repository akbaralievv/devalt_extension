import {
  getRulesEnabledState,
  enableRulesForCurrentPage,
  disableRulesForCurrentPage,
  // isProxyFunc,
} from '../background.js';
('use strict');
//Tasks
const taskForm = document.getElementById('taskForm');
const taskName = document.getElementById('taskName');
const taskDueDate = document.getElementById('taskDueDate');
const body = document.querySelector('body');
const checkbox = document.querySelector('#cbx-12');
const main = document.querySelector('.main');
const main2 = document.querySelector('.main-2');
const arrow = document.querySelector('#arrow');

document.getElementById('addTask').addEventListener('click', () => {
  main2.style.display = 'block';
  main.style.display = 'none';
});

taskForm.onsubmit = (e) => e.preventDefault();
arrow.addEventListener('click', function () {
  main2.style.display = 'none';
  main.style.display = 'block';
});

document.getElementById('openTaskList').addEventListener('click', openTaskList);

document.getElementById('saveTask').addEventListener('click', () => {
  const name = taskName.value;
  const dueDate = taskDueDate.value;

  if (name && dueDate) {
    const now = new Date();
    const maxFutureDate = new Date(now.getFullYear() + 3, now.getMonth(), now.getDate());
    const newDueDate = new Date(dueDate);
    if (newDueDate > now && newDueDate <= maxFutureDate) {
      saveTask({ name, dueDate });
      main2.style.display = 'none';
      main.style.display = 'block';
      taskName.value = '';
      taskDueDate.value = '';
    } else {
      chrome.notifications.create('invalidTaskNotification', {
        type: 'basic',
        iconUrl: '../images/1.png',
        title: 'Invalid Task',
        message: `The task due date is not in the future or exceeds the 3-year limit.`,
      });
    }
  }
});

// Функция для обработки нажатия на кнопку уведомления
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (notificationId === 'taskNotification' && buttonIndex === 0) {
    openTaskList();
  }
});

// Функция для сохранения задачи в локальном хранилище
function saveTask(task) {
  chrome.storage.sync.get({ tasks: [] }, (data) => {
    const tasks = data.tasks;
    tasks.push(task);

    chrome.storage.sync.set({ tasks: tasks }, () => {
      setTaskReminder(task);
    });
  });
}

//Функция для открытия новой вкладки
function openTaskList() {
  chrome.tabs.create({ url: chrome.runtime.getURL('../options/options.html') });
}

function setTaskReminder(task) {
  const dueDate = new Date(task.dueDate);
  const now = new Date();
  const maxFutureDate = new Date(now.getFullYear() + 3, now.getMonth(), now.getDate());

  if (dueDate > now && dueDate <= maxFutureDate) {
    const delayInMinutes = (dueDate - now) / 1000 / 60;

    if (delayInMinutes > 1) {
      chrome.alarms.create('taskReminder', { delayInMinutes });
      chrome.notifications.create('taskNotification', {
        type: 'basic',
        iconUrl: '../images/1.png',
        title: 'Task Reminder',
        message: `Task: ${task.name}, Due: ${dueDate.toLocaleString()}`,
        buttons: [{ title: 'Open Task List' }],
      });
    } else {
      chrome.notifications.create('invalidTaskNotification', {
        type: 'basic',
        iconUrl: '../images/1.png',
        title: 'Invalid Task',
        message: `The task has an invalid due date.`,
      });
    }
  } else {
    chrome.notifications.create('invalidTaskNotification', {
      type: 'basic',
      iconUrl: '../images/1.png',
      title: 'Invalid Task',
      message: `The task due date is not in the future or exceeds the 3-year limit.`,
    });
  }
}

//Clear Cookie
const form = document.getElementById('control-row');
const input = document.getElementById('input');
const message = document.getElementById('message');

form.addEventListener('submit', handleFormSubmit);

(async function initPopupWindow() {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab?.url) {
    try {
      let url = new URL(tab.url);
      input.value = url.hostname;
    } catch {}
  }

  input.focus();
})();

async function handleFormSubmit(event) {
  event.preventDefault();

  clearMessage();

  let url = stringToUrl(input.value);
  if (!url) {
    setMessage('Invalid URL');
    return;
  }

  // URL текущей активной вкладки для удаления кукисов
  let message = await deleteDomainCookies(url.hostname);
  setMessage(message);
  const currentHeight = body.clientHeight;
}

function stringToUrl(input) {
  try {
    return new URL(input);
  } catch {}
  try {
    return new URL('http://' + input);
  } catch {}
  return null;
}

async function deleteDomainCookies(domain) {
  let cookiesDeleted = 0;
  try {
    const cookies = await chrome.cookies.getAll({ domain });

    if (cookies.length === 0) {
      message.style.color = 'red';
      return 'No cookies found';
    }

    let pending = cookies.map(deleteCookie);
    await Promise.all(pending);

    cookiesDeleted = pending.length;
  } catch (error) {
    message.style.color = 'red';
    return `Unexpected error: ${error.message}`;
  }
  message.style.color = 'green';
  return `Deleted ${cookiesDeleted} cookie(s).`;
}

function deleteCookie(cookie) {
  const protocol = cookie.secure ? 'https:' : 'http:';

  const cookieUrl = `${protocol}//${cookie.domain}${cookie.path}`;

  return chrome.cookies.remove({
    url: cookieUrl,
    name: cookie.name,
    storeId: cookie.storeId,
  });
}

function setMessage(str) {
  message.textContent = str;
  message.hidden = false;
}

function clearMessage() {
  message.hidden = true;
  message.textContent = '';
}

async function updateButtonState() {
  const isEnabled = await getRulesEnabledState();
  if (!isEnabled) {
    checkbox.checked = false;
  } else {
    checkbox.checked = true;
  }
}
updateButtonState();

checkbox.addEventListener('click', async () => {
  const isEnabled = await getRulesEnabledState();
  if (isEnabled) {
    await disableRulesForCurrentPage(checkbox.checked ? true : false);
  } else {
    await enableRulesForCurrentPage(checkbox.checked ? true : false);
  }
  updateButtonState();
});

// document.addEventListener('DOMContentLoaded', function () {
//   chrome.proxy.settings.get({ incognito: false }, function (config) {
//     console.log(JSON.stringify(config));
//   });
//   chrome.proxy.onProxyError.addListener(function (details) {
//     console.log(details);
//   });

//   const toggleButton = document.querySelector('#toggleButton');

//   chrome.storage.local.get(['isProxyEnabled'], function (result) {
//     let isProxyEnabled = result.isProxyEnabled === undefined ? true : result.isProxyEnabled;
//     const status = isProxyEnabled ? 'Enabled' : 'Disabled';
//     toggleButton.textContent = `Proxy: ${status}`;
//     isProxyFunc(isProxyEnabled);

//     toggleButton.addEventListener('click', function () {
//       const newStatus = !isProxyEnabled;

//       chrome.storage.local.set({ isProxyEnabled: newStatus }, function () {
//         const statusText = newStatus ? 'Enabled' : 'Disabled';
//         toggleButton.textContent = `Proxy: ${statusText}`;
//         isProxyEnabled = newStatus;
//         isProxyFunc(isProxyEnabled);
//       });
//     });
//   });
// });
