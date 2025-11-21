'use strict';

const state = {
  users: []
};

const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' rx='22' fill='%230f172a'/%3E%3Ccircle cx='60' cy='42' r='24' fill='%237c3aed' fill-opacity='0.65'/%3E%3Cpath d='M24 104c8-22 64-22 72 0' fill='%2312335a'/%3E%3C/svg%3E";

const userList = document.getElementById('user-list');

function fetchUsers() {
  return fetch('data/users.json').then(response => {
    if (!response.ok) {
      throw new Error('Не удалось загрузить данные пользователей');
    }
    return response.json();
  });
}

function createUserCard(user) {
  const card = document.createElement('article');
  card.className = 'user-card';
  card.dataset.userId = user.id;

  const photoWrapper = document.createElement('div');
  photoWrapper.className = 'user-card__photo';

  const image = document.createElement('img');
  image.className = 'user-card__image';
  image.src = placeholderImage;
  image.alt = `Фото ${user.firstName} ${user.lastName}`;
  photoWrapper.append(image);

  const body = document.createElement('div');
  body.className = 'user-card__body';

  const name = document.createElement('h2');
  name.className = 'user-card__name';
  name.textContent = `${user.firstName} ${user.lastName}`;

  const meta = document.createElement('div');
  meta.className = 'user-card__meta';

  const age = document.createElement('span');
  age.textContent = `${user.age} лет`;

  const email = document.createElement('p');
  email.className = 'user-card__email';
  email.textContent = user.email;

  meta.append(age);
  body.append(name, meta, email);
  card.append(photoWrapper, body);
  return card;
}

function renderUsers(list) {
  userList.innerHTML = '';
  if (!list.length) {
    const empty = document.createElement('p');
    empty.className = 'users__empty';
    empty.textContent = 'Нет пользователей для отображения';
    userList.append(empty);
    return;
  }
  list.forEach(user => {
    const card = createUserCard(user);
    userList.append(card);
  });
}

function init() {
  fetchUsers()
    .then(users => {
      state.users = users;
      renderUsers(state.users);
    })
    .catch(() => {
      renderUsers([]);
    });
}

document.addEventListener('DOMContentLoaded', init);
