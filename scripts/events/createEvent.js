import { getItem, setItem } from "../common/storage.js";
import { renderEvents } from "./events.js";
import { closeModal } from "../common/modal.js";

const eventFormElem = document.querySelector(".event-form");
const closeEventFormBtn = document.querySelector(".create-event__close-btn");

function clearEventForm() {
  // ф-ция должна очистить поля формы от значений
  eventFormElem.reset();
  clearSlotDate();
}

function onCloseEventForm() {
  // здесь нужно закрыть модальное окно и очистить форму
  closeModal();
  clearEventForm();
}

const clearSlotDate = () => {
  setItem("slotDate", null);
};

const validateDataEvent = (obj) => {
  const start = moment(
    `${obj.date} ${obj.startTimeHours}:${obj.startTimeMinutes}`
  );
  const end = moment(`${obj.date} ${obj.endTimeHours}:${obj.endTimeMinutes}`);
  const errors = [];
  const events = getItem("events");
  const filteredEvents = [];

  events.forEach((event) => {
    checkStartObjBetween(event, start, filteredEvents);
    checkStartEventBetween(event, start, end, filteredEvents);
    checkEqualStart(event, start, filteredEvents);
    checkCurrentId(event, filteredEvents);
  });

  if (filteredEvents.length) {
    errors.push("Два события не могут пересекаться по времени");
  }

  if (start > end || start.unix() === end.unix()) {
    errors.push("Неккоретный диапазон события");
  }

  if (end.diff(start, "hours") > 6) {
    errors.push("Cобытие не может быть дольше 6 часов");
  }

  if (errors.length) {
    alert(JSON.stringify(errors.join(", ")));
    return false;
  }

  return true;
};

function onCreateEvent(event) {
  // задача этой ф-ции только добавить новое событие в массив событий, что хранится в storage
  // создавать или менять DOM элементы здесь не нужно. Этим займутся другие ф-ции
  // при подтверждении формы нужно считать данные с формы
  // с формы вы получите поля date, startTime, endTime, title, description
  // на основе полей date, startTime, endTime нужно посчитать дату начала и окончания события
  // date, startTime, endTime - строки. Вам нужно с помощью getDateTime из утилит посчитать start и end объекта события
  // полученное событие добавляем в массив событий, что хранится в storage
  // закрываем форму
  // и запускаем перерисовку событий с помощью renderEvents

  event.preventDefault();

  const formData = new FormData(eventFormElem);
  const formObj = Object.fromEntries(formData);
  const currentEventId = getItem("currentEventId");

  if (!validateDataEvent(formObj)) return;

  if (currentEventId) {
    const newEvents = getItem("events");
    const startTime = moment(
      `${formObj.date} ${formObj.startTimeHours}:${formObj.startTimeMinutes}`
    );
    const endTime = moment(
      `${formObj.date} ${formObj.endTimeHours}:${formObj.endTimeMinutes}`
    );

    newEvents.map((e) => {
      if (e.id === +currentEventId) {
        e.start = startTime.format("YYYY-MM-DD HH:mm");
        e.end = endTime.format("YYYY-MM-DD HH:mm");
        e.title = formObj.title;
        e.description = formObj.description;
      }
      return e;
    });

    setItem("events", newEvents);
  } else {
    const events = getItem("events");
    updateEventObj(formObj);
    events.push(formObj);
    setItem("events", []);
    setItem("events", events);
  }

  onCloseEventForm();
  renderEvents();
}

const updateEventObj = (formObj) => {
  const allowedObjFields = ["id", "title", "description", "start", "end"];

  formObj.id = Date.now();
  formObj.start = moment(
    `${formObj.date} ${formObj.startTimeHours}:${formObj.startTimeMinutes}`
  ).format("YYYY-MM-DD HH:mm");
  formObj.end = moment(
    `${formObj.date} ${formObj.endTimeHours}:${formObj.endTimeMinutes}`
  ).format("YYYY-MM-DD HH:mm");

  Object.keys(formObj).forEach((k) => {
    if (!allowedObjFields.includes(k)) delete formObj[k];
  });
};

const checkStartObjBetween = (a, start, filteredEvents) =>
  moment(start.format("YYYY-MM-DD HH:mm")).isBetween(
    moment(a.start).format("YYYY-MM-DD HH:mm"),
    moment(a.end).format("YYYY-MM-DD HH:mm")
  )
    ? filteredEvents.push(a)
    : false;

const checkStartEventBetween = (a, start, end, filteredEvents) =>
  moment(moment(a.start).format("YYYY-MM-DD HH:mm")).isBetween(
    start.format("YYYY-MM-DD HH:mm"),
    end.format("YYYY-MM-DD HH:mm")
  )
    ? filteredEvents.push(a, start, end, filteredEvents)
    : false;

const checkEqualStart = (a, start, filteredEvents) =>
  moment(a.start).format("YYYY-MM-DD HH:mm") == start.format("YYYY-MM-DD HH:mm")
    ? filteredEvents.push(a)
    : false;

const checkCurrentId = (a, filteredEvents) => {
  if (a.id == getItem("currentEventId")) filteredEvents.splice(a, 1);
  return filteredEvents;
};

export function initEventForm() {
  // подпишитесь на сабмит формы и на закрытие формы

  eventFormElem.addEventListener("submit", onCreateEvent);
  closeEventFormBtn.addEventListener("click", onCloseEventForm);
}
