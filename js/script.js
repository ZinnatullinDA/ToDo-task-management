

var userinput = document.querySelector("#user-input");
var p_nothing = document.querySelector("#task-field-nothing");
var p_completed_nothing = document.querySelector("#task-field-completed_nothing");


const MAX_LENGTH = 100;  // Сколько символов может быть в тексте задачи



var TaskField = {
    /**
     * Место, где будут показаны новые задания
     */
    DOM: document.querySelector("#task-field > #task-field-nothing"),

    /**
     * Место, где будут показаны выполненные задания
     */
    DOM_COMPLETED: document.querySelector("#task-field-completed > #task-field-completed_nothing"),

    /**
     * Поле для подсчета
     */
    DOM_FIELD_ACTUAL: document.querySelector("#task-field"),
    DOM_FIELD_COMPLETED: document.querySelector("#task-field-completed"),
    
    /**
     * 
     * @param {Boolean} scroll_status Установление значения как "true", когда вам нужно перейти к нижней странице
     */
    _updateView: function (scroll_status = true) {
        if (this.count()) {
            p_nothing.style.display = "none";
            document.title = `(${this.count()} task${this.count() === 1 ? '' : 's'}) - ToDo Manager`;
        } else {
            p_nothing.style.display = "inherit";
            document.title = `ToDo Manager`;
        }

        if (this.countCompleted()) {
            p_completed_nothing.style.display = "none";
        } else {
            p_completed_nothing.style.display = "inherit";
        }
        document.querySelector("#h2-actual_tasks").innerText = `Actual tasks (${this.count()})`;
        document.querySelector("#h2-completed_tasks").innerText = `Completed tasks (${this.countCompleted()})`;
        if (scroll_status) window.scrollTo(0, document.body.scrollHeight);
    },

    /**
     * Получение всех актуальных задач
     * @returns Array
     */
    _getActualTasks: function () {
        return new Array(...document.querySelectorAll("#task-field > div.taskelem"));
    },

    /**
     * Получение всех выполненных задач
     * @returns Array
     */
    _getCompletedTasks: function () {
        return new Array(...document.querySelectorAll("#task-field-completed > div.taskelem"));
    },

    /**
     * Возвращает все задачи в виде элементов DOM
     * @returns NodeListOf<Element>
     */
    getChilds: function () {
        return document.querySelectorAll("div.taskelem");
    },

    /**
     * Возвращает количество актуальных задач
     * @returns Number
     */
    count: function () {
        return this.DOM_FIELD_ACTUAL.childElementCount - 1;
    },

    /**
     * Возвращает количество выполненных задач
     * @returns Number
     */
    countCompleted: function () {
        return this.DOM_FIELD_COMPLETED.childElementCount - 1;
    },


    /**
     * Удалить задачу из поля и `localStorage` по ее идентификатору
     * @param {Number} task_id task's id
     */
    rm: function (task_id) {
        let task = document.querySelector(`div.taskelem[data-task_id="${task_id}"]`);

        if (task) {
            task.remove();
            localStorage.removeItem(task_id);
    
            this._updateView(false);
        }
    },

    /**
     * Заполняет список задач из "localStorage"
     */
    fill: function () {
        if (Object.keys(localStorage).length) {

            for (const id of Object.keys(localStorage).sort()) {
                this.draw(localStorage.getItem(id), id, id > 0 ? this.DOM : this.DOM_COMPLETED);
            }
        }
    },

    /**
     * Отображает задачу в списке задач
     * @param {String} task_text 
     * @param {Number} task_id 
     * @param {Element} DOM_field 
     */
    draw: function (task_text, task_id, DOM_field) {
        let TASK_ID = task_id || new Date().getTime();

        let div_keyboard = document.createElement("div");
        div_keyboard.classList = "task-keyboard neu"

        if (DOM_field === TaskField.DOM) {
            let kb_complete = document.createElement("button");
            kb_complete.classList = "m0 keyboard_complete kbbutton";
            kb_complete.innerText = "✔";
            // kb_complete.style.margin = "20px 5px";
            kb_complete.addEventListener("click", () => this.complete(TASK_ID));
            div_keyboard.appendChild(kb_complete);
        }

        let kb_delete = document.createElement("button");
        kb_delete.classList = "m0 keyboard_delete kbbutton";
        kb_delete.innerText = "✖";
        // kb_delete.style.margin = "20px 5px";
        kb_delete.addEventListener("click", () => this.rm(TASK_ID));
        div_keyboard.appendChild(kb_delete);

        let div_text = document.createElement("div");
        div_text.classList = "task-text";
        div_text.innerText = task_text;

        let div = document.createElement("div");
        div.setAttribute("data-task_id", TASK_ID);
        div.classList = "neu taskelem";
        div.innerHTML = `<p class="task-created_at" style="color: grey;">⏱ ${new Date(new Number(Math.abs(TASK_ID))).toLocaleDateString()} - ${new Date(new Number(Math.abs(TASK_ID))).toLocaleTimeString()}</p>`

        if (DOM_field === TaskField.DOM_COMPLETED) {
            div.classList.add("line-through");
        }

        div.appendChild(div_text);
        div.appendChild(div_keyboard);

        div.addEventListener("dblclick", () => {
            if (TASK_ID > 0) {
                this.complete(TASK_ID);
            } else {
                this.rm(TASK_ID);
            }
        });

        div.addEventListener("mouseover", () => {
            div_keyboard.classList.add("show");
            div_text.classList.add("show");
        });

        div.addEventListener("mouseleave", () => {
            div_keyboard.classList.remove("show");
            div_text.classList.remove("show");
        });

        if (DOM_field === this.DOM) {
            DOM_field.after(div);
        } else if (DOM_field === this.DOM_COMPLETED) {
            DOM_field.before(div);
        }
        this._updateView(false);

        return TASK_ID;
    },

    /**
     * Сохранение задачи в локальном хранилище и отрисовка ее на поле
     * @param {Number} task_id ID задачи
     * @param {String} task_text Текст задачи
     * @param {Element} DOM_field Поле, в котором необходимо разместить задачу
     */
    saveToLocalStorage: function (task_id, task_text, DOM_field) {
        localStorage.setItem(this.draw(task_text, task_id, DOM_field), task_text);
    },

    /**
     * Получение номера "первого" задания из фактического или завершенного
     * @returns Номер "первой" задачи из фактических или завершенных 
     */
    getFirstTaskId: function () {
        if (TaskField._getActualTasks().length) {
            return new Number((TaskField._getActualTasks().slice(0, 1)[0]).getAttribute("data-task_id"));
        } else {
            return new Number((TaskField._getCompletedTasks().slice(0, 1)[0]).getAttribute("data-task_id"));
        }
    },

    /**
     * Получение номера "последнего" задания из фактического или завершенного
     * @returns Номер "последней" задачи из фактических или завершенных
     */
    getLastTaskId: function () {
        if (TaskField._getCompletedTasks().length) {
            return new Number((TaskField._getCompletedTasks().slice(TaskField._getCompletedTasks().length - 1)[0]).getAttribute("data-task_id"));
        } else {
            return new Number((TaskField._getActualTasks().slice(TaskField._getActualTasks().length - 1)[0]).getAttribute("data-task_id"));
        }
    },

    /**
     * Удаление первой задачи
     */
    shift: function () {
        TaskField.rm(TaskField.getFirstTaskId());
    },
    
    /**
     * Удаление последней задачи
    */
   pop: function () {
        TaskField.rm(TaskField.getLastTaskId());
    },

    /**
     * Отметить задачу как выполненную
     * @param {Number} task_id ID задачи
     */
    complete: function (task_id) {
        let task_text = document.querySelector(`div.taskelem[data-task_id="${task_id}"] > div.task-text`);
        let task_kb_complete = document.querySelector(`div.taskelem[data-task_id="${task_id}"] > div.task-keyboard > button.keyboard_complete`);
        task_kb_complete.hidden = true;

        let completed_task_id = -task_id;
        this.rm(task_id);
        this.saveToLocalStorage(completed_task_id, task_text.innerText, this.DOM_COMPLETED);
    },

    /**
     * Создание задачи по тексту пользователя: сохранение ее в локальном хранилище и отрисовка в поле
     */
    addByUserInput: function () {
        if (userinput.value && userinput.value.length <= MAX_LENGTH) {
            TaskField.saveToLocalStorage(new Date().getTime(), userinput.value, TaskField.DOM);
            userinput.value = new String();
        } else {
            alert(`You can't save empty task or your task has more than ${MAX_LENGTH} symbols`);
            userinput.value = new String();
        }
    },

    /**
     * Метод чтобы отмечать только четные задачи
     */
    markOnlyEven: function () {
        let i = 0;
        TaskField.getChilds().forEach(el => {
            el.classList.remove("selection");
            if (i % 2 === 0) el.classList.add("selection");
            i++;
        });
    },

    /**
     * Метод чтобы отмечать только нечетные задачи
     */
    markOnlyOdd: function () {
        let i = 0;
        TaskField.getChilds().forEach(el => {
            el.classList.remove("selection");
            if (i % 2 != 0) el.classList.add("selection");
            i++;
        });
    },

    /**
     * Метод для снятия пометок с задач
     */
    unmarkSelection: function () {
        TaskField.getChilds().forEach(el => {
            el.classList.remove("selection");
        });
    }
}



TaskField.fill();
TaskField._updateView();

window.onload = () => {
    document.querySelector("#button-addtolist").addEventListener("click", TaskField.addByUserInput);
    document.querySelector("#kbmain-shift").addEventListener("click", TaskField.shift);
    document.querySelector("#kbmain-pop").addEventListener("click", TaskField.pop);
    document.querySelector("#kbmain-show-even").addEventListener("click", TaskField.markOnlyEven);
    document.querySelector("#kbmain-show-odd").addEventListener("click", TaskField.markOnlyOdd);

    document.querySelector("#kb-manage_fields").addEventListener("mouseleave", TaskField.unmarkSelection);
}

userinput.addEventListener("keydown", (e) => {
    if (e.keyCode === 13) TaskField.addByUserInput();
})