'use strict';

const storageKey = 'user-photos';

const state = {
  users: [],
  filterAdults: false,
  sortName: 'name-asc',
  sortAge: 'age-asc',
  sortPrimary: 'name',
  photos: {}
};

const text = {
  error: 'Не удалось загрузить данные пользователей',
  empty: 'Нет пользователей для отображения',
  age: 'лет',
  photo: 'Фото',
  upload: 'Загрузить фото'
};

const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' rx='22' fill='%230f172a'/%3E%3Ccircle cx='60' cy='42' r='24' fill='%237c3aed' fill-opacity='0.65'/%3E%3Cpath d='M24 104c8-22 64-22 72 0' fill='%2312335a'/%3E%3C/svg%3E";

const userList = document.getElementById('user-list');
const filterToggle = document.getElementById('filter-age');
const sortNameSelect = document.getElementById('sort-name');
const sortAgeSelect = document.getElementById('sort-age');

function loadStoredPhotos() {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
}

function persistPhotos() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state.photos));
  } catch (error) {
  }
}

function fetchUsers() {
  return fetch('data/users.json').then(response => {
    if (!response.ok) {
      throw new Error(text.error);
    }
    return response.json();
  });
}

function createUploadControl(userId) {
  const upload = document.createElement('label');
  upload.className = 'user-card__upload';
  upload.textContent = text.upload;
  const input = document.createElement('input');
  input.className = 'user-card__file';
  input.type = 'file';
  input.accept = 'image/*';
  input.dataset.userId = userId;
  upload.append(input);
  return upload;
}

function createUserCard(user) {
  const card = document.createElement('article');
  card.className = 'user-card';
  card.dataset.userId = user.id;

  const photoWrapper = document.createElement('div');
  photoWrapper.className = 'user-card__photo';

  const image = document.createElement('img');
  image.className = 'user-card__image';
  image.src = state.photos[user.id] || placeholderImage;
  image.alt = `${text.photo} ${user.firstName} ${user.lastName}`;
  photoWrapper.append(image);

  const body = document.createElement('div');
  body.className = 'user-card__body';

  const name = document.createElement('h2');
  name.className = 'user-card__name';
  name.textContent = `${user.firstName} ${user.lastName}`;

  const meta = document.createElement('div');
  meta.className = 'user-card__meta';

  const age = document.createElement('span');
  age.textContent = `${user.age} ${text.age}`;

  const email = document.createElement('p');
  email.className = 'user-card__email';
  email.textContent = user.email;

  meta.append(age);
  body.append(name, meta, email);

  const actions = document.createElement('div');
  actions.className = 'user-card__actions';
  actions.append(createUploadControl(user.id));

  card.append(photoWrapper, body, actions);
  return card;
}

function renderUsers(list) {
  userList.innerHTML = '';
  if (!list.length) {
    const empty = document.createElement('p');
    empty.className = 'users__empty';
    empty.textContent = text.empty;
    userList.append(empty);
    return;
  }
  list.forEach(user => {
    const card = createUserCard(user);
    userList.append(card);
  });
}

function getFilteredUsers() {
  if (!state.filterAdults) {
    return [...state.users];
  }
  return state.users.filter(user => user.age > 18);
}

function compareName(a, b) {
  const nameA = `${a.lastName} ${a.firstName}`;
  const nameB = `${b.lastName} ${b.firstName}`;
  const direction = state.sortName === 'name-desc' ? -1 : 1;
  return nameA.localeCompare(nameB, 'ru', { sensitivity: 'base' }) * direction;
}

function compareAge(a, b) {
  const direction = state.sortAge === 'age-desc' ? -1 : 1;
  return (a.age - b.age) * direction;
}

function sortUsers(list) {
  const compare = (a, b) => {
    const nameResult = compareName(a, b);
    const ageResult = compareAge(a, b);
    if (state.sortPrimary === 'age') {
      return ageResult || nameResult;
    }
    return nameResult || ageResult;
  };
  return [...list].sort(compare);
}

function getPreparedUsers() {
  const filtered = getFilteredUsers();
  return sortUsers(filtered);
}

function render() {
  const nextList = getPreparedUsers();
  renderUsers(nextList);
}

function handleFilterChange(event) {
  state.filterAdults = event.target.checked;
  render();
}

function handleSortChange(event) {
  if (event.target === sortNameSelect) {
    state.sortName = event.target.value;
    state.sortPrimary = 'name';
  } else if (event.target === sortAgeSelect) {
    state.sortAge = event.target.value;
    state.sortPrimary = 'age';
  }
  render();
}

function handlePhotoChange(event) {
  const input = event.target;
  if (!input.classList.contains('user-card__file')) {
    return;
  }
  if (!input.files || !input.files.length) {
    return;
  }
  const userId = input.dataset.userId;
  const reader = new FileReader();
  reader.onload = () => {
    state.photos[userId] = reader.result;
    persistPhotos();
    const card = input.closest('.user-card');
    const image = card ? card.querySelector('.user-card__image') : null;
    if (image) {
      image.src = reader.result;
    }
    input.value = '';
  };
  reader.readAsDataURL(input.files[0]);
}

function init() {
  state.photos = loadStoredPhotos();
  filterToggle.addEventListener('change', handleFilterChange);
  sortNameSelect.addEventListener('change', handleSortChange);
  sortAgeSelect.addEventListener('change', handleSortChange);
  userList.addEventListener('change', handlePhotoChange);
  fetchUsers()
    .then(users => {
      state.users = users;
      render();
    })
    .catch(() => {
      renderUsers([]);
    });
}

document.addEventListener('DOMContentLoaded', init);
