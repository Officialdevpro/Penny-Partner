import visualizeData from "./analysis.js";
import loadDataBudgets from "./budget.js";
import {
  normalTemplate,
  resetHeaderInfo,
  setHeaderInfo,
  toReadableDate,
  transferTemplate,
} from "./functions.js";
import { loadHeaderInfo, resetInputContainer } from "./script.js";
import { generateTimeStamp } from "./userInfo.js";

if (window.matchMedia("(display-mode: standalone)").matches) {
  document.querySelector(".download-app").remove();
}

let userCurrency = JSON.parse(localStorage.getItem("currency"));
function goFullscreen() {
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen();
  } else if (document.documentElement.webkitRequestFullscreen) {
    /* Safari */
    document.documentElement.webkitRequestFullscreen();
  } else if (document.documentElement.msRequestFullscreen) {
    /* IE11 */
    document.documentElement.msReq;
    uestFullscreen();
  }
}

function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
}

// ==============================================
let expenseCategories;
let incomeCategories;
let accounts;
let transactionHistory;
let previousAmount;
let previousFromAccount;
let previousToAccount;
let previousType;
async function getAccountsAndCategories() {
  let req = await fetch(`http://localhost:4000/api/v1/users//data`);
  let res = await req.json();

  if (res.status === "success") {
    expenseCategories = res.expenseCategories;
    incomeCategories = res.incomeCategories;
    accounts = res.accounts;
    changeCategory(1);

    loadUserAccounts(accounts);
  }
}
getAccountsAndCategories();
let saveBtn = document.querySelector(".add-transcation-save-btn");

saveBtn.addEventListener("click", transactionSave);

document.querySelector(".plus").addEventListener("click", () => {
  getAccountsAndCategories();
  resetInputContainer();

  if (
    document
      .querySelector(".add-transcation-save-btn")
      .classList.contains("update-transaction")
  ) {
    document
      .querySelector(".update-transaction")
      .removeEventListener("click", eaddEventListener);
    document
      .querySelector(".add-transcation-save-btn")
      .classList.remove("update-transaction");
    saveBtn.lastElementChild.textContent = "SAVE";
  }
});

function loadUserAccounts(data) {
  let totalAccountBalance = 0;

  let existingAccounts = document.querySelector(".parent-box");
  existingAccounts.innerHTML = "";
  data.forEach((item) => {
    totalAccountBalance += item.balance;

    let template = `<li data-account-id="${item._id}" class="bunch-account">
                  <div class="left-part">
                    <img src="${item.accountImage}" alt="${item.accountName}">
                    <p class="semi-bold">${item.accountName}</p>
                  </div>
                  <p class="semi-bold green"><span class="currency-symbol">${JSON.parse(
                    localStorage.getItem("currency")
                  )}</span> ${item.balance}</p>
                </li>`;
    existingAccounts.innerHTML += template;
    accountEventListener();
    changeAndUpdate();
    document.querySelector(".account-total-amount").lastChild.textContent =
      totalAccountBalance.toLocaleString();
  });
}

let fullScreenMode = document.querySelector(".view-mode");
fullScreenMode.addEventListener("click", () => {
  fullScreenMode.classList.toggle("activate");

  if (fullScreenMode.classList.contains("activate")) {
    goFullscreen();
  } else {
    exitFullscreen();
  }
});

let mainContent = document.querySelector(".main-content");
let clickedView;
let categoryTicked = document.getElementById("category-ticked");
let dataAnalysContainer = document.querySelector(".data-container");
let analysisOpt = document.querySelectorAll(".category-options p");
let currentView = document.querySelector(".current-view");
let detailView = document.querySelector(".parent-detail-view");
let addItem = document.querySelector(".add-item");
let InputBoxClose = document.querySelector(".input-box-close");
let selectAccountBtn = document.querySelector(".sub-head-two .account-body");
let selectCatBtn = document.querySelector(".sub-head-two .category-body");
let selectAccountBody = document.querySelector(".account-options-body");

