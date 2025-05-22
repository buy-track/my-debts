document.addEventListener('DOMContentLoaded', function () {
    // Import jalaali-js library
    const jalaali = window.jalaali;
    const jalaliMonthNames = [
        'Farvardin', 'Ordibehesht', 'Khordad', 'Tir', 'Mordad', 'Shahrivar',
        'Mehr', 'Aban', 'Azar', 'Dey', 'Bahman', 'Esfand'
    ];
    // Tasks data will be fetched from the API
    let tasks = {};

    // Current date tracking using Jalali
    const jalaliToday = jalaali.toJalaali(new Date());
    let currentMonth = jalaliToday.jm; // Jalali month
    let currentYear = jalaliToday.jy; // Jalali year

    // Initialize calendar with current Jalali month and year
    initCalendar(currentMonth, currentYear);

    // Function to initialize the calendar
    function initCalendar(month, year) {
        // Update header with current Jalali month and year
        updateCalendarHeader(month, year);

        // Generate calendar days
        generateCalendarDays(month, year);

        // Fetch tasks for the current month (in Gregorian)
        fetchTasksForMonth(month, year);
    }

    // Function to update calendar header
    function updateCalendarHeader(month, year) {
        document.querySelector('header h1').textContent = `${jalaliMonthNames[month - 1]} ${year}`;
    }

    // Function to fetch tasks for a specific date range (Gregorian)
    function fetchTasksForMonth(month, year) {
        const gregorianDates = convertJalaliMonthToGregorian(year, month);


        fetch(`/api/tasks?start_date=${gregorianDates.startDate}&end_date=${ gregorianDates.endDate}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                'Accept': 'application/json'
            },
            credentials: 'same-origin'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                tasks = data;
                // After fetching tasks, regenerate calendar to show updated task previews
                generateCalendarDays(month, year);
            })
            .catch(error => {
                console.error('Error fetching tasks:', error);
            });
    }

    // Create modal containers if they don't exist
    createModalContainers();

    // Function to generate calendar days
    function generateCalendarDays(month, year) {
        const daysGrid = document.querySelector('.days-grid');
        // Clear existing days
        daysGrid.innerHTML = '';

        // Get Jalali month details
        const daysInMonth = jalaali.jalaaliMonthLength(year, month);

        // Create a day element for each day in the Jalali month
        for (let day = 1; day <= daysInMonth; day++) {
            const gregorianDate = jalaali.toGregorian(year, month, day);

            const dateString = new Date(
                gregorianDate.gy,
                gregorianDate.gm - 1,
                gregorianDate.gd
            ).toISOString().split('T')[0];

            // Create the day element
            const dayElement = document.createElement('li');
            dayElement.classList.add('clickable');

            // Check if this is today (in Jalali)
            if (day === jalaliToday.jd && month === jalaliToday.jm && year === jalaliToday.jy) {
                dayElement.classList.add('today');
            }

            // Add the Jalali date
            const timeElement = document.createElement('time');
            timeElement.setAttribute('datetime', dateString); // Use Gregorian date for API calls
            timeElement.textContent = day; // Display Jalali date
            dayElement.appendChild(timeElement);

            // Add task preview if tasks exist for this day
            const dayTasks = tasks[dateString] || [];
            if (dayTasks.length > 0) {
                const taskPreviewContainer = document.createElement('div');
                taskPreviewContainer.className = 'task-preview';

                // Display up to 2 tasks
                dayTasks.slice(0, 2).forEach(task => {
                    const taskPreview = document.createElement('div');
                    taskPreview.className = 'task-preview-item' + (task.completed ? ' completed' : '');
                    // Create task text with truncation if needed
                    let previewText = task.text.length > 20 ? task.text.substring(0, 20) + '...' : task.text;

                    // Add amount if it exists
                    if (task.amount) {
                        previewText += ` ($${parseFloat(task.amount).toFixed(2)})`;
                    }

                    // Add recipient if it exists (truncated for preview)
                    if (task.recipient) {
                        previewText += ` → ${task.recipient.length > 10 ? task.recipient.substring(0, 10) + '...' : task.recipient}`;
                    }

                    taskPreview.textContent = previewText;
                    taskPreviewContainer.appendChild(taskPreview);
                });

                // Add indicator for additional tasks
                if (dayTasks.length > 2) {
                    const moreIndicator = document.createElement('div');
                    moreIndicator.className = 'more-tasks';
                    moreIndicator.textContent = `+${dayTasks.length - 2} more`;
                    taskPreviewContainer.appendChild(moreIndicator);
                }

                dayElement.appendChild(taskPreviewContainer);
            }

            // Add click event listener
            dayElement.addEventListener('click', function () {
                const dateTime = this.querySelector('time').getAttribute('datetime');
                openTasksModal(dateTime, this.querySelector('time').textContent, this.textContent.replace(this.querySelector('time').textContent, ''));
            });

            // Add to the grid
            daysGrid.appendChild(dayElement);
        }
    }

    // Convert Jalali month to Gregorian date range
    function convertJalaliMonthToGregorian(year, month) {
        const startDate = jalaali.toGregorian(year, month, 1);
        const endDate = jalaali.toGregorian(year, month, jalaali.jalaaliMonthLength(year, month));
        return {
            startDate: `${startDate.gy}-${startDate.gm.toString().padStart(2, '0')}-${startDate.gd.toString().padStart(2, '0')}`,
            endDate: `${endDate.gy}-${endDate.gm.toString().padStart(2, '0')}-${endDate.gd.toString().padStart(2, '0')}`
        };
    }

    // Add navigation buttons
    addMonthNavigation();

    // Function to add month navigation
    function addMonthNavigation() {
        const navigationContainer = document.createElement('div');
        navigationContainer.className = 'calendar-navigation';

        // Previous month button
        const prevButton = document.createElement('button');
        prevButton.className = 'nav-button prev-month';
        prevButton.innerHTML = '&laquo; Previous';
        prevButton.addEventListener('click', navigateToPreviousMonth);

        // Next month button
        const nextButton = document.createElement('button');
        nextButton.className = 'nav-button next-month';
        nextButton.innerHTML = 'Next &raquo;';
        nextButton.addEventListener('click', navigateToNextMonth);

        // Add buttons to container
        navigationContainer.appendChild(prevButton);
        navigationContainer.appendChild(nextButton);

        // Insert navigation before the days grid
        const daysGrid = document.querySelector('.days-grid');
        daysGrid.parentNode.insertBefore(navigationContainer, daysGrid);
    }

    // Navigate to previous month
    function navigateToPreviousMonth() {
        currentMonth--;
        if (currentMonth < 1) {
            currentMonth = 12;
            currentYear--;
        }
        initCalendar(currentMonth, currentYear);
    }

    // Navigate to next month
    function navigateToNextMonth() {
        currentMonth++;
        if (currentMonth > 12) {
            currentMonth = 1;
            currentYear++;
        }
        initCalendar(currentMonth, currentYear);
    }

    // Function to refresh the calendar with latest tasks
    function refreshCalendar() {
        fetchTasksForMonth(currentMonth, currentYear);
    }

    // Function to create modal containers
    function createModalContainers() {
        // Create tasks modal
        if (!document.getElementById('tasks-modal')) {
            const tasksModal = document.createElement('div');
            tasksModal.id = 'tasks-modal';
            tasksModal.className = 'modal';
            tasksModal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 id="modal-date">Date</h2>
                        <span class="close">&times;</span>
                    </div>
                    <div class="modal-body">
                        <h3 id="modal-holiday">Holiday</h3>
                        <div class="tasks-container">
                            <h4>Tasks</h4>
                            <ul id="tasks-list"></ul>
                            <div class="add-task" style="display: flex; flex-flow: column; gap: 0.5rem;">
                                <input type="text" id="new-task-input" placeholder="Add a new task...">
                                <input type="text" id="new-task-amount" placeholder="Amount (optional)">
                                <input type="text" id="new-task-recipient" placeholder="Recipient (optional)">
                                <div class="form-group switch-container">
                                    <label for="new-task-recurring">Recurring</label>
                                    <label class="switch">
                                        <input type="checkbox" id="new-task-recurring">
                                        <span class="slider round"></span>
                                    </label>
                                </div>
                                <div class="form-group" id="recurrence-months-container" style="display: none;">
                                    <input type="text" id="new-task-recurrence-months" placeholder="Number of months">
                                </div>
                                <button id="add-task-btn">Add</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(tasksModal);

            // Add event listener to close button
            tasksModal.querySelector('.close').addEventListener('click', function() {
                tasksModal.style.display = 'none';
                // Refresh calendar to show updated tasks
                refreshCalendar();
            });

            // Add event listener to add task button
            document.getElementById('add-task-btn').addEventListener('click', addNewTask);
            document.getElementById('new-task-input').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    addNewTask();
                }
            });

            // Add event listener for recurring checkbox
            document.getElementById('new-task-recurring').addEventListener('change', function() {
                const recurrenceMonthsContainer = document.getElementById('recurrence-months-container');
                recurrenceMonthsContainer.style.display = this.checked ? 'block' : 'none';
            });
        }

        // Create task edit modal
        if (!document.getElementById('task-edit-modal')) {
            const taskEditModal = document.createElement('div');
            taskEditModal.id = 'task-edit-modal';
            taskEditModal.className = 'modal';
            taskEditModal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Edit Task</h2>
                        <span class="close">&times;</span>
                    </div>
                    <div class="modal-body">
                        <input type="hidden" id="edit-task-id">
                        <input type="hidden" id="edit-task-date">
                        <div class="form-group">
                            <label for="edit-task-text">Task Description</label>
                            <input type="text" id="edit-task-text" placeholder="Task description">
                        </div>
                        <div class="form-group">
                            <label for="edit-task-amount">Amount (optional)</label>
                            <input type="text" id="edit-task-amount" placeholder="Amount" >
                        </div>
                        <div class="form-group">
                            <label for="edit-task-recipient">Recipient (optional)</label>
                            <input type="text" id="edit-task-recipient" placeholder="Recipient">
                        </div>
                        <div class="form-group switch-container">
                            <label for="edit-task-completed">Completed</label>
                            <label class="switch">
                                <input type="checkbox" id="edit-task-completed">
                                <span class="slider round"></span>
                            </label>
                        </div>
                        <div class="form-actions">
                            <button id="save-task-btn" class="btn-primary">Save</button>
                            <button id="delete-task-btn" class="btn-danger">Delete</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(taskEditModal);

            // Add event listener to close button
            taskEditModal.querySelector('.close').addEventListener('click', function() {
                taskEditModal.style.display = 'none';
                // Refresh calendar to show updated tasks
                refreshCalendar();
            });

            // Add event listeners to save and delete buttons
            document.getElementById('save-task-btn').addEventListener('click', saveTask);
            document.getElementById('delete-task-btn').addEventListener('click', deleteTask);
        }

        // Close modals when clicking outside
        window.addEventListener('click', function(event) {
            const tasksModal = document.getElementById('tasks-modal');
            const taskEditModal = document.getElementById('task-edit-modal');

            if (event.target === tasksModal) {
                tasksModal.style.display = 'none';
                // Refresh calendar to show updated tasks
                refreshCalendar();
            }

            if (event.target === taskEditModal) {
                taskEditModal.style.display = 'none';
                // Refresh calendar to show updated tasks
                refreshCalendar();
            }
        });
    }

    // Function to open tasks modal
    function openTasksModal(dateTime, day, holiday) {
        const modal = document.getElementById('tasks-modal');
        const modalDate = document.getElementById('modal-date');
        const modalHoliday = document.getElementById('modal-holiday');
        const tasksList = document.getElementById('tasks-list');
        console.log(dateTime,new Date(dateTime))
        // Set modal content
        const date = jalaali.toJalaali(new Date(dateTime));
        // const date = new Date(dateTime);
        const formattedDate = `${jalaliMonthNames[date.jm]} ${date.jd}, ${date.jy}`;
        modalDate.textContent = formattedDate;
        modalHoliday.textContent = holiday ? holiday.trim() : '';

        // Clear previous tasks
        tasksList.innerHTML = '';

        // Show loading indicator
        const loadingLi = document.createElement('li');
        loadingLi.className = 'loading-tasks';
        loadingLi.textContent = 'Loading tasks...';
        tasksList.appendChild(loadingLi);

        // Fetch tasks for this date from the API
        fetch(`/api/tasks/by-date?date=${dateTime}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                'Accept': 'application/json'
            },
            credentials: 'same-origin'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(dateTasks => {
                // Clear loading indicator
                tasksList.innerHTML = '';

                // Update our local tasks cache
                if (dateTasks.length > 0) {
                    tasks[dateTime] = dateTasks;

                    // Add tasks to the list
                    dateTasks.forEach(task => {
                        const li = document.createElement('li');
                        li.className = 'task-item' + (task.completed ? ' completed' : '');

                        // Create task content with amount and recipient if available
                        let taskContent = `<span class="task-text">${task.text}</span>`;

                        // Add amount if it exists
                        if (task.amount) {
                            taskContent += `<span class="task-amount">$${parseFloat(task.amount).toFixed(2)}</span>`;
                        }

                        // Add recipient if it exists
                        if (task.recipient) {
                            taskContent += `<span class="task-recipient">To: ${task.recipient}</span>`;
                        }

                        // Add task details container and status
                        li.innerHTML = `
                        <div class="task-details">${taskContent}</div>
                        <span class="task-status">${task.completed ? '✓' : '○'}</span>
                    `;

                        li.dataset.id = task.id;
                        li.dataset.date = dateTime;

                        // Add click event to open edit modal
                        li.addEventListener('click', function() {
                            openTaskEditModal(task, dateTime);
                        });

                        tasksList.appendChild(li);
                    });
                } else {
                    // If no tasks, show a message
                    const li = document.createElement('li');
                    li.className = 'no-tasks';
                    li.textContent = 'No tasks for this day. Add one below!';
                    tasksList.appendChild(li);
                }
            })
            .catch(error => {
                console.error('Error fetching tasks for date:', error);
                tasksList.innerHTML = '';
                const errorLi = document.createElement('li');
                errorLi.className = 'error-tasks';
                errorLi.textContent = 'Error loading tasks. Please try again.';
                tasksList.appendChild(errorLi);
            });

        // Store current date for adding new tasks
        document.getElementById('new-task-input').dataset.date = dateTime;

        // Show the modal
        modal.style.display = 'block';
    }

    // Function to open task edit modal
    function openTaskEditModal(task, dateTime) {
        const modal = document.getElementById('task-edit-modal');
        const taskId = document.getElementById('edit-task-id');
        const taskDate = document.getElementById('edit-task-date');
        const taskText = document.getElementById('edit-task-text');
        const taskAmount = document.getElementById('edit-task-amount');
        const taskRecipient = document.getElementById('edit-task-recipient');
        const taskCompleted = document.getElementById('edit-task-completed');

        // Set form values
        taskId.value = task.id;
        taskDate.value = dateTime;
        taskText.value = task.text;
        taskAmount.value = task.amount || '';
        taskRecipient.value = task.recipient || '';

        // Handle different formats of completed property
        // API might return 0/1, true/false, or string values
        if (typeof task.completed === 'boolean') {
            taskCompleted.checked = task.completed;
        } else if (typeof task.completed === 'number') {
            taskCompleted.checked = task.completed === 1;
        } else if (typeof task.completed === 'string') {
            taskCompleted.checked = task.completed === '1' || task.completed.toLowerCase() === 'true';
        }

        // Show the modal
        modal.style.display = 'block';
    }

    // Function to add a new task
    function addNewTask() {
        const input = document.getElementById('new-task-input');
        const dateTime = input.dataset.date;
        const taskText = input.value.trim();
        const amount = document.getElementById('new-task-amount').value;
        const recipient = document.getElementById('new-task-recipient').value.trim();
        const isRecurring = document.getElementById('new-task-recurring').checked;
        const recurrenceMonths = isRecurring ? parseInt(document.getElementById('new-task-recurrence-months').value) : null;

        if (taskText) {
            // Create new task via API
            fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    'Accept': 'application/json'
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    text: taskText,
                    date: dateTime,
                    completed: false,
                    amount: amount || null,
                    recipient: recipient || null,
                    is_recurring: isRecurring,
                    recurrence_months: recurrenceMonths
                })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(newTask => {
                    // Create tasks array for this date if it doesn't exist
                    if (!tasks[dateTime]) {
                        tasks[dateTime] = [];
                    }

                    // Add the new task to our local tasks object
                    tasks[dateTime].push(newTask);

                    // Clear inputs
                    input.value = '';
                    document.getElementById('new-task-amount').value = '';
                    document.getElementById('new-task-recipient').value = '';
                    document.getElementById('new-task-recurring').checked = false;
                    document.getElementById('new-task-recurrence-months').value = '1';
                    document.getElementById('recurrence-months-container').style.display = 'none';

                    // Refresh tasks list
                    openTasksModal(dateTime, new Date(dateTime).getDate(), document.getElementById('modal-holiday').textContent);
                })
                .catch(error => {
                    console.error('Error adding task:', error);
                    alert('Failed to add task. Please try again.');
                });
        }
    }

    // Function to save edited task
    function saveTask() {
        const taskId = parseInt(document.getElementById('edit-task-id').value);
        const dateTime = document.getElementById('edit-task-date').value;
        const taskText = document.getElementById('edit-task-text').value.trim();
        const taskCompleted = document.getElementById('edit-task-completed').checked;
        const taskAmount = document.getElementById('edit-task-amount').value;
        const taskRecipient = document.getElementById('edit-task-recipient').value.trim();

        if (taskText) {
            // Update task via API
            fetch(`/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    'Accept': 'application/json'
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    text: taskText,
                    completed: taskCompleted,
                    amount: taskAmount || null,
                    recipient: taskRecipient || null
                })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(updatedTask => {
                    // Find and update the task in our local tasks object
                    if (tasks[dateTime]) {
                        const taskIndex = tasks[dateTime].findIndex(t => t.id === taskId);

                        if (taskIndex !== -1) {
                            tasks[dateTime][taskIndex].text = taskText;
                            tasks[dateTime][taskIndex].completed = taskCompleted;
                            tasks[dateTime][taskIndex].amount = taskAmount || null;
                            tasks[dateTime][taskIndex].recipient = taskRecipient || null;
                        }
                    }

                    // Close edit modal
                    document.getElementById('task-edit-modal').style.display = 'none';

                    // Refresh tasks list
                    openTasksModal(dateTime, new Date(dateTime).getDate(), document.getElementById('modal-holiday').textContent);
                })
                .catch(error => {
                    console.error('Error updating task:', error);
                    alert('Failed to update task. Please try again.');
                });
        }
    }

    // Function to delete task
    function deleteTask() {
        const taskId = parseInt(document.getElementById('edit-task-id').value);
        const dateTime = document.getElementById('edit-task-date').value;

        // Delete task via API
        fetch(`/api/tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                'Accept': 'application/json'
            },
            credentials: 'same-origin'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                // Update our local tasks object
                if (tasks[dateTime]) {
                    tasks[dateTime] = tasks[dateTime].filter(t => t.id !== taskId);
                }

                // Close edit modal
                document.getElementById('task-edit-modal').style.display = 'none';

                // Refresh tasks list
                openTasksModal(dateTime, new Date(dateTime).getDate(), document.getElementById('modal-holiday').textContent);
            })
            .catch(error => {
                console.error('Error deleting task:', error);
                alert('Failed to delete task. Please try again.');
            });
    }
});
