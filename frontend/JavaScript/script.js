//--------------DARK MODE FUNCTIONALITY-----------------
let isDark = JSON.parse(localStorage.getItem("Theme"));
let sunMoon = document.querySelector(".theme .left-part img");
let navIcons = document.querySelectorAll("footer nav ul li");
let pages = document.querySelectorAll("main section");
let closeSideBar = document.querySelector(".close");
let sideBar = document.querySelector(".sidebar");
let accountPage = document.querySelector(".account");
let hamburger = document.querySelector(".hamburger");
let addAccountBtn = document.querySelector(".add-box");
let accountBox = document.querySelector(".box-body");
let cancelAddAccount = document.querySelector(".cancel-add-account");
let saveAccountBtn = document.querySelector(".save-accont-btn");
let cancelEdit = document.querySelector(".cancelEdit");
let updateEdit = document.querySelector(".updateBtn");
let accountsList = document.querySelectorAll(".account-list li");
let accountDelBtn = document.querySelectorAll(".delete-account");
let dots = document.querySelectorAll(".operations .dot");
let options = document.querySelectorAll(".operations .options");
let editBox = document.querySelector(".edit-box-body");
let preference = document.querySelector(".theme");
let categoryBox = document.querySelector(".category-box-body");
let addCategoryBtn = document.querySelector(".add-category .add-box");
let categoryContainer = document.querySelector(
  ".categories .category-container"
);
let accountContainer = document.querySelector(".account-container");
let accountPageIn = document.querySelector(".account-page-income");
let accountPageEx = document.querySelector(".account-page-expense");
if (isDark) {
  document.querySelector(".app").classList.add("dark");
  document.querySelector(".sun-theme").setAttribute("src", "images/moon.png");
  sunMoon.setAttribute("src", "icons/moon.svg");
} else {
  document.querySelector(".sun-theme").setAttribute("src", "images/sun.png");
}
let userCurrency = JSON.parse(localStorage.getItem("currency"));
import {
  reloadFunctionality,
  saveAccount,
  updateAccount,
} from "./functions.js";
let existingAccounts = document.querySelector(".accounts");
function renderAccounts(data) {
  data.forEach((item) => {
    let existingAccounts = document.querySelector(".accounts");
    let template = `<li class="card">
                  <div class="card-body">
                    <img class="icon" src="${item.accountImage}" alt="" />
                    <div class="card-info">
                      <p class="bold">${item.accountName}</p>
                      <p>Balance: <span class="${
                        item.netBalance + item.balance < 0
                          ? "red bold"
                          : "green bold"
                      }"><span class="currency-symbol">${JSON.parse(
      localStorage.getItem("currency")
    )}</span>${(item.netBalance + item.balance < 0
      ? Math.abs(item.netBalance + item.balance)
      : item.netBalance + item.balance
    ).toLocaleString()}</span></p>
                    </div>
                  </div>
                  <div class="operations">
                    <img class="dot svg" src="icons/dot.svg" alt="" />
                    <div class="options" data-account-id="${item._id}">
                      <p class="edit-btn" data-balance=${item.balance}>Edit</p>
                      <p class="delete-account">Delete</p>
                    </div>
                  </div>
                </li>`;
    existingAccounts.innerHTML += template;
  });
}
// ---------  SKELETON LOADING EFFECT-----------------
for (let i = 0; i < 7; i++) {
  existingAccounts.innerHTML += `<li class="skeleton-card"></li>`;
}
document.querySelectorAll(".skeleton-account").forEach((btn) => {
  btn.addEventListener("click", () => {
    loadAccountsData();
  });
});
preference.addEventListener("click", () => {
  let app = document.querySelector(".app");
  app.classList.toggle("dark");
  if (app.classList.contains("dark")) {
    localStorage.setItem("Theme", "true");
    document.querySelector(".sun-theme").setAttribute("src", "images/moon.png");
    sunMoon.setAttribute("src", "icons/moon.svg");
  } else {
    localStorage.setItem("Theme", "false");
    document.querySelector(".sun-theme").setAttribute("src", "images/sun.png");
    sunMoon.setAttribute("src", "icons/sun.svg");
  }
});
cancelAddAccount.addEventListener("click", closeAccountBox);
saveAccountBtn.addEventListener("click", saveAccount);
cancelEdit.addEventListener("click", closeEditBox);
updateEdit.addEventListener("click", updateAccount);
navIcons.forEach((icon, index) => {
  icon.addEventListener("click", () => changePage(icon, index));
});
function changePage(page, index) {
  pages.forEach((page) => page.classList.remove("active"));
  pages[index].classList.add("active");
}
closeSideBar.addEventListener("click", () => {
  sideBar.classList.remove("active");
});
hamburger.addEventListener("click", () => sideBar.classList.add("active"));
document.addEventListener("click", (e) => {
  if (!sideBar.contains(e.target) && !hamburger.contains(e.target)) {
    sideBar.classList.remove("active");
  }
  if (!addAccountBtn.contains(e.target) && !accountBox.contains(e.target)) {
    accountBox.classList.remove("active");
    accountContainer.classList.remove("blurbg");
  }
  if (!categoryBox.contains(e.target) && !addCategoryBtn.contains(e.target)) {
    categoryBox.classList.remove("active");
    categoryContainer.classList.remove("blurbg");
  }
  let isoptionBox;
  let dots = document.querySelectorAll(".operations .dot");
  let options = document.querySelectorAll(".operations .options");
  let catedots = document.querySelectorAll(".right-portion .dot");
  let cateoptions = document.querySelectorAll(".right-portion .options");
  options.forEach((opt) => {
    if (opt.contains(e.target)) {
      isoptionBox = true;
    }
  });
  if (!editBox.contains(e.target) && !isoptionBox) {
    editBox.classList.remove("active");
    accountContainer.classList.remove("blur");
  }
  let isOptionsClicked = "";
  let isDotsClicked = true;
  options.forEach((opt) => {
    if (opt.contains(e.target)) {
      isOptionsClicked = true;
    }
  });
  dots.forEach((dot) => {
    if (dot.contains(e.target)) {
      isDotsClicked = false;
    }
  });
  if (isDotsClicked) {
    options.forEach((opt) => opt.classList.remove("active"));
  }
});
addAccountBtn.addEventListener("click", () => {
  closeEditBox();
  accountBox.classList.add("active");
  accountContainer.classList.add("blurbg");
});
export function closeAccountBox() {
  accountBox.classList.remove("active");
  accountContainer.classList.remove("blurbg");
}
export function closeEditBox() {
  accountContainer.classList.remove("blur");
  document.querySelector(".edit-box-body").classList.remove("active");
}
function removeActiveAccount() {
  accountsList.forEach((account) => {
    account.classList.remove("active");
  });
}
accountsList.forEach((account) => {
  account.addEventListener("click", () => {
    removeActiveAccount();
    account.classList.add("active");
  });
});
dots.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    if (options[index].classList.contains("active")) {
      options[index].classList.remove("active");
    } else {
      // Deactivate all options
      options.forEach((option) => option.classList.remove("active"));
      // Activate the clicked option
      options[index].classList.add("active");
    }
  });
});
let startX;
let moveX;
let a = false;
document.addEventListener("touchstart", (e) => {
  if (accountBox.contains(e.target)) a = true;
  startX = e.touches[0].clientX;
});
document.addEventListener("touchmove", (e) => {
  if (
    accountBox.classList.contains("active") ||
    editBox.classList.contains("active") ||
    categoryBox.classList.contains("active")
  )
    a = true;
  moveX = e.touches[0].clientX;
});
document.addEventListener("touchend", (e) => {
  if (moveX !== undefined) {
    if (startX + 100 < moveX) {
      if (!a) sideBar.classList.add("active");
      // Implement your logic for right swipe here
    } else if (startX - 100 > moveX) {
      sideBar.classList.remove("active");
      // Implement your logic for left swipe here
    }
  }
  // Reset moveX after handling the event
  moveX = undefined;
  a = false;
});
export async function loadAccountsData() {
  const req = await fetch(
    " https://penny-partner.onrender.com/api/v1/users/accounts/balance/"
  );
  const res = await req.json();
  if (req.status === 200) {
    let {
      userAccounts,
      totalIncomeAcrossAccounts,
      totalExpenseAcrossAccounts,
      allAccountsBalance,
    } = res;
    document.querySelector(".skeleton-penny-info").style.display = "none";
    document.querySelector(".penny-info").style.display = "flex";
    document.querySelector(".skeleton-title").style.display = "none";
    document
      .querySelectorAll(".deactivate")
      .forEach((i) => (i.style.display = "flex"));
    existingAccounts.innerHTML = " ";
    // existingAccounts.innerHTML = "<h3>Accounts</h3>";
    renderAccounts(userAccounts);
    accountPageIn.lastChild.textContent =
      totalIncomeAcrossAccounts.toLocaleString();
    accountPageEx.lastChild.textContent =
      totalExpenseAcrossAccounts.toLocaleString();
    document.querySelector(".account-total-amount").lastChild.textContent =
      allAccountsBalance.toLocaleString();
    if (allAccountsBalance < 0) {
      document.querySelector(".account-total-amount").classList.add("red");
      document.querySelector(".account-total-amount").classList.remove("green");
    } else {
      document.querySelector(".account-total-amount").classList.remove("red");
      document.querySelector(".account-total-amount").classList.add("green");
    }
    reloadFunctionality();
  }
}
let deferredPrompt;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
});
let downloadApp = document.querySelector(".download-app");
downloadApp.addEventListener("click", async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
  }
});
//FUNCTIONALITY FOR REST INPUT CONTAINER HOME
export function resetInputContainer() {
  document.querySelector(".account-body .child-body").dataset.id = "7876543310";
  document.querySelector(".category-body .child-body").dataset.id =
    "2876543210";
  document.querySelector(".calc-values").textContent = "";
  document.querySelector(".calc-answer").innerHTML = "";
  document.getElementById("description-notes").value = "";
  document.querySelector(".account-body .child-body p").textContent =
    "Accounts";
  document.querySelector(".category-body .child-body p").textContent =
    "Categories";
  document
    .querySelector(".child-body img")
    .setAttribute("src", "icons/account.svg");
  document
    .querySelector(".category-body .child-body img")
    .setAttribute("src", "icons/category.svg");
  let saveBtn = document.querySelector(".add-transcation-save-btn");
  saveBtn.lastElementChild.textContent = "SAVE";
  saveBtn.classList.remove("update-transaction");
  let categoryTick = document.querySelectorAll(".sub-head-one li");
  categoryTick.forEach((cat) => {
    cat.firstElementChild.setAttribute("src", "");
  });
  categoryTick[1].firstElementChild.setAttribute("src", "icons/tick.svg");
}
export async function loadHeaderInfo(month) {
  let req = await fetch(
    `https://penny-partner.onrender.com/api/v1/users/headerInfo?month=${month}`
  );
  if (req.status == 200) {
    let { incomeTotal, expenseTotal, overAllTotal } = await req.json();
    const dataMap = {
      ".expense-box p+p": expenseTotal,
      ".income-box p+p": incomeTotal,
      ".total-box p+p": overAllTotal,
    };
    for (const [selector, value] of Object.entries(dataMap)) {
      document.querySelectorAll(selector).forEach((tag) => {
        tag.lastChild.textContent = value; // Update the content of each tag
        if (tag.parentElement.classList.contains("total-box")) {
          if (value < 0) {
            tag.classList.remove("green");
            tag.classList.add("red");
          } else {
            tag.classList.remove("red");
            tag.classList.add("green");
          }
        }
      });
    }
  }
}
loadHeaderInfo(document.querySelectorAll(".month")[0].textContent.trim());
let sections = document.querySelectorAll(".side-footer ul li");
sections.forEach((section) => {
  section.addEventListener("click", () => {
    sections.forEach((e) => e.classList.remove("active"));
    section.classList.add("active");
  });
});