let categoryTick = document.querySelectorAll(".sub-head-one li");
let selectedCatImg = document.querySelector(".category-body .child-body img");
let selectedCatName = document.querySelector(".category-body .child-body p");
let saveTransactionBtn = document.querySelector(".add-transcation-save-btn");
let deleteHis = document.getElementsByClassName("delete-history");
let selectedCatBody = document.querySelector(".category-options-body");
let showReviews = document.querySelector(".rating-reviews");
let rrContainer = document.querySelector(".rr-container");
let myAccount = document.querySelector(".my-account-container");
let myAccountBtn = document.querySelector(".show-my-account");
let addtransactonAccImg = document.querySelector(
  ".account-body .child-body img"
);
let addtransactonAccName = document.querySelector(
  ".account-body .child-body p"
);
let categoryOptions = document.querySelector(
  ".category-options-body .parent-box"
);

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
let income = 0;
let expense = 0;
function childTemplate(transactions) {
  let content = "";

  transactions.forEach((item) => {
    if (item.type == "income") {
      income += item.amount;
    } else if (item.type == "expense") {
      expense += item.amount;
    }

    if (item.type == "transfer") {
      let transferTemplate = `<li data-transaction-id="${
        item._id
      }" data-user-id="${item.userId}"  data-account-id="${
        item.account[0]._id
      }" data-time="${item.createdAt}"  data-to-account="${
        item.toAccount[0]._id ? item.toAccount[0]._id : "no id for 💥"
      }">
                      <div class="transaction-info">
                        <img
                          src="icons/Income-expense/transfer.jpg"
                          alt=""
                          class="transaction-icon"
                        />
                        <div class="cat-account">
                          <div class="category-name little-bold">Transfer</div>
                          <div class="transaction-account-info">
                            <img
                              src="${item.account[0].icon}"
                              alt=""
                              class="account-icon"
                            />
                             <small class="account-name">${
                               item.account[0].accountName
                             }</small>
                              <img
                              src="icons/tarrow.svg"
                              alt=""
                              class="transfer-arrow"
                            />
                            <img
                              src="${item.toAccount[0].icon}"
                              alt=""
                              class="account-icon"
                            />
                             <small class="account-name">${
                               item.toAccount[0].accountName
                             }</small>
                          </div>
                        </div>
                      </div>
                     
                      <div class="transaction-amount">
                        <p class="amount ${
                          item.type
                        }"><span class="currency-symbol">${userCurrency}</span>${item.amount.toLocaleString()}</p>
                      </div>
                       <small style="display: none;" >${
                         item.description
                       }</small>
                    </li>`;
      content += transferTemplate;
    } else {
      let template = `<li data-transaction-id="${item._id}" data-user-id="${
        item.userId
      }" data-category-id="${item.category[0]._id}" data-account-id="${
        item.account[0]._id
      }" data-time="${item.createdAt}">
                      <div class="transaction-info">
                        <img
                          src="${item.category[0].image}"
                          alt=""
                          class="transaction-icon"
                        />
                        <div class="cat-account">
                          <div class="category-name little-bold">${
                            item.category[0].name
                          }</div>
                          <div class="transaction-account-info">
                            <img
                              src="${item.account[0].icon}"
                              alt=""
                              class="account-icon"
                            />
                            <small class="account-name">${
                              item.account[0].accountName
                            }</small>
                          </div>
                        </div>
                      </div>
                    
                      <div class="transaction-amount">
                        <p class="amount ${
                          item.category[0].type
                        }"><span class="currency-symbol">${userCurrency}</span>${item.amount.toLocaleString()}</p>
                      </div>
                      <small style="display: none;" >${item.description}</small>
                    </li>`;
      content += template;
    }
  });

  return content;
}
function parentTemplate(ISOformat, transactions) {
  const date = new Date(ISOformat);
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  const finalFormattedDate = `${formattedDate}, ${weekday}`;

  let template = `<div class="sub-content">
                <div class="added-day-info semi-bold">${finalFormattedDate}</div>
                <ul class="transaction-history">
                  ${childTemplate(transactions)}
                </ul>
              </div>`;
  mainContent.innerHTML += template;

  setHeaderInfo(income, expense);
}

analysisOpt.forEach((opt) => {
  opt.addEventListener("click", (e) => {
    document.querySelector(".category-options").classList.remove("active");
    currentView.innerHTML = e.target.textContent.toUpperCase();
  });
});

function openDetailView() {
  document.querySelector(".parent-detail-view").classList.add("active");
  let incomeName = document.querySelector(".category-name-detail");
  let amount = document.querySelector(".respective-amount");
  let notes = document.querySelector(".notes p");
  let accountImg = document.querySelector(".accountImg");
  let categoryImg = document.querySelector(".categoryImg");
  let card = document.querySelector(".card-top");
  let cInfo = document.querySelector(".c-info");
  let aInfo = document.querySelector(".a-info");
  let cardOperations = document.querySelector(".card-operations");
  let type = document.querySelector(".category-name-detail");

  if (clickedView.dataset.time) {
    document.querySelector(".date-time-details").innerHTML = toReadableDate(
      clickedView.dataset.time
    );
  } else {
    document.querySelector(".date-time-details").innerHTML =
      generateTimeStamp();
  }

  if (
    card.classList.contains("incomeBg") ||
    card.classList.contains("expenseBg")
  ) {
    card.classList.remove("incomeBg");
    card.classList.remove("expenseBg");
  }

  notes.textContent = clickedView.lastElementChild.textContent;
  amount.lastChild.textContent =
    clickedView.children[1].children[0].lastChild.textContent;

  incomeName.textContent = "";
  accountImg.setAttribute(
    "src",
    clickedView.children[0].children[1].lastElementChild.children[0].getAttribute(
      "src"
    )
  );
  categoryImg.setAttribute(
    "src",
    clickedView.children[0].children[0].getAttribute("src")
  );
  aInfo.textContent =
    clickedView.children[0].children[1].lastElementChild.children[1].textContent;
  cInfo.textContent =
    clickedView.children[0].children[1].children[0].textContent;
  cardOperations.dataset.transactionId = clickedView.dataset.transactionId;
  card.classList.add(
    `${clickedView.children[1].children[0]
      .getAttribute("class")
      .split(" ")
      .slice(1)}` + "Bg"
  );
  type.textContent = `${clickedView.children[1].children[0]
    .getAttribute("class")
    .split(" ")
    .slice(1)}`;
  previousAmount = clickedView.children[1].children[0].textContent
    .trim()
    .slice(1);
  if (
    clickedView.children[1].children[0]
      .getAttribute("class")
      .split(" ")
      .slice(1)[0] == "transfer"
  ) {
    previousFromAccount = clickedView.dataset.accountId;
    previousToAccount = clickedView.dataset.toAccount;
  }
  previousToAccount = clickedView.dataset.toAccount;
  previousFromAccount = clickedView.dataset.accountId;
  previousType = `${clickedView.children[1].children[0]
    .getAttribute("class")
    .split(" ")
    .slice(1)}`;
}

