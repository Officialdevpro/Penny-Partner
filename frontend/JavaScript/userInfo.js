let username = document.getElementById("username");
let currentProfile = document.querySelector(
  ".current-profile-conteiner .imgs img"
);
let homeDisplay = document.querySelector(".home-display-username");
let uNameDisplay = document.querySelector(".username-display");
let closeCurrency = document.querySelector(".close-currency");
let selectedCurrency;
let activateChart = document.querySelectorAll(".toggle-switch");
async function profileSetup() {
  let req = await fetch("https://penny-partner.onrender.com/api/v1/users");
  let res = await req.json();
  if (res.status == "success") {
    let { data } = res;
    homeDisplay.textContent = data.username;
    uNameDisplay.textContent = data.username;
    homeDisplay.dataset.userId = data._id;
    username.value = data.username;
    if (data.chart == "doughnut") {
      activateChart[2].classList.add("active");
    } else if (data.chart == "pie") {
      activateChart[0].classList.add("active");
    } else {
      activateChart[1].classList.add("active");
    }
    currentProfile.setAttribute("src", "images/profiles/" + data.profile);
    document
      .querySelector(".user-profile")
      .setAttribute("src", "images/profiles/" + data.profile);
    changeCurrency(data.currency);
    localStorage.setItem("currency", JSON.stringify(data.currency));
  }
}
profileSetup();
//Account page functionality
let editNameBtn = document.querySelector(".edit-username");
editNameBtn.addEventListener("click", () => {
  document.querySelector(".edit-box").classList.add("active");
  let inputBox = document.getElementById("username");
});
// Currency functionality
import { countriesCurrencyData } from "../data/currency.js";
import visualizeData from "./analysis.js";
let currencyOptions = document.querySelector(".currency-options");
let currencyBox = document.querySelector(".currency-container");
let closeCurrencyBox = document.querySelector(".close-currency");
let currencyBtn = document.querySelector(".currency-open");
countriesCurrencyData.forEach((item) => {
  let template = `<li data-currency-Id="${item.symbol}">
                  <input name="currency" type="radio">
                  <p>${item.country} ${item.currency} - <span>${item.currencyCode}</span></p>
                </li>`;
  currencyOptions.innerHTML += template;
});
currencyBtn.addEventListener("click", () => {
  currencyBox.classList.add("active");
});
closeCurrencyBox.addEventListener("click", () => {
  currencyBox.classList.remove("active");
});
function filterObj(obj) {
  let allowedFields = ["username", "profile", "currency", "chart"];
  let sturcturedData = {};
  Object.keys(obj).forEach((field) => {
    if (allowedFields.includes(field)) {
      sturcturedData[field] = obj[field];
    }
  });
  return sturcturedData;
}
async function updateMe(obj) {
  let data = filterObj(obj);
  let req = await fetch(
    ` https://penny-partner.onrender.com/api/v1/users/updateMe`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
  let res = await req.json();
  if (req.status === 200) {
    let month = document.querySelectorAll(".month-body .month")[1].textContent;
    let currentView = document
      .querySelector(".current-view")
      .textContent.split(" ")[0]
      .toLowerCase(0)
      .trim();
    visualizeData(currentView, month);
  }
}
let profileList = document.querySelectorAll(
  ".profile-options .profile-list li"
);
let userName = document.querySelector(".username-display");
profileList.forEach((profile) => {
  profile.addEventListener("click", () => {
    currentProfile.setAttribute("src", profile.children[0].getAttribute("src"));
  });
});
let inBox = document.getElementById("username");
inBox.addEventListener("input", (e) => {
  userName.textContent = e.target.value;
});
let updateProfileBtn = document.querySelector(".update-profile");
updateProfileBtn.addEventListener("click", () => {
  document.querySelector(".edit-box").classList.remove("active");
  if (username.value.trim().length == 0) {
    return;
  }
  document
    .querySelector(".user-profile")
    .setAttribute("src", currentProfile.getAttribute("src"));
  homeDisplay.textContent = username.value.trim();
  updateMe({
    username: username.value.trim(),
    profile: currentProfile.getAttribute("src").split("/")[2],
  });
});
let cancelBtn = document.querySelector(".aBtns .cancel-btn");
cancelBtn.addEventListener("click", () => {
  document.querySelector(".edit-box").classList.remove("active");
  username.value = document.querySelector(".home-display-username").textContent;
  uNameDisplay.textContent = document.querySelector(
    ".home-display-username"
  ).textContent;
  currentProfile.setAttribute(
    "src",
    document.querySelector(".user-profile").getAttribute("src")
  );
});
// CURRENCY OPTIONS
setTimeout(() => {
  let currencyOptions = document.querySelectorAll(".currency-options li");
  currencyOptions.forEach((opt) => {
    opt.addEventListener("click", () => {
      selectedCurrency = opt.dataset.currencyId;
      changeCurrency(opt.dataset.currencyId);
    });
  });
}, 1000);
function changeCurrency($) {
  let $preference = document.getElementsByClassName("currency-symbol");
  for (let i = 0; i < $preference.length; i++) {
    $preference[i].textContent = $;
  }
}
closeCurrency.addEventListener("click", () => {
  if (selectedCurrency) {
    localStorage.setItem("currency", JSON.stringify(selectedCurrency));
    updateMe({ currency: selectedCurrency });
  }
});
const logoutBtn = document.getElementById("logout");
logoutBtn.addEventListener("dblclick", async () => {
  let req = await fetch(
    " https://penny-partner.onrender.com/api/v1/users/logout"
  );
  let res = await req.json();
  if (res.status == "success") {
    window.location.reload();
  }
});
const delBtn = document.getElementById("delete");
delBtn.addEventListener("dblclick", async () => {
  let req = await fetch(
    " https://penny-partner.onrender.com/api/v1/users/deleteMe",
    {
      method: "DELETE",
    }
  );
  if (req.status == 204) {
    location.reload(true);
  }
});
const allToggles = document.querySelectorAll(".toggle-switch-parent");
allToggles.forEach((sw) => {
  sw.addEventListener("click", () => toggleSwitch(sw));
});
// CHART FUNCTAONALITY
function toggleSwitch(clickedElement) {
  // Get all toggle switches
  const allToggles = document.querySelectorAll(".toggle-switch-parent");
  // Turn off all switches
  allToggles.forEach((toggle) =>
    toggle.lastElementChild.classList.remove("active")
  );
  // Activate the clicked switch
  clickedElement.lastElementChild.classList.add("active");
  updateMe({ chart: clickedElement.dataset.chartName });
}
const customizeLabel = document.querySelector(".chart-label");
const chartContainer = document.querySelector(".chart-type-container");
customizeLabel.addEventListener("click", () => {
  chartContainer.classList.remove("closed");
  chartContainer.classList.add("active"); // Adds the 'highlight' class to the element
});
function closeChart() {
  chartContainer.classList.remove("active");
  chartContainer.classList.add("closed");
}
let closeChartOptions = document.querySelector(".closeChartOptions");
closeChartOptions.addEventListener("click", closeChart);
export function generateTimeStamp() {
  const now = new Date();
  const options = {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };
  const formatted = now.toLocaleString("en-US", options).replace(",", "");
  return formatted;
}
// EXPORT DATA FUNCTIONALITY
let exportLabel = document.getElementById("export-label");
let upArrow = document.querySelector(".up-arrow");
exportLabel.addEventListener("click", () => {
  document.querySelector(".export-box-body").classList.remove("closed");
  document.querySelector(".export-box-body").classList.add("active");
  document.querySelector(".export-box").classList.add("active");
  document.querySelector(
    ".export-month"
  ).innerHTML = `${months[month]} ${year}`;
});
upArrow.addEventListener("click", () => {
  document.querySelector(".export-box-body").classList.remove("active");
  document.querySelector(".export-box-body").classList.add("closed");
  document.querySelector(".export-box").classList.remove("active");
});
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const currentDate = new Date();
let x = currentDate.getMonth(); // 0-indexed
let month = x;
let year = currentDate.getFullYear();
document.querySelector(".export-month").innerHTML = `${months[month]} ${year}`;

function changeDate(increament) {
  month = month + increament;
  if (month > 11) {
    month = 0;
    year++;
  }
  if (month < 0) {
    year--;
    month = 11;
  }
  document.querySelector(
    ".export-month"
  ).innerHTML = `${months[month]} ${year}`;
}
let leftArrow = document.querySelector(".export-left-space");
let rightArrow = document.querySelector(".export-right-space");
leftArrow.addEventListener("click", () => changeDate(-1));
rightArrow.addEventListener("click", () => changeDate(1));
let exportBtn = document.querySelector(".export-btn");
exportBtn.addEventListener("click", async (e) => {
  let requestedMonth = document
    .querySelector(".export-month")
    .textContent.trim();
  e.preventDefault(); // Prevent default action

  try {
    e.preventDefault();
    let req = await fetch(
      ` https://penny-partner.onrender.com/api/v1/users/report?month=${requestedMonth}`,
      {
        method: "GET",
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      }
    );
    let blob = await req.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = requestedMonth + " report.xlsx"; // Set the default download name
    document.querySelector(".download-link").appendChild(a);
    a.addEventListener("click", (event) => {
      event.stopPropagation(); // Prevent the event from bubbling up
    });
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (e) {
    console.error("Download error:", e);
  }
});
let confirmResetBtn = document.querySelector(".confirm-reset-app");
confirmResetBtn.addEventListener("click", resetApp);
async function resetApp() {
  confirmResetBtn.innerHTML = "<div class='spin'></div>";
  let req = await fetch(
    " https://penny-partner.onrender.com/api/v1/users/resetApp"
  );
  let res = await req.json();
  if (res.status == "success") {
    window.location.reload(true);
  }
}
let messageBox = document.querySelector(".message-box-main");
let resetBtn = document.getElementById("reset-app");
resetBtn.addEventListener("click", () => {
  messageBox.classList.add("active");
});
let closeMsgBtn = document.querySelector(".close-msg-box");
closeMsgBtn.addEventListener("click", () => {
  messageBox.classList.remove("active");
});
let privacyBtn = document.getElementById("privacy-btn");
privacyBtn.addEventListener("click", () => {
  document.querySelector(".privacy-container").classList.toggle("active");
});
