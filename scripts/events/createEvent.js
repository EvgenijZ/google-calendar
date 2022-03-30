import { getCurrentEventId, addEventToList } from "./events.js";
import { closeModal } from "../common/modal.js";
import { getEvents, createEvent, updateEvent } from "./eventGateway.js";

const eventFormElem = document.querySelector(".event-form");

const clearEventForm = () => eventFormElem.reset();
const onCloseEventForm = () => [closeModal(), clearEventForm()];
const validateDataEvent = async (obj) => {

  const [start, end] = prepareDate(obj);
  const errors = [];
  const filteredEvents = [];

  await getEvents().then(events => {

    events.forEach((event) => {
      checkStartObjBetween(event, start, filteredEvents);
      checkStartEventBetween(event, start, end, filteredEvents);
      checkEqualStart(event, start, filteredEvents);
      checkCurrentId(event, filteredEvents);
    });

    if (filteredEvents.length) errors.push("Два события не могут пересекаться по времени");
    if (moment(start) > moment(end) || moment(start).unix() === moment(end).unix()) errors.push("Неккоретный диапазон события");
    if (moment(end).diff(moment(start), "hours") > 6) errors.push("Cобытие не может быть дольше 6 часов");

  });

  return errors.length ? { errors: JSON.stringify(errors.join(", ")) } : { success: true };
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

  validateDataEvent(formObj).then(result => {
    if (result.errors) throw new Error(result.errors);

    const [start, end] = prepareDate(formObj);
    formObj.start = start;
    formObj.end = end;

    return formObj;

  }).then(obj => updateEventObj(obj))
    .then(obj => createEvent(obj))
    .then(event => {
      if (!event) return;
      onCloseEventForm();
      addEventToList(event);
    }).catch(error => alert(error));
}

const onUpdateEvent = (event) => {
  event.preventDefault();

  const formData = new FormData(eventFormElem);
  const formObj = Object.fromEntries(formData);

  validateDataEvent(formObj).then(result => {
    if (result.errors) throw new Error(result.errors);

    updateEventItem(formObj);
    return formObj;
  }).then(event => updateEvent(event)).then((event) => {
    if (!event) return;
    onCloseEventForm();
    addEventToList(event);
  }).catch(error => alert(error));
}

const checkCreateOrUpdateEvent = (event) => {
  event.preventDefault();
  return getCurrentEventId()
    ? onUpdateEvent(event) : onCreateEvent(event);
}

const updateEventItem = (event) => {
  if (!event) return;

  const [start, end] = prepareDate(event);

  event.id = getCurrentEventId();
  event.start = start;
  event.end = end;

  updateEventObj(event);

  return event;
}

const prepareDate = (obj, format = 'YYYY-MM-DD HH:mm') => {
  const start = moment(
    `${obj.date} ${obj.startTimeHours}:${obj.startTimeMinutes}`
  ).format(format);
  const end = moment(`${obj.date} ${obj.endTimeHours}:${obj.endTimeMinutes}`)
    .format(format);
  return [start, end];
}

const updateEventObj = (formObj) => {
  const allowedObjFields = ["id", "title", "description", "start", "end"];
  Object.keys(formObj).forEach((k) => {
    if (!allowedObjFields.includes(k)) delete formObj[k];
  });
  return formObj;
};


const checkStartObjBetween = (event, start, filteredEvents) =>
  moment(start).isBetween(
    moment(event.start).format("YYYY-MM-DD HH:mm"),
    moment(event.end).format("YYYY-MM-DD HH:mm")
  )
    ? filteredEvents.push(event)
    : false;

const checkStartEventBetween = (event, start, end, filteredEvents) =>
  moment(moment(event.start).format("YYYY-MM-DD HH:mm")).isBetween(
    start, end
  )
    ? filteredEvents.push(event)
    : false;

const checkEqualStart = (event, start, filteredEvents) =>
  moment(event.start).format("YYYY-MM-DD HH:mm") == start
    ? filteredEvents.push(event)
    : false;

const checkCurrentId = (event, filteredEvents) => {
  if (event.id == getCurrentEventId()) filteredEvents.splice(event, 1);
  return filteredEvents;
};

export function initEventForm() {
  // подпишитесь на сабмит формы и на закрытие формы

  eventFormElem.addEventListener("submit", checkCreateOrUpdateEvent);

  const closeEventFormBtn = document.querySelector(".create-event__close-btn");
  closeEventFormBtn.addEventListener("click", onCloseEventForm);
}