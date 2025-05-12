axios.defaults.withCredentials = true;
let users = [];
let roles = [];
let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
    await loadCurrentUser();
    await loadRoles();
    await loadUsers();
    renderTable();
    renderRolesSelects();
    setupEventListeners();
});

async function loadCurrentUser() {
    try {
        const response = await axios.get('/api/users/current');
        currentUser = response.data;
        document.getElementById('currentUserEmail').textContent = currentUser.email;
        document.getElementById('currentUserRoles').textContent = 'with roles: ' +
            currentUser.roles.map(r => r.name.replace('ROLE_', '')).join(', ');
    } catch (e) {
        document.getElementById('currentUserEmail').textContent = 'Unknown';
    }
}

async function loadRoles() {
    const response = await axios.get('/api/admin/roles');
    roles = response.data;
}

async function loadUsers() {
    const response = await axios.get('/api/admin/users');
    users = response.data;
}

function renderTable() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';
    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.surname}</td>
            <td>${user.age}</td>
            <td>${user.email}</td>
            <td>${user.roles.map(r => r.name.replace('ROLE_', '')).join(', ')}</td>
            <td>
                <button class="btn btn-edit btn-sm" data-id="${user.id}" data-bs-toggle="modal" data-bs-target="#editUserModal">Edit</button>
            </td>
            <td>
                <button class="btn btn-delete btn-sm" data-id="${user.id}" data-bs-toggle="modal" data-bs-target="#deleteUserModal">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderRolesSelects() {
    ['add-roles', 'edit-roles', 'delete-roles'].forEach(selectId => {
        const select = document.getElementById(selectId);
        if (!select) return;
        select.innerHTML = '';
        roles.forEach(role => {
            const opt = document.createElement('option');
            opt.value = role.id;
            opt.textContent = role.name.replace('ROLE_', '');
            select.appendChild(opt);
        });
    });
}

function setSelectedRoles(selectId, userRoles) {
    const select = document.getElementById(selectId);
    const roleIds = userRoles.map(r => r.id);
    Array.from(select.options).forEach(opt => {
        opt.selected = roleIds.includes(Number(opt.value));
    });
}

function getCookie(name) {
    const matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

async function logout() {
    const csrfToken = getCookie('XSRF-TOKEN');
    try {
        const response = await fetch('/logout', {
            method: 'POST',
            headers: {
                'X-XSRF-TOKEN': csrfToken,
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        if (response.ok) {
            window.location.href = '/login';
        } else {
            alert('Ошибка выхода из системы');
        }
    } catch (error) {
        console.error('Ошибка при logout:', error);
        alert('Ошибка выхода из системы');
    }
}

function setupEventListeners() {
    document.getElementById('addUserForm').onsubmit = async function (e) {
        e.preventDefault();
        const form = e.target;
        const data = {
            name: form.name.value,
            surname: form.surname.value,
            age: form.age.value,
            email: form.email.value,
            password: form.password.value,
            roles: Array.from(form.roles.selectedOptions).map(o => ({id: Number(o.value)}))
        };
        await axios.post('/api/admin/users', data);
        await loadUsers();
        renderTable();
        form.reset();
        bootstrap.Modal.getOrCreateInstance(document.getElementById('addUserModal')).hide();
    };

    document.getElementById('usersTableBody').addEventListener('click', async function (e) {
        if (e.target.classList.contains('btn-edit')) {
            const userId = e.target.getAttribute('data-id');
            const user = users.find(u => u.id == userId);
            if (!user) return;
            document.getElementById('edit-id').value = user.id;
            document.getElementById('edit-name').value = user.name;
            document.getElementById('edit-surname').value = user.surname;
            document.getElementById('edit-age').value = user.age;
            document.getElementById('edit-email').value = user.email;
            document.getElementById('edit-password').value = '';
            setSelectedRoles('edit-roles', user.roles);
        }
        if (e.target.classList.contains('btn-delete')) {
            const userId = e.target.getAttribute('data-id');
            const user = users.find(u => u.id == userId);
            if (!user) return;
            document.getElementById('delete-id').value = user.id;
            document.getElementById('delete-name').value = user.name;
            document.getElementById('delete-surname').value = user.surname;
            document.getElementById('delete-email').value = user.email;
            setSelectedRoles('delete-roles', user.roles);
        }
    });

    document.getElementById('editUserForm').onsubmit = async function (e) {
        e.preventDefault();
        const form = e.target;
        const id = form.id.value;
        const data = {
            id: id,
            name: form.name.value,
            surname: form.surname.value,
            age: form.age.value,
            email: form.email.value,
            password: form.password.value,
            roles: Array.from(form.roles.selectedOptions).map(o => ({id: Number(o.value)}))
        };
        await axios.put(`/api/admin/users/${id}`, data);
        await loadUsers();
        renderTable();
        bootstrap.Modal.getOrCreateInstance(document.getElementById('editUserModal')).hide();
    };

    document.getElementById('deleteUserForm').onsubmit = async function (e) {
        e.preventDefault();
        const id = document.getElementById('delete-id').value;
        await axios.delete(`/api/admin/users/${id}`);
        await loadUsers();
        renderTable();
        bootstrap.Modal.getOrCreateInstance(document.getElementById('deleteUserModal')).hide();
    };

    // Новый обработчик logout через кнопку с id 'logoutButton'
    const logoutBtn = document.getElementById('logoutButton');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
}