document.addEventListener("click", (e) => {
  let viewLi = document.querySelectorAll(".sub-content li");
  let isList = true;
  viewLi.forEach((li) => {
    if (li.contains(e.target)) {
      isList = false;
    }
  });
  try {
    if (
      !document.querySelector(".detail-view-container").contains(e.target) &&
      isList
    ) {
      detailView.classList.remove("active");
    }
  } catch (err) {
    console.log(err);
  }
});

addItem.addEventListener("click", () => {
  selectAccountBody.classList.remove("active");
  selectedCatBody.classList.remove("active");
  document.querySelector(".input-containers").classList.add("active");
});
InputBoxClose.addEventListener("click", () => {
  document.querySelector(".input-containers").classList.remove("active");
});
window.addEventListener("popstate", (e) => {
  document.querySelector(".input-containers").classList.remove("active");
});
let calcBtns = document.querySelectorAll(".btns");
let values = document.querySelector(".calc-values");
let result = document.querySelector(".calc-answer");

calcBtns.forEach((btn) => {
  let query = "";
  btn.addEventListener("click", () => {
    try {
      if (btn.value == "=") {
        values.textContent = result.textContent;
        result.innerHTML = "";
        query = eval(query);
        return;
      } else if (btn.value === "c") {
        values.innerHTML = "";
        query = "";
        result.innerHTML = "";
        return;
      }
      values.innerHTML += btn.value;

      result.innerHTML = eval(values.textContent);
    } catch (e) {
      console.log(e);
    }
  });
});

selectAccountBtn.addEventListener("click", () => {
  selectedCatBody.classList.remove("active");
  selectAccountBody.classList.toggle("active");
});

function accountEventListener() {
  let bunchAccounts = document.querySelectorAll(".bunch-account");
  bunchAccounts.forEach((acc) => {
    acc.addEventListener("click", () => {
      selectAccountBody.classList.remove("active");
      let selectedAccountId = acc.dataset.accountId;

      document.querySelector(".account-body .child-body").dataset.id =
        selectedAccountId;

      let accountName = acc.firstElementChild.children[1].textContent;
      addtransactonAccImg.setAttribute(
        "src",
        acc.firstElementChild.children[0].getAttribute("src")
      );
      addtransactonAccName.textContent =
        accountName.length > 6 ? accountName.slice(0, 6) + ".." : accountName;
    });
  });
}

selectCatBtn.addEventListener("click", () => {
  selectAccountBody.classList.remove("active");
  selectedCatBody.classList.toggle("active");
});

function changeAndUpdate() {
  let bunchCategory = document.querySelectorAll(".bunch-category");
  bunchCategory.forEach((cat) => {
    cat.addEventListener("click", () => {
      let selectedCatId;
      if (cat.classList.contains("transfer")) {
        selectedCatBody.classList.remove("active");
        selectedCatId = cat.dataset.accountId;

        document.querySelector(".category-body .child-body").dataset.id =
          selectedCatId;
        selectedCatImg.setAttribute(
          "src",
          cat.firstElementChild.children[0].getAttribute("src")
        );

        selectedCatImg.classList.add("imgSvg");
        let categoryName = cat.firstElementChild.children[1].textContent;
        selectedCatName.textContent =
          categoryName.length > 8
            ? categoryName.slice(0, 8) + ".."
            : categoryName;
      } else {
        selectedCatBody.classList.remove("active");
        selectedCatId = cat.dataset.categoryId;

        document.querySelector(".category-body .child-body").dataset.id =
          selectedCatId;
        selectedCatImg.setAttribute(
          "src",
          cat.firstElementChild.getAttribute("src")
        );
        selectedCatImg.classList.add("imgSvg");
        let categoryName = cat.lastElementChild.textContent;
        selectedCatName.textContent =
          categoryName.length > 8
            ? categoryName.slice(0, 8) + ".."
            : categoryName;
      }
    });
  });
}
let isDoubled = true;

