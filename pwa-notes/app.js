const notesKey = 'notes';
const input = document.getElementById('note-input');
const addBtn = document.getElementById('add-note');
const list = document.getElementById('notes-list');
const status = document.getElementById('status');
const offlineMessage = document.getElementById('offlineMessage');
const installBtn = document.getElementById('installBtn'); // Кнопка для установки

let deferredPrompt;

function loadNotes() {
    const notes = JSON.parse(localStorage.getItem(notesKey)) || [];
    list.innerHTML = '';
    notes.forEach((note, index) => {
        const li = document.createElement('li');
        li.textContent = note;
        const del = document.createElement('button');
        del.textContent = 'Удалить';
        del.onclick = () => {
            notes.splice(index, 1);
            localStorage.setItem(notesKey, JSON.stringify(notes));
            loadNotes();
        };
        li.appendChild(del);
        list.appendChild(li);
    });
}

function updateStatus() {
    const isOnline = navigator.onLine;
    status.textContent = isOnline ? '🟢 Онлайн' : '🔴 Офлайн';
    offlineMessage.style.display = isOnline ? 'none' : 'block';
}

addBtn.onclick = () => {
    const note = input.value.trim();
    if (note) {
        const notes = JSON.parse(localStorage.getItem(notesKey)) || [];
        notes.push(note);
        localStorage.setItem(notesKey, JSON.stringify(notes));
        input.value = '';
        loadNotes();
    }
};

window.addEventListener('load', () => {
    loadNotes();

    // Регистрация Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('SW зарегистрирован:', reg.scope))
            .catch(err => console.error('Ошибка SW:', err));
    }

    // Инициализация состояния подключения
    updateStatus();
});

// Обработка подключения и отключения от сети
window.addEventListener('online', updateStatus);
window.addEventListener('offline', updateStatus);

// Обработка события установки PWA
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'block'; // Показываем кнопку установки

    installBtn.addEventListener('click', () => {
        installBtn.style.display = 'none'; // Скрыть кнопку после нажатия
        deferredPrompt.prompt(); // Запросить установку PWA
        deferredPrompt.userChoice.then(choice => {
            if (choice.outcome === 'accepted') {
                console.log('PWA установлена');
            } else {
                console.log('Установку отменили');
            }
            deferredPrompt = null;
        });
    });
});
