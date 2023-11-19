// Функция для отображения списка задач с кнопками удаления

const taskList = document.getElementById('taskList');
const taskWrapper = document.querySelector('.taskLists');

if (taskList) {
  chrome.storage.sync.get({ tasks: [] }, (data) => {
    renderTasks(data.tasks);
  });
}

function renderTasks(tasks) {
  taskList.innerHTML = '';
  if (tasks.length > 0) {
    tasks.forEach((task, index) => {
      const taskItem = document.createElement('li');
      const taskName = document.createElement('p');
      const taskDate = document.createElement('p');
      const texts = document.createElement('div');
      taskName.textContent = `Task ${index + 1}: ${task.name}`;
      taskDate.textContent = `Due date: ${new Date(task.dueDate).toLocaleString()}`;
      texts.append(taskName, taskDate);

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', () => {
        deleteTask(index);
      });

      taskItem.append(texts, deleteButton);
      taskList.appendChild(taskItem);
    });
  } else {
    const notFound = document.createElement('p');
    notFound.innerText = 'No tasks yet';
    taskWrapper.appendChild(notFound);
  }
}

// Функция для удаления задачи по индексу
function deleteTask(index) {
  chrome.storage.sync.get({ tasks: [] }, (data) => {
    const tasks = data.tasks;

    if (index >= 0 && index < tasks.length) {
      tasks.splice(index, 1);
      chrome.storage.sync.set({ tasks: tasks }, () => {
        renderTasks(tasks);
      });
    }
  });
}

//Список установленных расширений
chrome.management.getAll((extInfo) => {
  const extensionList = document.getElementById('extensionList');
  if (extInfo.length > 0) {
    extInfo.forEach((ext) => {
      const listItem = document.createElement('li');
      listItem.textContent = ext.name;
      extensionList.appendChild(listItem);
    });
  } else {
    const notFound = document.createElement('p');
    notFound.innerText = "You don't have any extensions installed";
    taskWrapper.appendChild(notFound);
  }
});
