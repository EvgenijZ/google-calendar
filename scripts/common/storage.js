let storage = {
  // хранит дату понедельника той отображаемой недели
  displayedWeekStart: null
};

export const setItem = (key, value) => {
  // ф-ция должна устанавливать значения в объект storage
  storage[key] = value;
};

export const getItem = (key) => {
  // ф-ция должна возвращать по ключу значения из объекта storage
  return storage[key];
};