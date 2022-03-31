import { getItem } from "../common/storage.js";
import { openPopup, closePopup } from "../common/popup.js";
import { openModal } from "../common/modal.js";
import { getEvent, getEvents, removeEvent } from "./eventGateway.js";

async function handleEventClick(event) {
  // если произошел клик по событию, то нужно паказать попап с кнопкой удаления

  const eventElement = event.target.closest(".event");
  if (!eventElement) return;

  setCurrentEvent(eventElement);

  const diffPositionClickWidth = window.innerWidth - event.pageX;
  const diffPositionClickHeight = window.innerHeight - event.pageY;
  const marginClickWidth = 150;
  const marginClickHeight = 125;
  const top =
    diffPositionClickWidth >= marginClickWidth
      ? event.pageX
      : window.innerWidth - marginClickWidth;
  const left =
    diffPositionClickHeight >= marginClickHeight
      ? event.pageY
      : window.innerHeight - marginClickHeight;

  openPopup(top, left);
}

const removeEventsFromCalendar = () =>
  document.querySelectorAll(".event").forEach((el) => el.remove());

export const createEventElement = (event) => {
  // ф-ция создает DOM элемент события
  // событие должно позиционироваться абсолютно внутри нужной ячейки времени внутри дня
  // нужно добавить id события в дата атрибут
  // здесь для создания DOM элемента события используйте document.createElement

  /////ПЕРЕДЕЛАТЬ НА cREATEeLEMENT

  const eventElement = document.createElement("div");
  eventElement.className =
    moment(event.end) < moment() ? "event event__past" : "event";
  eventElement.dataset.eventId = event.id;
  eventElement.style.top = `${moment(event.start).minutes()}px`;
  eventElement.style.height = `${moment(event.end).diff(
    moment(event.start),
    "minutes"
  )}px`;

  if (
    event.title &&
    moment(event.end).diff(moment(event.start), "minutes") > 30
  ) {
    const eventTitle = document.createElement("div");
    eventTitle.className = "event-title";
    eventTitle.textContent = event.title;
    eventElement.append(eventTitle);
  }

  const eventTime = document.createElement("div");
  eventTime.className =
    moment(event.end).diff(moment(event.start), "minutes") == 15
      ? "event__time event__time-small"
      : "event__time";
  eventTime.textContent = `${moment(event.start).format("HH:mm")} - ${moment(
    event.end
  ).format("HH:mm")}`;
  eventElement.append(eventTime);

  return eventElement;
};

export const renderEvents = () => {
  // достаем из storage все события и дату понедельника отображаемой недели
  // фильтруем события, оставляем только те, что входят в текущую неделю
  // создаем для них DOM элементы с помощью createEventElement
  // для каждого события находим на странице временную ячейку (.calendar__time-slot)
  // и вставляем туда событие
  // каждый день и временная ячейка должно содержать дата атрибуты, по которым можно будет найти нужную временную ячейку для события
  // не забудьте удалить с календаря старые события перед добавлением новых

  removeEventsFromCalendar();

  const currentWeekDate = getItem("displayedWeekStart");

  getEvents()
    .then((data) => {
      if (!data) return;
      data
        .filter(
          (event) =>
            moment(event.start).date() >= moment(currentWeekDate).date() ||
            moment(event.start).date() <=
              moment(currentWeekDate).add(6, "days").date()
        )
        .map((event) => addEventToList(event));
    })
    .catch((error) => alert(error));
};

export const addEventToList = (event) => {
  const oldEvent = document.querySelector(
    `.event[data-event-id="${event.id}"]`
  );

  if (oldEvent) oldEvent.remove();

  const currentDay = document.querySelector(
    `.calendar__day[data-day="${moment(event.start).format("D")}"]`
  );

  if (currentDay) {
    const currentTimeSlot = currentDay.querySelector(
      `.calendar__time-slot[data-time="${moment(event.start).format("H")}"]`
    );
    currentTimeSlot.append(createEventElement(event));
  }
};

function onDeleteEvent() {
  // достаем из storage массив событий и currentEventId
  // удаляем из массива нужное событие и записываем в storage новый массив
  // закрыть попап
  // перерисовать события на странице в соответствии с новым списком событий в storage (renderEvents)

  const currentEventId = getCurrentEventId();
  if (!currentEventId) return;

  getEvent(currentEventId)
    .then((event) => {
      if (!checkRulesBeforeDeleteEvent(event))
        throw new Error(
          "Нельзя удалять событие раньше чем за 15 мин до начала"
        );
      return event.id;
    })
    .then((result) => removeEvent(result))
    .then((event) => {
      if (!event) return;
      return [closePopup(), removeEventElementById(event.id)];
    })
    .catch((error) => alert(error));
}

const onEditEvent = () => [closePopup(), openModal()];

const removeEventElementById = (id) => {
  const eventEl = document.querySelector(`.event[data-event-id="${id}"]`);
  return eventEl ? eventEl.remove() : null;
};

const checkRulesBeforeDeleteEvent = (event) => {
  if (
    moment().format("YYYY-MM-DD HH") ==
      moment(event.start).format("YYYY-MM-DD HH") &&
    moment().add(15, "minutes").format("YYYY-MM-DD HH:mm") >
      moment(event.start).format("YYYY-MM-DD HH:mm")
  ) {
    return false;
  }
  return true;
};

export const setCurrentEvent = (event) => {
  event.dataset.currentEvent = true;
};

export const getCurrentEventId = () => {
  const activeEventElem = document.querySelector(
    '.event[data-current-event="true"]'
  );
  return activeEventElem ? activeEventElem.getAttribute("data-event-id") : null;
};

export const clearCurrentEventElemAndSlot = () => {
  const activeEventElem = document.querySelector(
    '.event[data-current-event="true"]'
  );
  if (activeEventElem) activeEventElem.removeAttribute("data-current-event");

  const calendarTimeSlot = document.querySelector("[data-slot-date]");
  if (calendarTimeSlot) calendarTimeSlot.removeAttribute("data-slot-date");
};

const weekElem = document.querySelector(".calendar__week");
const deleteEventBtn = document.querySelector(".delete-event-btn");
const editEventBtn = document.querySelector(".edit-event-btn");

deleteEventBtn.addEventListener("click", onDeleteEvent);
editEventBtn.addEventListener("click", onEditEvent);
weekElem.addEventListener("click", handleEventClick);
