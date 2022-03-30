import { getItem, setItem } from "../common/storage.js";
import { renderWeek } from "../calendar/calendar.js";
import { renderHeader } from "../calendar/header.js";
import { getStartOfWeek, getDisplayedMonth } from "../common/time.utils.js";

function renderCurrentMonth() {
  // отрисовать месяц, к которому относиться текущая неделя (getDisplayedMonth)
  // вставить в .navigation__displayed-month
  const navigationDisplayedMonth = document.querySelector(
    ".navigation__displayed-month"
  );
  navigationDisplayedMonth.innerHTML = getDisplayedMonth(
    getItem("displayedWeekStart")
  );
}

const onChangeWeek = (event) => {
  const currentButton = event.target.closest("button");
  const displayedWeekStart = getItem("displayedWeekStart");

  switch (currentButton.dataset.direction) {
    case "prev":
      setItem(
        "displayedWeekStart",
        new Date(
          displayedWeekStart.setDate(
            displayedWeekStart.getDate() - 7
          )
        )
      );
      break;

    case "next":
      setItem(
        "displayedWeekStart",
        new Date(
          displayedWeekStart.setDate(
            displayedWeekStart.getDate() + 7
          )
        )
      );
      break;

    case "today":
      setItem("displayedWeekStart", getStartOfWeek(new Date()));
      break;
  }

  renderHeader();
  renderWeek();
  renderCurrentMonth();

  // при переключении недели обновите displayedWeekStart в storage
  // и перерисуйте все необходимые элементы страницы (renderHeader, renderWeek, renderCurrentMonth)
};

export const initNavigation = () => {
  renderCurrentMonth();

  const navButtons = document.querySelectorAll(".navigation button");
  [...navButtons].map((btn) => btn.addEventListener("click", onChangeWeek));
};
