const get = (target) => {
    return document.querySelector(target);
}

const getAll = (target) => {
    return document.querySelectorAll(target);
}

const API_URL = `http://localhost:3000/todos`;
const $todos = get('.todos');
const $todoInput = get('.todo_input');
const $todoAddSubmit = get('.todo_submit_button');
const $todoDeletSubmit = get('.todo_sel_delete_button');
const $pagination = get('.pagination');
const $form = get('.todo_form');

let currentPage = 1;
const limit = 5;
const pageCount = 5;
const totalCount = 53;

const pagination = () => {
    let totalPage = Math.ceil(totalCount / limit);
    let pageGroup = Math.ceil(currentPage / pageCount);
    let lastNumber = pageGroup * pageCount;
    if (lastNumber > totalPage) {
        lastNumber = totalPage;
    }
    let firstNumber = lastNumber - (pageCount - 1);

    const next = lastNumber + 1;
    const prev = firstNumber - 1;

    let html = '';

    if (prev > 0) {
        html += "<button class='prev'data-fn='prev'>이전</button>";
    }

    for (let i = firstNumber; i <= lastNumber; i++) {
        html += `<button class='pageNumber' id="page_${i}">${i}</button>`;
    }
    if (lastNumber < totalPage) {
        html += `<button class='next' data-fn='next'>다음</button>`;
    }

    $pagination.innerHTML = html;
    const $currentPageNumber = get(`.pageNumber#page_${currentPage}`);
    $currentPageNumber.style.background = "#f5df4d";

    const $currentPageNumbers = getAll(`.pagination button`);
    $currentPageNumbers.forEach((btn) => {
        btn.addEventListener('click', () => {
            if (btn.dataset.fn === 'prev') {
                currentPage = prev;
            } else if (btn.dataset.fn === 'next') {
                currentPage = next;
            } else {
                currentPage = btn.innerText;
            }
            pagination();
            getTodos();
        })
    })
}

const createItems = (item) => {
    const { id, content, completed } = item;
    const isChecked = completed ? 'checked' : '';
    const $todoItem = document.createElement('div');
    $todoItem.classList.add('item');
    $todoItem.dataset.id = id;
    $todoItem.innerHTML = `
        <div class="content">
            <input type="checkbox" class="todo_checkbox" ${isChecked}/>
            <label>${content}</label>
            <input type="text" value="${content}"/>
        </div>
        <div class="item_buttons content_buttons">
            <button class="todo_edit_button">
                <i class="far fa-edit"></i>
            </button>
            <button class="todo_remove_button">
                <i class="far fa-trash-alt"></i>
            </button>
        </div>
        <div class="item_buttons edit_buttons">
            <button class="todo_edit_confirm_button">
                <i class="fas fa-check"></i>
            </button>
            <button class="todo_edit_cancel_button">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `
    return $todoItem;

}

const getTodos = () => {
    fetch(`${API_URL}?_page=${currentPage}&_limit=${limit}`)
        .then((response) => response.json())
        .then((todos) => {
            renderAllTodos(todos);
        })
        .catch((error) => console.error(error))
}

const addTodo = (e) => {
    e.preventDefault();
    const content = $todoInput.value;
    if (!content) return;
    const todo = {
        content: content,
        completed: false,
    }
    fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(todo),
    })
        .then((response) => response.json())
        .then(getTodos)
        .then(() => {
            $todoInput.value = '';
            $todoInput.focus();
        })
}

const toggleTodo = (e) => {
    e.preventDefault();
    if (e.target.className !== 'todo_checkbox') return;

    const $item = e.target.closest('.item');
    const id = $item.dataset.id;
    const completed = e.target.checked;
    fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ completed }),
    })
        .then((response) => response.json())
        .then(getTodos)
        .catch((error) => console.error(error))
}

const changeEditMode = (e) => {
    const $item = e.target.closest('.item');
    const $label = $item.querySelector('label');
    const $editInput = $item.querySelector('input[type="text"]');
    const $contentButtons = $item.querySelector('.content_buttons');
    const $editButtons = $item.querySelector('.edit_buttons');
    const value = $editInput.value;

    if (e.target.className === 'todo_edit_button') {
        $label.style.display = 'none';
        $editInput.style.display = 'block';
        $contentButtons.style.display = 'none';
        $editButtons.style.display = 'block';
        $editInput.focus();
        $editInput.value = '';
        $editInput.value = value;
    }

    if (e.target.className == 'todo_edit_cancel_button') {
        $label.style.display = 'block';
        $editInput.style.display = 'none';
        $contentButtons.style.display = 'block';
        $editButtons.style.display = 'none';
        $editInput.value = $label.innerText;
    }
}

const editTodo = (e) => {
    if (e.target.className !== 'todo_edit_confirm_button') return
    const $item = e.target.closest('.item');
    const id = $item.dataset.id;
    const $editInput = $item.querySelector('input[type="text"]');
    const content = $editInput.value;

    fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ content }),
    })
        .then((response) => response.json())
        .then(getTodos)
        .catch((error) => console.error(error))
}

const removeTodo = (e) => {
    if (e.target.className !== 'todo_remove_button') return;
    const $item = e.target.closest('.item');
    const id = $item.dataset.id;
    fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
    })
        .then((response) => response.json())
        .then(getTodos)
        .catch((error) => console.error(error));
}

const renderAllTodos = (todos) => {
    $todos.innerHTML = '';
    todos.forEach((item) => {
        const todoElement = createItems(item);
        $todos.appendChild(todoElement);
    })
}

const init = () => {
    window.addEventListener('DOMContentLoaded', () => {
        getTodos();
        pagination();
    })

    $todoAddSubmit.addEventListener('click', addTodo);
    // $form.addEventListener('submit', addTodo);
    $todos.addEventListener('click', toggleTodo);
    $todos.addEventListener('click', changeEditMode);
    $todos.addEventListener('click', editTodo);
    $todos.addEventListener('click', removeTodo);
}

init();