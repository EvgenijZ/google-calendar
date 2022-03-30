import { prepareInputsForModal } from './form.js';
import { clearCurrentEventElemAndSlot } from '../events/events.js';

const modalElem = document.querySelector(".modal");
const createEventCloseBtn = document.querySelector(".create-event__close-btn");

export const openModal = () => {
  prepareInputsForModal();
  modalElem.classList.remove("hidden");
};
export const closeModal = () => {
  modalElem.classList.add("hidden");
  clearCurrentEventElemAndSlot();
};

// опишите ф-ции openModal и closeModal
// модальное окно работает похожим на попап образом
// отличие в том, что попап отображается в месте клика, а модальное окно - по центру экрана

createEventCloseBtn.addEventListener("click", () => closeModal);