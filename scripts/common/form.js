import { getEvent } from "../events/eventGateway.js";
import { getCurrentEventId } from "../events/events.js";

const inputTitle = document.querySelector('.event-form input[name="title"]');
const textareaDescription = document.querySelector(
  '.event-form textarea[name="description"]'
);
const inputDate = document.querySelector('.event-form input[name="date"]');
const inputStartHours = document.querySelector(
  '.event-form select[name="startTimeHours"]'
);
const inputStartMinutes = document.querySelector(
  '.event-form select[name="startTimeMinutes"]'
);
const inputEndHours = document.querySelector(
  '.event-form select[name="endTimeHours"]'
);
const inputEndMinutes = document.querySelector(
  '.event-form select[name="endTimeMinutes"]'
);

const setTimesForInputs = (startHours, startMins, endHours, endMins) => {
  if (startHours) inputStartHours.value = startHours;
  if (startMins) inputStartMinutes.value = startMins;
  if (endHours) inputEndHours.value = endHours;
  if (endMins) inputEndMinutes.value = endMins;
};

export const prepareInputsForModal = () => {
  const currentEventId = getCurrentEventId();
  const calendarTimeSlot = document.querySelector(
    ".calendar__time-slot[data-slot-date]"
  );

  if (currentEventId) {
    loadInputsEditModal();
  } else if (calendarTimeSlot && calendarTimeSlot.dataset.slotDate) {
    loadInputsSlotModal();
  } else {
    loadInputsCreateModal();
  }
};

const loadInputsSlotModal = () => {
  const calendarTimeSlot = document.querySelector(
    ".calendar__time-slot[data-slot-date]"
  );
  const date = moment(calendarTimeSlot.dataset.slotDate);
  inputDate.value = date.format("YYYY-MM-DD");
  inputStartHours.value = date.format("HH");
  inputEndHours.value = date.add(1, "hours").format("HH");

  switch (true) {
    case date.format("HH") == "00" &&
      (date.format("mm") == 45 || date.format("mm") == 30):
      setTimesForInputs(23, 30, 23, 45);
      break;

    case date.format("HH") == "00" && date.format("mm") == 15:
      setTimesForInputs(23, 15, 23, 30);
      break;

    case date.format("HH") == "00" && date.format("mm") < 15:
      setTimesForInputs(23, "00", 23, 15);
      break;

    case date.format("mm") >= 45:
      setTimesForInputs(null, 45, null, 45);
      break;

    case date.format("mm") >= 30 && date.format("mm") < 45:
      setTimesForInputs(null, 30, null, 30);
      break;

    case date.format("mm") >= 15 && date.format("mm") < 30:
      setTimesForInputs(null, 15, null, 15);
      break;

    case date.format("mm") > 0 && date.format("mm") < 15:
      setTimesForInputs(null, "00", null, "00");
      break;

    default:
      setTimesForInputs(null, "00", null, "00");
      break;
  }
};

const loadInputsCreateModal = () => {
  const date = moment();
  inputDate.value = date.format("YYYY-MM-DD");
  inputStartHours.value = date.format("HH");
  inputEndHours.value = date.add(1, "hours").format("HH");

  switch (true) {
    case date.format("mm") >= 45:
      if (+inputStartHours.value === 23) {
        inputDate.value = moment(inputDate.value)
          .add(1, "days")
          .format("YYYY-MM-DD");
        setTimesForInputs("00", "00", "01", "00");
      } else {
        setTimesForInputs(
          +inputStartHours.value + 1,
          "00",
          +inputEndHours.value + 1,
          "00"
        );
      }
      break;

    case date.format("mm") >= 30 && date.format("mm") < 45:
      setTimesForInputs(null, 45, null, 45);
      break;

    case date.format("mm") >= 15 && date.format("mm") < 30:
      setTimesForInputs(null, 30, null, 30);
      break;

    case date.format("mm") > 0 && date.format("mm") < 15:
      setTimesForInputs(null, 15, null, 15);
      break;

    default:
      setTimesForInputs(null, "00", null, "00");
      break;
  }
};

const loadInputsEditModal = () => {
  const currentEventId = getCurrentEventId();

  getEvent(currentEventId)
    .then((event) => {
      if (!event) return;
      inputTitle.value = event.title;
      textareaDescription.value = event.description;
      inputDate.value = moment(event.start).format("YYYY-MM-DD");
      setTimesForInputs(
        moment(event.start).format("HH"),
        moment(event.start).format("mm"),
        moment(event.end).format("HH"),
        moment(event.end).format("mm")
      );
    })
    .catch((error) => alert(error));
};

const createSelectOption = (value, text) => {
  const option = document.createElement("option");
  option.text = text >= 10 ? text : "0" + text;
  option.value = value >= 10 ? value : "0" + value;
  return option;
};

export const initSelectHoursForModal = () => {
  for (let i = 0; i <= 23; i++) {
    inputStartHours.add(createSelectOption(i, i));
    inputEndHours.add(createSelectOption(i, i));
  }

  for (let i = 0; i < 60; i += 15) {
    inputStartMinutes.add(createSelectOption(i, i));
    inputEndMinutes.add(createSelectOption(i, i));
  }
};
