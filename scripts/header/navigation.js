import { getItem, setItem } from "../common/storage.js";
import { renderWeek } from "../calendar/calendar.js";
import { renderHeader } from "../calendar/header.js";
import { getStartOfWeek, getDisplayedMonth } from "../common/time.utils.js";

const navButtons = document.querySelectorAll(".navigation button");

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

  switch (currentButton.dataset.direction) {
    case "prev":
      setItem(
        "displayedWeekStart",
        new Date(
          getItem("displayedWeekStart").setDate(
            getItem("displayedWeekStart").getDate() - 7
          )
        )
      );
      break;

    case "next":
      setItem(
        "displayedWeekStart",
        new Date(
          getItem("displayedWeekStart").setDate(
            getItem("displayedWeekStart").getDate() + 7
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
  [...navButtons].map((btn) => btn.addEventListener("click", onChangeWeek));
};
