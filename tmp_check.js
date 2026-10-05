
        const STORAGE_KEYS = {
            tasks: 'jaztasks.tasks',
            settings: 'jaztasks.settings'
        };

        const defaultSettings = {
            fontFamily: 'Segoe UI, sans-serif',
            fontSize: 18,
            textColor: '#1f2937',
            backgroundColor: '#f5f2ef',
            taskCardBackground: '#ffffff',
            taskCardOpacity: 65,
            backgroundImage: ''
        };

        const taskList = document.getElementById('taskList');
        const newTaskBtn = document.getElementById('newTaskBtn');
        const settingsBtn = document.getElementById('settingsBtn');
        const settingsModal = document.getElementById('settingsModal');
        const settingsForm = document.getElementById('settingsForm');
        const fontFamilyInput = document.getElementById('fontFamily');
        const fontSizeInput = document.getElementById('fontSize');
        const textColorInput = document.getElementById('textColor');
        const backgroundColorInput = document.getElementById('backgroundColor');
        const taskCardBackgroundInput = document.getElementById('taskCardBackground');
        const taskCardOpacityInput = document.getElementById('taskCardOpacity');
        const backgroundImageInput = document.getElementById('backgroundImage');
        const closeSettingsBtn = document.getElementById('closeSettingsBtn');
        const closeSettingsXBtn = document.getElementById('closeSettingsXBtn');
        const clearTaskListBtn = document.getElementById('clearTaskListBtn');
        const removeBackgroundImageBtn = document.getElementById('removeBackgroundImage');

        let tasks = loadTasks();
        let settings = loadSettings();

        function loadTasks() {
            try {
                const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.tasks));
                return Array.isArray(stored) ? stored : [];
            } catch (error) {
                return [];
            }
        }

        function saveTasks() {
            localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
        }

        function loadSettings() {
            try {
                const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.settings));
                return { ...defaultSettings, ...(stored || {}) };
            } catch (error) {
                return { ...defaultSettings };
            }
        }

        function saveSettings() {
            localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
        }

        function hexToRgba(hex, opacityPercent) {
            const safeHex = (hex || '#ffffff').replace('#', '');
            const normalized = safeHex.length === 3
                ? safeHex.split('').map((char) => char + char).join('')
                : safeHex;

            const red = Number.parseInt(normalized.slice(0, 2), 16);
            const green = Number.parseInt(normalized.slice(2, 4), 16);
            const blue = Number.parseInt(normalized.slice(4, 6), 16);
            const opacity = Number(opacityPercent) / 100;

            return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
        }

        function applyTaskCardStyles() {
            const taskCards = document.querySelectorAll('.task-item');
            taskCards.forEach((card) => {
                const opacity = Number(settings.taskCardOpacity ?? 65);
                if (opacity <= 0) {
                    card.style.background = 'transparent';
                    card.style.boxShadow = 'none';
                    card.style.backdropFilter = 'none';
                    return;
                }

                card.style.background = hexToRgba(settings.taskCardBackground || '#ffffff', opacity);
                card.style.boxShadow = '0 8px 20px rgba(15, 23, 42, 0.15)';
                card.style.backdropFilter = 'blur(6px)';
            });
        }

        function applySettings() {
            document.body.style.fontFamily = settings.fontFamily;
            document.body.style.fontSize = `${settings.fontSize}px`;
            document.body.style.color = settings.textColor;
            document.body.style.backgroundColor = settings.backgroundColor;

            if (settings.backgroundImage) {
                document.body.style.backgroundImage = `url("${settings.backgroundImage}")`;
            } else {
                document.body.style.backgroundImage = 'none';
            }

            applyTaskCardStyles();
        }

        function populateSettingsFields() {
            fontFamilyInput.value = settings.fontFamily;
            fontSizeInput.value = String(settings.fontSize);
            textColorInput.value = settings.textColor;
            backgroundColorInput.value = settings.backgroundColor;
            taskCardBackgroundInput.value = settings.taskCardBackground;
            taskCardOpacityInput.value = String(settings.taskCardOpacity ?? 65);
        }

        function renderTasks() {
            taskList.innerHTML = '';

            tasks.forEach((task) => {
                const taskItem = document.createElement('li');
                taskItem.className = `task-item ${task.checked ? 'completed' : ''}`;

                const opacity = Number(settings.taskCardOpacity ?? 65);
                if (opacity <= 0) {
                    taskItem.style.background = 'transparent';
                    taskItem.style.boxShadow = 'none';
                    taskItem.style.backdropFilter = 'none';
                } else {
                    taskItem.style.background = hexToRgba(settings.taskCardBackground || '#ffffff', opacity);
                    taskItem.style.boxShadow = '0 8px 20px rgba(15, 23, 42, 0.15)';
                    taskItem.style.backdropFilter = 'blur(6px)';
                }

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = Boolean(task.checked);
                checkbox.setAttribute('aria-label', 'Mark task complete');
                checkbox.addEventListener('change', () => {
                    task.checked = checkbox.checked;
                    taskItem.classList.toggle('completed', task.checked);
                    saveTasks();
                });

                const textInput = document.createElement('input');
                textInput.type = 'text';
                textInput.className = 'task-text';
                textInput.value = task.text;
                textInput.placeholder = 'Task name';
                textInput.setAttribute('aria-label', 'Task name');
                textInput.addEventListener('input', (event) => {
                    task.text = event.target.value;
                    saveTasks();
                });

                const deleteBtn = document.createElement('button');
                deleteBtn.type = 'button';
                deleteBtn.className = 'delete-task';
                deleteBtn.textContent = 'Delete';
                deleteBtn.setAttribute('aria-label', 'Delete task');
                deleteBtn.addEventListener('click', () => {
                    tasks = tasks.filter((item) => item.id !== task.id);
                    saveTasks();
                    renderTasks();
                });

                taskItem.appendChild(checkbox);
                taskItem.appendChild(textInput);
                taskItem.appendChild(deleteBtn);
                taskList.appendChild(taskItem);
            });
        }

        function addTask() {
            const newTask = {
                id: Date.now() + Math.random(),
                text: '',
                checked: false
            };

            tasks.push(newTask);
            saveTasks();
            renderTasks();

            const inputs = taskList.querySelectorAll('.task-text');
            if (inputs.length) {
                inputs[inputs.length - 1].focus();
            }
        }

        function openSettings() {
            populateSettingsFields();
            applyTaskCardStyles();
            settingsModal.classList.remove('hidden');
        }

        function closeSettings() {
            settingsModal.classList.add('hidden');
        }

        newTaskBtn.addEventListener('click', addTask);
        settingsBtn.addEventListener('click', openSettings);
        closeSettingsBtn.addEventListener('click', closeSettings);
        closeSettingsXBtn.addEventListener('click', closeSettings);

        taskCardBackgroundInput.addEventListener('input', () => {
            settings.taskCardBackground = taskCardBackgroundInput.value;
            saveSettings();
            applyTaskCardStyles();
            renderTasks();
        });

        taskCardOpacityInput.addEventListener('input', () => {
            const opacityValue = Number(taskCardOpacityInput.value);
            settings.taskCardOpacity = Number.isFinite(opacityValue) ? opacityValue : defaultSettings.taskCardOpacity;
            saveSettings();
            applyTaskCardStyles();
            renderTasks();
        });

        settingsModal.addEventListener('click', (event) => {
            if (event.target === settingsModal) {
                closeSettings();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && !settingsModal.classList.contains('hidden')) {
                closeSettings();
            }
        });

        settingsForm.addEventListener('submit', (event) => {
            event.preventDefault();

            settings.fontFamily = fontFamilyInput.value;
            settings.fontSize = Number(fontSizeInput.value) || defaultSettings.fontSize;
            settings.textColor = textColorInput.value;
            settings.backgroundColor = backgroundColorInput.value;
            settings.taskCardBackground = taskCardBackgroundInput.value;

            const opacityValue = Number(taskCardOpacityInput.value);
            settings.taskCardOpacity = Number.isFinite(opacityValue) ? opacityValue : defaultSettings.taskCardOpacity;

            saveSettings();
            applySettings();
            renderTasks();
            closeSettings();
        });

        clearTaskListBtn.addEventListener('click', () => {
            tasks = [];
            settings = { ...defaultSettings };
            localStorage.clear();
            populateSettingsFields();
            applySettings();
            renderTasks();
            closeSettings();
        });

        removeBackgroundImageBtn.addEventListener('click', () => {
            settings.backgroundImage = '';
            backgroundImageInput.value = '';
            saveSettings();
            applySettings();
        });

        backgroundImageInput.addEventListener('change', (event) => {
            const file = event.target.files && event.target.files[0];
            if (!file) {
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                settings.backgroundImage = String(reader.result);
                saveSettings();
                applySettings();
            };
            reader.readAsDataURL(file);
        });

        applySettings();
        renderTasks();

        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./serviceworker.js').catch((error) => {
                    console.warn('Service worker registration failed:', error);
                });
            });
        }
    