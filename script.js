document.addEventListener('DOMContentLoaded', function() {
    const taskInput = document.getElementById('new-task');
    const deadlineInput = document.getElementById('deadline');
    const timerInput = document.getElementById('timer');
    const addTaskButton = document.getElementById('add-task-button');
    const taskList = document.getElementById('task-list');

    loadTasks();

    addTaskButton.addEventListener('click', addTask);
    taskList.addEventListener('click', handleTaskClick);

    function addTask() {
        const taskText = taskInput.value.trim();
        const deadline = deadlineInput.value;
        const timer = timerInput.value;

        if (taskText === '') return;

        const taskItem = createTaskItem(taskText, deadline, timer);
        taskList.appendChild(taskItem);
        saveTasks();
        taskInput.value = '';
        deadlineInput.value = '';
        timerInput.value = '';
    }

    function handleTaskClick(event) {
        if (event.target.tagName === 'BUTTON') {
            deleteTask(event.target.parentElement);
        } else if (event.target.tagName === 'LI') {
            toggleTaskCompletion(event.target);
        }
    }

    function createTaskItem(taskText, deadline, timer) {
        const taskItem = document.createElement('li');
        taskItem.className = 'task-item draggable';

        const taskHeader = document.createElement('div');
        taskHeader.className = 'task-header';
        taskHeader.textContent = taskText;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'X';
        taskHeader.appendChild(deleteButton);

        taskItem.appendChild(taskHeader);

        if (deadline) {
            const taskDeadline = document.createElement('div');
            taskDeadline.className = 'task-deadline';
            taskDeadline.textContent = `Deadline: ${new Date(deadline).toLocaleString()}`;
            taskItem.appendChild(taskDeadline);
        }

        if (timer) {
            const taskTimer = document.createElement('div');
            taskTimer.className = 'task-timer';
            taskTimer.textContent = `Timer: ${timer} minutes`;
            startTimer(taskTimer, timer, taskText);
            taskItem.appendChild(taskTimer);
        }

        taskItem.setAttribute('draggable', 'true');
        taskItem.addEventListener('dragstart', handleDragStart);
        taskItem.addEventListener('dragover', handleDragOver);
        taskItem.addEventListener('drop', handleDrop);

        return taskItem;
    }

    function deleteTask(taskItem) {
        taskItem.remove();
        saveTasks();
    }

    function toggleTaskCompletion(taskItem) {
        taskItem.classList.toggle('completed');
        saveTasks();
    }

    function saveTasks() {
        const tasks = [];
        taskList.querySelectorAll('.task-item').forEach(taskItem => {
            tasks.push({
                text: taskItem.querySelector('.task-header').textContent.replace('X', '').trim(),
                deadline: taskItem.querySelector('.task-deadline') ? new Date(taskItem.querySelector('.task-deadline').textContent.replace('Deadline: ', '')).toISOString() : null,
                timer: taskItem.querySelector('.task-timer') ? parseInt(taskItem.querySelector('.task-timer').textContent.replace('Timer: ', '').replace(' minutes', '')) : null,
                completed: taskItem.classList.contains('completed')
            });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => {
            const taskItem = createTaskItem(task.text, task.deadline, task.timer);
            if (task.completed) {
                taskItem.classList.add('completed');
            }
            taskList.appendChild(taskItem);
        });
    }

    function handleDragStart(event) {
        event.dataTransfer.setData('text/plain', event.target.querySelector('.task-header').textContent.replace('X', '').trim());
        event.dataTransfer.effectAllowed = 'move';
    }

    function handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }

    function handleDrop(event) {
        event.preventDefault();
        const draggedText = event.dataTransfer.getData('text/plain');
        const droppedText = event.target.querySelector('.task-header') ? event.target.querySelector('.task-header').textContent.replace('X', '').trim() : null;

        if (draggedText && droppedText) {
            const draggedTask = Array.from(taskList.children).find(taskItem => taskItem.querySelector('.task-header').textContent.includes(draggedText));
            const droppedTask = Array.from(taskList.children).find(taskItem => taskItem.querySelector('.task-header').textContent.includes(droppedText));

            if (draggedTask && droppedTask) {
                taskList.insertBefore(draggedTask, droppedTask.nextSibling);
                saveTasks();
            }
        }
    }

    function startTimer(taskTimer, timer, taskText) {
        let timeLeft = timer * 60; // Convert minutes to seconds
        const interval = setInterval(() => {
            timeLeft--;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            taskTimer.textContent = `Timer: ${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;

            if (timeLeft <= 0) {
                clearInterval(interval);
                taskTimer.textContent = 'Temps écoulé!';
                alert(`Le temps est écoulé! pour la tâche: "${taskText}"`);
            }
        }, 1000);
    }
});
