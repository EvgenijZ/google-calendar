import { getItem, setItem } from "../common/storage.js";
import { openPopup, closePopup } from "../common/popup.js";
import { openModal } from "../common/modal.js";

const weekElem = document.querySelector(".calendar__week");
const deleteEventBtn = document.querySelector(".delete-event-btn");
const editEventBtn = document.querySelector(".edit-event-btn");

function handleEventClick(event) {
  // если произошел клик по событию, то нужно паказать попап с кнопкой удаления
  // установите currentEventId с id события в storage

  const eventElement = event.target.closest(".event");
  if (!eventElement) return;

  setItem("currentEventId", eventElement.dataset.eventId);
  setItem(
    "slotDate",
    getItem("events").find(
      (event) => event.id === +eventElement.dataset.eventId
    ).start
  );

  const diffPositionClickWidth = window.innerWidth - event.pageX;
  const diffPositionClickHeight = window.innerHeight - event.pageY;
  const marginClickWidth = 150;
  const marginClickHeight = 125;

  openPopup(
    diffPositionClickWidth >= marginClickWidth
      ? event.pageX
      : window.innerWidth - marginClickWidth,
    diffPositionClickHeight >= marginClickHeight
      ? event.pageY
      : window.innerHeight - marginClickHeight
  );
}

function removeEventsFromCalendar() {
  // ф-ция для удаления всех событий с календаря

  const events = getItem("events");
  const eventsElements = document.querySelectorAll(".event");

  eventsElements.forEach((el) => {
    if (events.find((e) => e.id !== +el.dataset.eventId) || !events.length)
      el.remove();
  });
}

const createEventElement = (event) => {
  // ф-ция создает DOM элемент события
  // событие должно позиционироваться абсолютно внутри нужной ячейки времени внутри дня
  // нужно добавить id события в дата атрибут
  // здесь для создания DOM элемента события используйте document.createElement

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
    eventElement.innerHTML = `<div class="event__title">${event.title}</div>`;
  }

  eventElement.innerHTML += `<div class="event__time${
    moment(event.end).diff(moment(event.start), "minutes") == 15
      ? " event__time-small"
      : ""
  }">${moment(event.start).format("HH:mm")} - ${moment(event.end).format(
    "HH:mm"
  )}</div></div>`;

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

  const events = getItem("events").filter(
    (event) =>
      moment(event.start).date() >= moment(currentWeekDate).date() &&
      moment(event.start).date() <= moment(currentWeekDate).date() + 7
  );
  events.map((event) => {
    const currentDay = document.querySelector(
      `.calendar__day[data-day="${moment(event.start).format("D")}"]`
    );
    const currentTimeSlot = currentDay.querySelector(
      `.calendar__time-slot[data-time="${moment(event.start).format("H")}"]`
    );
    const oldEvent = document.querySelector(
      `.event[data-event-id="${event.id}"]`
    );

    if (oldEvent) oldEvent.remove();

    currentTimeSlot.append(createEventElement(event));
  });
};

function onDeleteEvent() {
  // достаем из storage массив событий и currentEventId
  // удаляем из массива нужное событие и записываем в storage новый массив
  // закрыть попап
  // перерисовать события на странице в соответствии с новым списком событий в storage (renderEvents)

  const currentEventId = getItem("currentEventId");
  const filteredEventsArr = getItem("events").filter((event) => {
    if (
      event.id === +currentEventId &&
      moment().format("YYYY-MM-DD HH") ==
        moment(event.start).format("YYYY-MM-DD HH") &&
      moment().add(15, "minutes").format("YYYY-MM-DD HH:mm") >
        moment(event.start).format("YYYY-MM-DD HH:mm")
    ) {
      alert("Нельзя удалять событие раньше чем за 15 мин до начала");
      return true;
    }
    return event.id !== +currentEventId;
  });
  setItem("events", filteredEventsArr);
  setItem("currentEventId", null);
  closePopup();
  renderEvents();
}

function onEditEvent() {
  closePopup();
  openModal();
}

deleteEventBtn.addEventListener("click", onDeleteEvent);
editEventBtn.addEventListener("click", onEditEvent);
weekElem.addEventListener("click", handleEventClick);
