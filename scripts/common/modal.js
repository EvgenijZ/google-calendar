const modalElem = document.querySelector(".modal");
const createEventCloseBtn = document.querySelector(".create-event__close-btn");
import { getItem, setItem } from "../common/storage.js";

export const openModal = () => {
  setDateForModal();
  modalElem.classList.remove("hidden");
};
export const closeModal = () => {
  setItem("currentEventId", null);
  modalElem.classList.add("hidden");
};

// опишите ф-ции openModal и closeModal
// модальное окно работает похожим на попап образом
// отличие в том, что попап отображается в месте клика, а модальное окно - по центру экрана

const setDateForModal = () => {
  const modalInputTitle = document.querySelector(
    '.event-form input[name="title"]'
  );
  const modalTextareaDescription = document.querySelector(
    '.event-form textarea[name="description"]'
  );
  const modalInputDate = document.querySelector(
    '.event-form input[name="date"]'
  );
  const modalInputStartTimeHours = document.querySelector(
    '.event-form select[name="startTimeHours"]'
  );
  const modalInputStartTimeMinutes = document.querySelector(
    '.event-form select[name="startTimeMinutes"]'
  );
  const modalInputEndTimeHours = document.querySelector(
    '.event-form select[name="endTimeHours"]'
  );
  const modalInputEndTimeMinutes = document.querySelector(
    '.event-form select[name="endTimeMinutes"]'
  );
  const date = getItem("slotDate") ? moment(getItem("slotDate")) : moment();

  modalInputDate.value = date.format("YYYY-MM-DD");
  modalInputStartTimeHours.value = date.format("HH");
  if (!getItem("currentEventId"))
    modalInputEndTimeHours.value = date.add(1, "hours").format("HH");

  if (getItem("slotDate")) {
    switch (true) {
      case date.format("HH") == "00" &&
        (date.format("mm") == 45 || date.format("mm") == 30):
        modalInputStartTimeHours.value = 23;
        modalInputEndTimeHours.value = 23;
        modalInputStartTimeMinutes.value = 30;
        modalInputEndTimeMinutes.value = 45;
        break;

      case date.format("HH") == "00" && date.format("mm") == 15:
        modalInputStartTimeHours.value = 23;
        modalInputEndTimeHours.value = 23;
        modalInputStartTimeMinutes.value = 15;
        modalInputEndTimeMinutes.value = 30;
        break;

      case date.format("HH") == "00" && date.format("mm") < 15:
        modalInputStartTimeHours.value = 23;
        modalInputEndTimeHours.value = 23;
        modalInputStartTimeMinutes.value = "00";
        modalInputEndTimeMinutes.value = 15;
        break;

      case date.format("mm") >= 45:
        modalInputStartTimeMinutes.value = 45;
        modalInputEndTimeMinutes.value = 45;
        break;

      case date.format("mm") >= 30 && date.format("mm") < 45:
        modalInputStartTimeMinutes.value = 30;
        modalInputEndTimeMinutes.value = 30;
        break;

      case date.format("mm") >= 15 && date.format("mm") < 30:
        modalInputStartTimeMinutes.value = 15;
        modalInputEndTimeMinutes.value = 15;
        break;

      case date.format("mm") > 0 && date.format("mm") < 15:
        modalInputStartTimeMinutes.value = "00";
        modalInputEndTimeMinutes.value = "00";
        break;

      default:
        modalInputStartTimeMinutes.value = "00";
        modalInputEndTimeMinutes.value = "00";
        break;
    }
  } else {
    switch (true) {
      case date.format("mm") >= 45:
        if (+modalInputStartTimeHours.value === 23) {
          modalInputDate.value = moment(modalInputDate.value)
            .add(1, "days")
            .format("YYYY-MM-DD");
          modalInputStartTimeHours.value = "00";
          modalInputEndTimeHours.value = "01";
          modalInputStartTimeMinutes.value = "00";
          modalInputEndTimeMinutes.value = "00";
        } else {
          modalInputStartTimeHours.value = +modalInputStartTimeHours.value + 1;
          modalInputEndTimeHours.value = +modalInputEndTimeHours.value + 1;
          modalInputStartTimeMinutes.value = "00";
          modalInputEndTimeMinutes.value = "00";
        }
        break;

      case date.format("mm") >= 30 && date.format("mm") < 45:
        modalInputStartTimeMinutes.value = 45;
        modalInputEndTimeMinutes.value = 45;
        break;

      case date.format("mm") >= 15 && date.format("mm") < 30:
        modalInputStartTimeMinutes.value = 30;
        modalInputEndTimeMinutes.value = 30;
        break;

      case date.format("mm") > 0 && date.format("mm") < 15:
        modalInputStartTimeMinutes.value = 15;
        modalInputEndTimeMinutes.value = 15;
        break;

      default:
        modalInputStartTimeMinutes.value = "00";
        modalInputEndTimeMinutes.value = "00";
        break;
    }
  }

  if (getItem("currentEventId")) {
    const event = getItem("events").find(
      (event) => event.id === +getItem("currentEventId")
    );
    modalInputTitle.value = event.title;
    modalTextareaDescription.value = event.description;
    modalInputDate.value = moment(event.start).format("YYYY-MM-DD");
    modalInputStartTimeHours.value = moment(event.start).format("HH");
    modalInputStartTimeMinutes.value = moment(event.start).format("mm");
    modalInputEndTimeHours.value = moment(event.end).format("HH");
    modalInputEndTimeMinutes.value = moment(event.end).format("mm");
  }
};

const createSelectOption = (value, text) => {
  const option = document.createElement("option");
  option.text = text >= 10 ? text : "0" + text;
  option.value = value >= 10 ? value : "0" + value;
  return option;
};

const setSelectHoursForModal = () => {
  const startHoursSelect = document.querySelector("#startTimeHours");
  const startMinutesSelect = document.querySelector("#startTimeMinutes");
  const endHoursSelect = document.querySelector("#endTimeHours");
  const endMinutesSelect = document.querySelector("#endTimeMinutes");

  for (let i = 0; i <= 23; i++) {
    startHoursSelect.add(createSelectOption(i, i));
    endHoursSelect.add(createSelectOption(i, i));
  }

  for (let i = 0; i < 60; i += 15) {
    startMinutesSelect.add(createSelectOption(i, i));
    endMinutesSelect.add(createSelectOption(i, i));
  }
};

setSelectHoursForModal();

createEventCloseBtn.addEventListener("click", closeModal);
