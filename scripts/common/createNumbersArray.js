export const createNumbersArray = (from, to) => {
  // ф-ция должна генерировать массив чисел от from до to
  const numbersArray = [];

  for (let i = from; i <= to; i += 1) {
    numbersArray.push(i);
  }

  return numbersArray;
};