function verification() {
  let accId = document.querySelector(".account-body .child-body").dataset.id;

  let accIdIsSame = accId != "7876543310" ? false : true;
  if (accIdIsSame) {
    let errorData = {
      title: "Account Error",
      message: "Please select an account.",
    };
    showMessage(errorData);
    return false;
  }
  let catId = document.querySelector(".category-body .child-body").dataset.id;

  let catIdIsSame = catId != "2876543210" ? false : true;
  if (catIdIsSame) {
    let errorData = {
      title: "Category Error",
      message: "Please select category.",
    };
    showMessage(errorData);
    return false;
  }
  let amount;
  let isValid = false;
  let calcAnswer = document.querySelector(".calc-values").textContent;
  try {
    if (calcAnswer < 0) {
      let errorData = {
        title: "Negative number",
        message: "Please provide positive number ",
      };
      showMessage(errorData);
      return false;
    } else if (calcAnswer == "" || calcAnswer == 0) {
      let errorData = {
        title: "Amount Error !",
        message: "please enter the amount.. ",
      };
      showMessage(errorData);
      return false;
    }
    amount = eval(calcAnswer);
    isValid = true;
  } catch (err) {
    console.log(err);
    let errorData = {
      title: "Math Error",
      message: "Invalid expression",
    };
    showMessage(errorData);
    return false;
  }

  let description =
    document.getElementById("description-notes").value.trim() || "No notes";

  let accountName = document.querySelector(
    ".account-body .child-body p"
  ).textContent;
  let accountIcon = document
    .querySelector(".child-body img")
    .getAttribute("src");
  let accountId = accId;

  let categoryName = document.querySelector(
    ".category-body .child-body p"
  ).textContent;
  let categoryIcon = document
    .querySelector(".category-body .child-body img")
    .getAttribute("src");
  let categoryId;

  let whatType = "";
  categoryTick.forEach((cat) => {
    if (cat.children[0].getAttribute("src")) {
      if (cat.value == 0) {
        whatType = "income";
      } else if (cat.value == 1) {
        whatType = "expense";
      } else {
        whatType = "transfer";
      }
    }
  });
  if (whatType == "expense") {
    updateBudgetDb(catId, { spend: amount });
  }

  const date = new Date();
  const options = { month: "long", year: "numeric" };
  const month = date.toLocaleDateString("en-US", options);

  const dateOptions = { month: "short", day: "numeric" };
  const formattedDate = new Intl.DateTimeFormat("en-US", dateOptions).format(
    date
  );

  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(
    date
  );

  const finalFormattedDate = `${formattedDate}, ${weekday}`;

  let displayData = {
    accountName,
    accountIcon,
    categoryName,
    categoryIcon,
    amount,
    description,
    type: whatType,
    date: finalFormattedDate,
  };

  //StucturedData to store dataBase
  let sturcturedData = {
    month,
    category: catId,
    account: accId,
    amount,
    description,
    type: whatType,
    toAccount: catId,
  };
  if (whatType == "transfer" && accId === catId) {
    let errorData = {
      title: "Same Account",
      message: "Choose different account",
    };
    showMessage(errorData);
    return false;
  }
  let oldType;
  try {
    oldType = clickedView.children[1].firstElementChild.classList.contains(
      "income"
    )
      ? "income"
      : clickedView.children[1].firstElementChild.classList.contains("expense")
      ? "expense"
      : "transfer";
  } catch (e) {
    oldType = "transfer";
  }

  if (whatType == "transfer" && accId !== catId) {
    return { sturcturedData, displayData };
  }

  return { sturcturedData, displayData };
}

function transactionSave() {
  try {
    let { sturcturedData, displayData } = verification();

    if (sturcturedData) {
      saveRecordToDb(sturcturedData);
      temporaryDisplay(displayData);
      document.querySelector(".input-containers").classList.remove("active");

      deleteView();
    }
  } catch (err) {
    console.log(err);
  }
}

saveTransactionBtn.addEventListener("click", transactionSave);

function showMessage(value) {
  let title = document.querySelector(".message-box .message");
  let text = document.querySelector(".message-box .text");
  text.textContent = value.message;
  title.textContent = value.title;
  //for tostal
  let successWidth = 100;

  document.querySelector(".success-tostal").style.display = "flex";
  const successIntervalId = setInterval(() => {
    document.querySelector(".success-line").style.width =
      successWidth - 1 + "%";
    if (successWidth <= -10) {
      clearInterval(successIntervalId);
      document.querySelector(".success-tostal").style.display = "none";
      document.querySelector(".success-line").style.width = "100%";
      successWidth = 0;
    }
    successWidth--;
  }, 50);
}
let flag = true;
function deleteView() {
  for (let i = 0; i < deleteHis.length; i++) {
    deleteHis[i].addEventListener("click", () => {
      let deleteId = deleteHis[i].parentElement.dataset.id;
      detailView.classList.remove("active");

      try {
        if (clickedView.parentElement.children.length == 1) {
          clickedView.parentElement.parentElement.remove();
        }
      } catch (err) {
        clickedView.remove();
      } finally {
        if (mainContent.children.length == 0) {
          mainContent.innerHTML = `<div class="no-content-container">
        <img src="images/404.png" alt="" />
        <p>
          No record in this month. Tap + to add new expense or income.
        </p>
      </div>`;
        }

        clickedView.remove();

        // updateBudgetDb(clickedView.dataset.categoryId, { spend: 0 });
        if (flag) {
          let amount;
          let deletedElement = clickedView.children[1];
          let transactionType;
          try {
            amount = Number(
              deletedElement.children[0].lastChild.textContent
                .trim()
                .replace(/,/g, "")
            );
            transactionType =
              deletedElement.firstElementChild.classList.contains("income")
                ? "income"
                : deletedElement.firstElementChild.classList.contains("expense")
                ? "expense"
                : "transfer";
          } catch (error) {
            transactionType = "transfer";
            amount = Number(
              clickedView.firstElementChild.children[1].children[0].lastChild.textContent
                .trim()
                .replace(/,/g, "")
            );
          }
          // Determine the transaction type

          deleteRecordToDb(clickedView.dataset.transactionId);
          flag = false;
          setInterval(() => {
            flag = true;
          }, 100);
        }
      }
    });
  }
}

