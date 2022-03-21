import { getItem } from "../common/storage.js";
import { generateWeekRange } from "../common/time.utils.js";
import { openModal } from "../common/modal.js";

const daysOfWeek = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export const renderHeader = () => {
  // на основе displayedWeekStart из storage с помощью generateWeekRange сформируйте массив дней текущей недели
  // на основе полученного массива сформируйте разметку в виде строки - 7 дней (день недели и число в месяце)
  // полученную разметку вставить на страницу с помощью innerHTML в .calendar__header
  // в дата атрибуте каждой ячейки должно хранить для какого часа эта ячейка

  const weekRange = generateWeekRange(getItem("displayedWeekStart"));
  let weekHtml = "";

  const todayDate = moment();

  weekRange.forEach((day) => {
    let dayClasses = "calendar__day-label day-label";

    dayClasses +=
      moment(day).format("DD.MM.YYYY") < todayDate.format("DD.MM.YYYY")
        ? " calendar__day-prev"
        : moment(day).format("DD.MM.YYYY") > todayDate.format("DD.MM.YYYY")
        ? " calendar__day-next"
        : " calendar__day-active";

    weekHtml += `<div class="${dayClasses}">
      <span class="day-label__day-name">${daysOfWeek[day.getDay()]}</span>
      <span class="day-label__day-number">${day.getDate()}</span>
    </div>`;
  });

  const calendarHeader = document.querySelector(".calendar__header");
  calendarHeader.innerHTML = weekHtml;
};

// при клике на кнопку "Create" открыть модальное окно с формой для создания события
// назначьте здесь обработчик

const createEventBtn = document.querySelector(".create-event-btn");
createEventBtn.addEventListener("click", openModal);
