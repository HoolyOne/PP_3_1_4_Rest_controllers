// Функция для чтения cookie по имени
function getCookie(name) {
    const matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 1. Загрузка данных пользователя
        const userResponse = await fetch('/api/users/current', {
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        });

        // 2. Загрузка названий ролей
        const rolesResponse = await fetch('/api/users/current/roles', {
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        });

        // Проверка ошибок
        if (!userResponse.ok || !rolesResponse.ok) {
            if (userResponse.status === 401) {
                window.location.href = '/login';
                return;
            }
            throw new Error(`HTTP error! status: ${userResponse.status}`);
        }

        const user = await userResponse.json();
        const roleNames = await rolesResponse.json();

        // 3. Заполнение шапки
        document.getElementById('currentUserEmail').textContent = user.email;
        document.getElementById('currentUserRoles').textContent = roleNames.length
            ? `with roles: ${roleNames.join(', ')}`
            : '';

        // 4. Заполнение таблицы
        document.getElementById('userId').textContent = user.id;
        document.getElementById('userName').textContent = user.name;
        document.getElementById('userSurname').textContent = user.surname;
        document.getElementById('userAge').textContent = user.age;
        document.getElementById('userEmail').textContent = user.email;
        document.getElementById('userRoles').textContent = roleNames.join(', ');

        // 5. Ссылка на админку
        const adminLink = document.getElementById('adminLink');
        if (adminLink) {
            adminLink.style.display = roleNames.includes('ADMIN') ? 'block' : 'none';
        }

        // 6. Обработка выхода
        document.getElementById('logoutForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const csrfToken = getCookie('XSRF-TOKEN');
            try {
                const response = await fetch('/logout', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'X-XSRF-TOKEN': csrfToken,
                        'Content-Type': 'application/json'
                    }
                });
                if (response.ok) {
                    window.location.href = '/login';
                } else {
                    alert('Ошибка выхода из системы');
                }
            } catch (error) {
                console.error('Logout failed:', error);
                alert('Ошибка выхода из системы');
            }
        });

    } catch (error) {
        console.error('Error:', error);
        window.location.href = '/login';
    }
});