let catLabel = document.querySelector(".category-body p");
categoryTick.forEach((item, index) => {
  item.addEventListener("click", () => {
    document.querySelector(
      ".category-body .child-body"
    ).dataset.id = 2876543210;

    selectedCatImg.setAttribute("src", "icons/category.svg");
    // selectedCatImg.style.filter = "invert(0)";
    selectedCatImg.classList.add("imgSvg");
    selectedCatName.textContent = "Category";
    categoryTick.forEach((cat) => cat.children[0].removeAttribute("src"));
    categoryTick[index].children[0].setAttribute("src", "icons/tick.svg");
    if (categoryTick[index].value == 0) {
      catLabel.textContent = "Category";
      categoryTicked.value = 0;
      changeCategory(0);
    } else if (categoryTick[index].value == 1) {
      catLabel.textContent = "Category";
      categoryTicked.value = 1;
      changeCategory(1);
    } else {
      catLabel.textContent = "Account";
      categoryTicked.value = 2;
      selectedCatImg.setAttribute("src", "icons/account.svg");
      selectedCatImg.style.filter = "invert(0)";
      selectedCatName.textContent = "Account";
      changeCategory(2);
    }
    changeAndUpdate();
  });
});

//Functionality for review page
showReviews.addEventListener("click", () => {
  document.querySelector(".sidebar").classList.remove("active");
  rrContainer.classList.toggle("active");
});

// Back butn functionality

let backBtn = document.querySelector(".review-back-btn");
let reviewBox = document.querySelector(".review-input-container");

backBtn.addEventListener("click", goHomePage);

function goHomePage() {
  if (
    reviewBox.classList.contains("active") &&
    rrContainer.classList.contains("active")
  ) {
    reviewBox.classList.remove("active");
  } else {
    rrContainer.classList.remove("active");
  }
}

myAccountBtn.addEventListener("click", () => {
  document.querySelector(".chart-type-container").classList.remove("closed");

  myAccount.classList.add("active");
});

