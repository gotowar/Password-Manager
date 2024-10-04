document.addEventListener('DOMContentLoaded', () => {
    loadPasswords();

    // Toggle password visibility
    const togglePassword = document.getElementById('togglePassword');
    togglePassword.addEventListener('change', function() {
        const passwordInput = document.getElementById('password');
        if (togglePassword.checked) {
            passwordInput.type = 'text';
        } else {
            passwordInput.type = 'password';
        }
    });
});

document.getElementById('password-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const account = document.getElementById('account').value;
    const password = document.getElementById('password').value;

    const passwordEntry = { username, account, password };
    savePassword(passwordEntry);
    displayPassword(passwordEntry);

    // Clear the input fields
    document.getElementById('username').value = '';
    document.getElementById('account').value = '';
    document.getElementById('password').value = '';
});

function savePassword(entry) {
    const passwords = JSON.parse(localStorage.getItem('passwords')) || [];
    passwords.push(entry);
    localStorage.setItem('passwords', JSON.stringify(passwords));
}

function loadPasswords() {
    const passwords = JSON.parse(localStorage.getItem('passwords')) || [];
    passwords.forEach(displayPassword);
}

function displayPassword(entry) {
    const passwordList = document.getElementById('password-list');
    const passwordEntry = document.createElement('div');
    passwordEntry.classList.add('password-entry');
    passwordEntry.setAttribute('draggable', 'true'); // Enable dragging
    passwordEntry.dataset.account = entry.account; // Store the account info for easy access

    passwordEntry.innerHTML = `
        <strong>${entry.account}</strong><br>
        ${entry.username}<br>
        ${entry.password}
        <div class="button-container">
            <button class="edit-btn" onclick="editPassword('${entry.account}', '${entry.username}', '${entry.password}')">Edit</button>
            <button class="delete-btn" onclick="deletePassword('${entry.account}', '${entry.username}')">Delete</button>
        </div>
    `;
    
    // Add drag and drop event listeners
    passwordEntry.addEventListener('dragstart', dragStart);
    passwordEntry.addEventListener('dragover', dragOver);
    passwordEntry.addEventListener('drop', drop);
    passwordEntry.addEventListener('dragleave', () => {
        passwordEntry.classList.remove('drag-over'); // Remove highlight on drag leave
    });

    passwordList.appendChild(passwordEntry);
}

function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.account);
    e.dataTransfer.effectAllowed = 'move';
}

function dragOver(e) {
    e.preventDefault(); // Allow dropping
    e.target.closest('.password-entry').classList.add('drag-over'); // Add class for visual feedback
}

function drop(e) {
    e.preventDefault();
    const targetEntry = e.target.closest('.password-entry');
    targetEntry.classList.remove('drag-over'); // Remove highlight on drop
    const draggedAccount = e.dataTransfer.getData('text/plain');
    const targetAccount = targetEntry?.dataset.account;

    if (targetAccount && draggedAccount !== targetAccount) {
        swapPasswords(draggedAccount, targetAccount);
    }
}

function swapPasswords(draggedAccount, targetAccount) {
    const passwords = JSON.parse(localStorage.getItem('passwords')) || [];
    const draggedIndex = passwords.findIndex(entry => entry.account === draggedAccount);
    const targetIndex = passwords.findIndex(entry => entry.account === targetAccount);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
        // Swap the entries
        const temp = passwords[draggedIndex];
        passwords[draggedIndex] = passwords[targetIndex];
        passwords[targetIndex] = temp;

        localStorage.setItem('passwords', JSON.stringify(passwords));

        // Refresh the displayed password list
        document.getElementById('password-list').innerHTML = '';
        passwords.forEach(displayPassword);
    }
}

function deletePassword(account, username) {
    const passwords = JSON.parse(localStorage.getItem('passwords')) || [];
    const updatedPasswords = passwords.filter(entry => 
        entry.account !== account || entry.username !== username
    );
    localStorage.setItem('passwords', JSON.stringify(updatedPasswords));

    // Refresh the displayed password list
    document.getElementById('password-list').innerHTML = '';
    updatedPasswords.forEach(displayPassword);
}

// Edit password function
function editPassword(account, username, password) {
    // Populate the form with the current password details
    document.getElementById('account').value = account;
    document.getElementById('username').value = username;
    document.getElementById('password').value = password;

    // Remove the old entry
    deletePassword(account, username);
}
