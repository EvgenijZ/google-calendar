import { createNumbersArray } from "../common/createNumbersArray.js";

export const renderTimescale = () => {
  // ф-ция должна генерировать разметку для боковой шкалы времени (24 часа)
  // полученную разметку вставьте на страницу с помощью innerHTML в .calendar__time-scale

  const calendarTimeScale = document.querySelector(".calendar__time-scale");

  createNumbersArray(1, 23).map((number) => {
    calendarTimeScale.innerHTML += `<div class="time-slot"><span class="time-slot-time">${new Date(
      0,
      0,
      0,
      number
    ).toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })}</span></div>`;
  });
};
