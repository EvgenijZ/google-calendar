import { getItem, setItem } from "../common/storage.js";
import { generateWeekRange } from "../common/time.utils.js";
import { renderEvents } from "../events/events.js";
import { createNumbersArray } from "../common/createNumbersArray.js";
import { openModal } from "../common/modal.js";

const generateDay = () => {
  // функция должна сгенерировать и вернуть разметку дня в виде строки
  // разметка состоит из 24 часовых временных слотов (.calendar__time-slot)

  let calendarTimeSlots = "";
  const numbersArray = createNumbersArray(1, 24);

  numbersArray.forEach((_, index) => {
    const calendarTimeSlot = document.createElement("div");
    calendarTimeSlot.className = "calendar__time-slot";
    calendarTimeSlot.dataset.time = index;

    calendarTimeSlots += calendarTimeSlot.outerHTML;
  });

  return calendarTimeSlots;
};

export const renderWeek = () => {
  // функция должна сгенерировать разметку недели в виде строки и вставить ее на страницу (в .calendar__week)
  // разметка недели состоит из 7 дней (.calendar__day) отображаемой недели
  // массив дней, которые нужно отобразить, считаем ф-цией generateWeekRange на основе displayedWeekStart из storage
  // каждый день должен содержать в дата атрибуте порядковый номер дня в месяце
  // после того, как отрисовали всю сетку для отображаемой недели, нужно отобразить события этой недели с помощью renderEvents

  const weekRange = generateWeekRange(getItem("displayedWeekStart"));
  const currentDay = new Date().getDate();

  const calendarWeek = document.querySelector(".calendar__week");
  calendarWeek.innerHTML = generateWeekRange(
    getItem("displayedWeekStart")
  ).reduce((prev, acc, index) => {
    const calendarDay = document.createElement("div");
    calendarDay.className = "calendar__day";
    calendarDay.dataset.day = weekRange[index].getDate();

    if (weekRange[index].getDate() == currentDay)
      calendarDay.dataset.currentDay = true;

    calendarDay.innerHTML = generateDay();
    return (prev += calendarDay.outerHTML);
  }, "");

  renderTimeLine();
  renderEvents();
};

const renderTimeLine = () => {
  const currentTimeline = document.querySelector(".current-timeline");
  const currentDayColumn = document.querySelector(
    ".calendar__day[data-current-day]"
  );
  const currentMinutes = moment().diff(moment().startOf("day"), "minutes");
  if (currentTimeline) currentTimeline.remove();
  if (currentDayColumn)
    currentDayColumn.innerHTML =
      `<div class="current-timeline" style="top: ${
        currentMinutes - 1
      }px;"></div>` + currentDayColumn.innerHTML;

  setClickEventToSlot();
};

const setClickEventToSlot = () => {
  const calendarTimeSlots = document.querySelectorAll(".calendar__time-slot");
  [...calendarTimeSlots].map((slot) =>
    slot.addEventListener("click", (event) => {
      if (!slot.querySelector(".event")) {
        const slotDate = moment(getItem("displayedWeekStart"));
        slotDate.set(
          "date",
          event.target.closest(".calendar__day").dataset.day
        );
        slotDate.set("hour", event.target.dataset.time);

        switch (true) {
          case event.offsetY >= 45:
            slotDate.set("minutes", 45);
            break;

          case event.offsetY >= 30 && event.offsetY < 45:
            slotDate.set("minutes", 30);
            break;

          case event.offsetY >= 15 && event.offsetY < 30:
            slotDate.set("minutes", 15);
            break;

          default:
            slotDate.set("minutes", "00");
            break;
        }

        setItem("slotDate", slotDate.format("YYYY-MM-DD HH:mm"));
        openModal();
      } else {
        const eventObj = getItem("events").find(
          ({ id }) => id === +event.target.dataset.eventId
        );
        if (eventObj) {
          setItem("slotDate", eventObj.start);
          setItem("currentEventId", eventObj.id);
        }
      }
    })
  );
};

const setPastEvents = () => {
  const events = getItem("events");
  events.forEach((event) => {
    if (moment(event.end) < moment()) {
      document
        .querySelector(`.event[data-event-id="${event.id}"]`)
        .classList.add("event__past");
    }
  });
};

setInterval(() => {
  if (new Date().getSeconds() == 0) {
    renderTimeLine();
    setPastEvents();
  }
}, 1000);