document.querySelector(".account-back-btn").addEventListener("click", () => {
  if (
    document.querySelector(".privacy-container").classList.contains("active")
  ) {
    document.querySelector(".privacy-container").classList.remove("active");
    return;
  }
  myAccount.classList.remove("active");
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
document
  .querySelectorAll(".month")
  .forEach((head) => (head.innerHTML = `${months[month]} ${year}`));

// Function to update the date
function changeDate(increament, index) {
  month = month + increament;

  if (month > 11) {
    month = 0;
    year++;
  }
  if (month < 0) {
    year--;
    month = 11;
  }

  // Display the updated date
  document
    .querySelectorAll(".month")
    .forEach((head) => (head.innerHTML = `${months[month]} ${year}`));
  loadData(`${months[month]} ${year}`);

  let type = document
    .querySelector(".current-view")
    .textContent.toLowerCase()
    .trim()
    .split(" ")[0];

  if (index == 1) {
    visualizeData(type, `${months[month]} ${year}`);
  } else if (index == 2) {
    loadDataBudgets(`${months[month]} ${year}`);
  }
}

// Initial date display

let leftArrows = document.querySelectorAll(".header-left-space");
let rightArrows = document.querySelectorAll(".header-right-space");
leftArrows.forEach((larrow, index) => {
  larrow.addEventListener("click", () => {
    changeDate(-1, index);
  });
});
rightArrows.forEach((rarrow, index) => {
  rarrow.addEventListener("click", () => {
    changeDate(1, index);
  });
});
let flag3 = true;
function reloadDetailveiw() {
  let viewLi = document.querySelectorAll(".transaction-history li");

  viewLi.forEach((li) => {
    li.addEventListener("click", () => {
      clickedView = li;
      let id = li.dataset.transactionId;
      if (flag3) {
        flag3 = false;
        openDetailView();
        setTimeout(() => {
          flag3 = true;
        }, 1000);
      }
    });
  });
}

let navIcons = document.querySelectorAll(".side-footer .menu li");
let pages = document.querySelectorAll("main section");
navIcons.forEach((icon, index) => {
  icon.addEventListener("click", () => changePage(icon, index));
});

function changePage(page, index) {
  pages.forEach((page) => page.classList.remove("active"));
  pages[index].classList.add("active");
}

// PUT THIS FUNCTION CALL ON TOP OF THE HEAD*******//////****+++++++------------$#########################@@@@@@@@@@@@!!!!!!!!!! */

//--------------READ RECORDS--------------------------
export async function loadData(month) {
  document
    .querySelectorAll(".home-skeleton-effect")
    .forEach((i) => (i.style.display = "block"));

  try {
    let req = await fetch(
      `http://localhost:4000/api/v1/users//transactions/?month=${month}`
    );
    let res = await req.json();
    if (res.status === "success") {
      document
        .querySelectorAll(".home-skeleton-effect")
        .forEach((i) => (i.style.display = "none"));
      document.querySelector(".home-container header").style.display = "flex";
      let { data } = res;
      transactionHistory = data;
      income = 0;
      expense = 0;
      if (data.length > 0) {
        mainContent.innerHTML = " ";
        data.forEach((record) => {
          parentTemplate(record._id, record.transactions);
          reloadDetailveiw();
          deleteView();
        });
      } else {
        mainContent.innerHTML = `<div class="no-content-container">
        <img src="images/404.png" alt="" />
        <p>
          No record in this month. Tap + to add new expense or income.
        </p>
      </div>`;
        resetHeaderInfo();
      }
    }
  } catch (err) {
    console.log(err);
  }
}
const date = new Date();
const options = { month: "long", year: "numeric" };
const formatedMonth = date
  .toLocaleDateString("en-US", options)
  .replace(" ", "%20");

loadData(formatedMonth);

//--------------UPDATE RECORDS--------------------------
async function updateRecordToDb(transactionId, data) {
  data.previousAmount = Number(previousAmount.replace(/,/g, ""));
  data.previousType = previousType;
  data.previousFromAccount = previousFromAccount;
  data.previousToAccount = previousToAccount;

  try {
    let response = await fetch(
      ` http://localhost:4000/api/v1/users//transactions/${transactionId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

    // Check if deletion was successful
    if (response.status === 200) {
      let res = await response.json();

      clickedView.dataset.accountId = res.updatedTransaction.account;
      clickedView.dataset.categoryId = res.updatedTransaction.category;
      clickedView.dataset.toAccount = res.updatedTransaction.toAccount;
      loadHeaderInfo(document.querySelectorAll(".month")[0].textContent);
    } else {
      const errorData = await response.json();
      console.error("Failed to update:", errorData);
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
  previousFromAccount = null;
  previousToAccount = null;
  previousType = "null";
  previousAmount = "0";
}

//--------------DELETE RECORDS--------------------------
async function deleteRecordToDb(transactionId) {
  try {
    let response = await fetch(
      ` http://localhost:4000/api/v1/users//transactions/${transactionId}`,
      {
        method: "DELETE",
      }
    );

    // Check if deletion was successful
    if (response.status === 204) {
      loadHeaderInfo(document.querySelectorAll(".month")[0].textContent);

      previousFromAccount = null;
      previousToAccount = null;
      previousType = "null";
      previousAmount = "0";
    } else {
      const errorData = await response.json();
      console.error("Failed to delete:", errorData);
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

//--------------SAVE RECORDS--------------------------
async function saveRecordToDb(data) {
  try {
    let response = await fetch(
      ` http://localhost:4000/api/v1/users//transactions`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

    if (response.status === 201) {
      let { newTransaction } = await response.json();

      document.getElementById("recently-added").dataset.transactionId =
        newTransaction._id;
      document.getElementById("recently-added").dataset.userId =
        newTransaction.userId;
      document.getElementById("recently-added").dataset.accountId =
        newTransaction.account;
      document.getElementById("recently-added").dataset.categoryId =
        newTransaction.category;
      document.getElementById("recently-added").dataset.dateTime =
        newTransaction.createdAt;
      document.getElementById("recently-added").dataset.toAccount =
        newTransaction.toAccount;
      loadHeaderInfo(document.querySelectorAll(".month")[0].textContent);
    } else {
      const errorData = await response.json();
      console.error("Failed to delete:", errorData);
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

function changeCategory(num) {
  categoryOptions.innerHTML = " ";
  if (num == 1) {
    document.querySelector(".category-options-body h2").innerHTML =
      "Select Category";
    expenseCategories.forEach((cat) => {
      let template = `<li data-category-id=${cat._id} class="bunch-category">
                        <img src="${cat.image}" alt="" />
                        <small>${
                          cat.name.length > 8
                            ? cat.name.slice(0, 6) + ".."
                            : cat.name
                        }</small>
                      </li>`;
      categoryOptions.innerHTML += template;
    });
  } else if (num == 0) {
    document.querySelector(".category-options-body h2").innerHTML =
      "Select Category";
    incomeCategories.forEach((cat) => {
      let template = `<li data-category-id=${cat._id} class="bunch-category">
                        <img src="${cat.image}" alt="" />
                        <small>${cat.name}</small>
                      </li>`;
      categoryOptions.innerHTML += template;
    });
  } else {
    document.querySelector(".category-options-body h2").textContent =
      "Select Account";
    accounts.forEach((cat) => {
      let template = `<li data-account-id="${cat._id}" class="bunch-category transfer">
                                          <div class="left-part">
                      <img src="${cat.accountImage}" alt="">
                      <p class="semi-bold">${cat.accountName}</p>
                    </div>
                    <p class="semi-bold green"><span class="currency-symbol">${userCurrency}</span> ${cat.balance}</p>
                  </li>`;

      categoryOptions.innerHTML += template;
    });
  }
  changeAndUpdate();
}

function temporaryDisplay(data) {
  let isCurrentMonth = document.querySelectorAll(".month")[0].textContent;

  let mainContent = document.querySelector(".main-content");
  let template;
  if (
    mainContent.children.length > 0 &&
    mainContent.firstElementChild.firstElementChild.textContent == data.date &&
    isCurrentMonth == formatedMonth.replace("%20", " ")
  ) {
    if (data.type !== "transfer") {
      template = normalTemplate(data);
    } else {
      template = `<li data-transaction-id="<pending>" id="recently-added" data-account-id="">${transferTemplate(
        data
      )}</li>`;
    }
    const li = document.createElement("li");
    li.dataset.transactionId = "<pending>";
    li.innerHTML = template;
    li.id = "recently-added";

    mainContent.firstElementChild.lastElementChild.insertBefore(
      li,
      mainContent.firstElementChild.lastElementChild.firstElementChild
    );
  } else if (mainContent.children.length > 1) {
    if (data.type !== "transfer") {
      template = `
                <div class="added-day-info semi-bold">${data.date}</div>
                <ul class="transaction-history">
                  <li data-transaction-id="<pending>" data-account-id="" id="recently-added">
                   ${normalTemplate(data)}
                  </li>
                </ul>
              `;
    } else {
      template = `
      <div class="added-day-info semi-bold">${data.date}</div>
                <ul class="transaction-history">
                 <li data-transaction-id="<pending>" data-account-id="" id="recently-added">
                 ${transferTemplate(data)}</li>
                </ul>`;
    }
    let div = document.createElement("div");
    div.innerHTML = template;
    div.className = "sub-content";

    mainContent.insertBefore(div, mainContent.firstElementChild);
  } else {
    mainContent.innerHTML = " ";
    if (data.type !== "transfer") {
      mainContent.innerHTML += `
      <div class="sub-content">
      <div class="added-day-info semi-bold">${data.date}</div>
                <ul class="transaction-history">
                  <li data-transaction-id="<pending>" data-account-id="" id="recently-added">
                   ${normalTemplate(data)}
                  </li>
                </ul>
                </div>
      `;
    } else {
      mainContent.innerHTML += `
      <div class="sub-content">
      <div class="added-day-info semi-bold">${data.date}</div>
                <ul class="transaction-history">
                 <li data-transaction-id="<pending>" data-account-id="" id="recently-added">
                 ${transferTemplate(data)}</li>
                </ul>
      </div>`;
    }
  }

  reloadDetailveiw();
}

document.querySelector(".edit-history").addEventListener("click", () => {
  document.querySelector(".category-options-body").classList.remove("active");
  document.querySelector(".account-options-body").classList.remove("active");
  let saveBtn = document.querySelector(".add-transcation-save-btn");
  try {
    saveBtn.removeEventListener("click", transactionSave);
    saveBtn.lastElementChild.textContent = "UPDATE";
    saveBtn.classList.add("update-transaction");
    // saveBtn.classList.remove("add-transcation-save-btn");
  } catch (err) {
    if (!err instanceof TypeError) {
      console.log(err.message);
    }
  }

  eaddEventListener();
  // saveBtn.removeEventListener("click")

  const cardElement = document
    .querySelector(".edit-history")
    .closest(".detail-view-container");

  // Extract the category image source
  const categoryImg = cardElement
    .querySelector(".categoryImg")
    .getAttribute("src");

  // Extract the category name text
  const categoryName = cardElement.querySelector(".c-info").textContent.trim();

  // Extract the notes/description
  const description = cardElement.querySelector(".notes p").textContent.trim();

  // Extract the account name
  const accountName = cardElement.querySelector(".a-info").textContent.trim();

  const type = document.querySelector(".category-name-detail").textContent;

  document.querySelector(".account-body .child-body").dataset.id =
    clickedView.dataset.accountId;

  if (type == "transfer") {
    document.querySelector(".category-body .child-body").dataset.id =
      clickedView.dataset.toAccount;
  } else {
    document.querySelector(".category-body .child-body").dataset.id =
      clickedView.dataset.categoryId;
  }

  // Extract the amount
  const amount = cardElement
    .querySelector(".respective-amount")
    .lastChild.textContent.trim()
    .replace(",", "");

  // Extract the account image source
  const accountImg = cardElement
    .querySelector(".accountImg")
    .getAttribute("src");

  document.getElementById("description-notes").value = description;
  document
    .querySelector(".account-body .child-body img")
    .setAttribute("src", accountImg);
  document.querySelector(".account-body .child-body p").textContent =
    accountName.length > 8 ? accountName.slice(0, 8) + ".." : accountName;

  let iseventBubbling = true;
  let catName =
    categoryName.length > 8 ? categoryName.slice(0, 8) + ".." : categoryName;
  let transferName;

  if (type == "transfer") {
    try {
      transferName =
        clickedView.children[0].children[1].children[1].children[4].textContent.trim();
      document
        .querySelector(".category-body .child-body img")
        .setAttribute(
          "src",
          clickedView.children[0].children[1].children[1].children[3].getAttribute(
            "src"
          )
        );
      iseventBubbling = false;
    } catch (error) {
      if (error instanceof TypeError) {
        transferName =
          clickedView.children[0].children[0].children[1].children[0].textContent.trim();
      } else {
        console.error("An unexpected error occurred:", error);
      }
    }
    document.querySelector(".category-body p").innerHTML = "Account";
  } else {
    document.querySelector(".category-body p").innerHTML = "Category";
    document
      .querySelector(".category-body .child-body img")
      .setAttribute("src", categoryImg);
  }

  document.querySelector(".category-body .child-body p").textContent =
    type !== "transfer"
      ? catName
      : transferName.length > 8
      ? transferName.slice(0, 8) + ".."
      : transferName;

  document.querySelector(".calc-values").textContent = amount;

  const types = {
    income: ".income-body img",
    expense: ".expense-body img",
    transfer: ".transfer-body img",
  };

  Object.entries(types).forEach(([key, val], index) => {
    const img = document.querySelector(val);
    if (type === key) {
      img.setAttribute("src", "icons/tick.svg");
      changeCategory(index);
    } else {
      img.removeAttribute("src");
    }
  });

  document.querySelector(".parent-detail-view").classList.remove("active");
  document.querySelector(".input-containers").classList.add("active");
});
let flag2 = true;
function eaddEventListener() {
  document.querySelector(".calc-values").textContent = "";
  document.querySelector(".calc-answer").textContent = "";
  if (flag2) {
    flag2 = false;
    document
      .querySelector(".update-transaction")
      .addEventListener("click", () => {
        let { sturcturedData, displayData } = verification();

        // delete sturcturedData.date;
        delete sturcturedData.month;
        let saveBtn = document.querySelector(".add-transcation-save-btn");

        try {
          if (sturcturedData) {
            dynamicChange(displayData);
            if (saveBtn.lastElementChild.textContent.trim() == "UPDATE") {
              updateRecordToDb(
                clickedView.dataset.transactionId,
                sturcturedData
              );
            }
          }
        } catch (err) {
          console.log(err);
        }
      });
  }
  setTimeout(() => {
    flag2 = true;
  }, 100);
}

function dynamicChange(data) {
  let element = clickedView;

  if (data.type == "transfer") {
    clickedView.innerHTML = `
    <div class="transaction-info">
    <img
      src="icons/Income-expense/transfer.jpg"
      alt=""
      class="transaction-icon"
    />
    <div class="cat-account">
      <div class="category-name little-bold">Transfer</div>
      <div class="transaction-account-info">
        <img
          src="${data.accountIcon}"
          alt=""
          class="account-icon"
        />
         <small class="account-name">${data.accountName}</small>
          <img
          src="icons/tarrow.svg"
          alt=""
          class="transfer-arrow"
        />
        <img
          src="${data.categoryIcon}"
          alt=""
          class="account-icon"
        />
         <small class="account-name">${data.categoryName}</small>
      </div>
    </div>
  </div>
 
  <div class="transaction-amount">
    <p class="amount ${
      data.type
    }"><span class="currency-symbol">${userCurrency}</span> ${data.amount.toLocaleString()}</p>
  </div>
   <small style="display: none;" >${data.description}</small>`;
  } else {
    clickedView.innerHTML = `
 <div class="transaction-info">
                    <img
                      src="${data.categoryIcon}"
                      alt=""
                      class="transaction-icon"
                    />
                    <div class="cat-account">
                      <div class="category-name little-bold">${
                        data.categoryName
                      }</div>
                      <div class="transaction-account-info">
                        <img
                          src="${data.accountIcon}"
                          alt=""
                          class="account-icon"
                        />
                        <small class="account-name">${data.accountName}</small>
                      </div>
                    </div>
                  </div>
                
                  <div class="transaction-amount">
                    <p class="amount ${
                      data.type
                    }"><span class="currency-symbol">${userCurrency}</span> ${data.amount.toLocaleString()}</p>
                  </div>
                  <small style="display: none;" >${data.description}</small>`;
  }

  document.querySelector(".input-containers").classList.remove("active");
}

//--------------------UPDATE BUDGETS---------------------
async function updateBudgetDb(catId, data) {
  let userId = "66efd1552e03ec45ce74d5fd";
  let req = await fetch(
    ` http://localhost:4000/api/v1/users//budgets/some/${userId}/?categoryId=${catId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
  let res = await req.json();
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".close-card").addEventListener("click", () => {
    document.querySelector(".parent-detail-view").classList.remove("active");
  });
});
