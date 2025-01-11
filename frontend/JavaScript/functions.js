import { loadData } from "./home.js";
import { closeEditBox, closeAccountBox, loadAccountsData } from "./script.js";
let userCurrency = JSON.parse(localStorage.getItem("currency"));

let accountsList = document.querySelectorAll(".account-list li");
let editBtns = document.querySelectorAll(".edit-btn");

let options = document.querySelectorAll(".operations .options");
let accountPage = document.querySelector(".account");

//Global variables
let selectedCard = "";
let accountImg = "";
let clickedBtn;
export function reloadFunctionality() {
  let dots = document.querySelectorAll(".operations .dot");
  let options = document.querySelectorAll(".operations .options");
  let editBtns = document.querySelectorAll(".edit-btn");
  let accountsList = document.querySelectorAll(".account-list li");
  let accountDelBtn = document.querySelectorAll(".delete-account");
  let addAccountBtn = document.querySelector(".add-box");
  let accountBox = document.querySelector(".box-body");
  let accountPage = document.querySelector(".account");

  addAccountBtn.addEventListener("click", () => {
    closeEditBox();
    accountBox.classList.add("active");
    accountPage.classList.add("blurbg");
  });

  //delete account
  accountDelBtn.forEach((account) => {
    account.addEventListener("click", () => {
      account.parentElement.parentElement.parentElement.remove();

      deleteAccountDb(account.parentElement.dataset.accountId);
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

  //edit account
  editBtns.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      const accountName =
        btn.parentElement.parentElement.parentElement.children[0].children[1]
          .children[0].textContent;

      const amount = btn.dataset.balance;
      clickedBtn = btn;

      options[index].classList.remove("active");
      selectedCard = btn.parentElement.parentElement.parentElement;

      accountsList.forEach((account) => {
        if (
          account.children[0].getAttribute("src") ==
          selectedCard.children[0].children[0].getAttribute("src")
        ) {
          accountImg = account.children[0].getAttribute("src");
          account.classList.add("active");
        } else {
          account.classList.remove("active");
        }
      });
      openEditPanael(accountName, amount);
    });
  });
}

//Save functionality------------------------------------------------------
export function saveAccount() {
  closeAccountBox();
  let initialAmount =
    document.getElementById("initial-amount").value.trim() || 0;
  let balance = initialAmount;
  let accountName = document.getElementById("account-name").value.trim();
  if (isNaN(initialAmount)) {
    initialAmount = 0;
  }
  if (accountName === "" || accountName.lenght < 0) {
    return;
  }
  let icon = "";
  accountsList.forEach((account) => {
    if (account.classList.contains("active")) {
      icon = account.children[0].getAttribute("src");
    }
  });
  let existingAccounts = document.querySelector(".accounts");
  let template = `<li class="card">
                <div class="card-body">
                  <img class='icon' src="${icon}" alt="" />
                  <div class="card-info">
                    <p class="bold">${accountName}</p>
                    <p>Balance: <span class="green bold"><span class="currency-symbol">${JSON.parse(
                      localStorage.getItem("currency")
                    )}</span> ${
    balance == 0 ? "0" : balance.toLocaleString("en-IN")
  }</span></p>
                  </div>
                </div>
                <div class="operations">
                  <img class="dot svg" src="icons/dot.svg" alt="" />
                  <div class="options">
                    <p class="edit-btn">Edit</p>
                    <p class="delete-account">Delete</p>
                  </div>
                </div>
              </li>`;
  existingAccounts.innerHTML += template;
  document.getElementById("initial-amount").value = "";
  document.getElementById("account-name").value = "";
  reloadFunctionality();

  let data = {
    accountName,
    balance,
    icon,
  };

  saveAccountDb(data);
}

//update functionality---------------------------------------------

export function updateAccount() {
  let currency = JSON.parse(localStorage.getItem("currency"));
  accountPage.classList.remove("blur");
  closeEditBox();
  let updatedAmount = document.getElementById("edit-amount").value.trim();
  let updatedAccountName = document
    .getElementById("edit-account-name")
    .value.trim();

  let imageSrc = "";
  accountsList.forEach((account) => {
    if (account.classList.contains("active")) {
      imageSrc = account.children[0].getAttribute("src");
    }
  });

  selectedCard.children[0].children[0].setAttribute("src", imageSrc);
  if (isNaN(updatedAmount) || updatedAccountName.length === 0) return;

  let formatedAmount = Number(updatedAmount);
  selectedCard.children[0].children[1].children[0].innerHTML =
    updatedAccountName;

  selectedCard.children[0].children[1].children[1].children[0].innerHTML =
    formatedAmount == 0
      ? `<span class='currency-symbol'>${currency}</span> 0`
      : `<span class='currency-symbol'>${currency}</span> ` +
        formatedAmount.toLocaleString("en-IN");

  const accountId =
    selectedCard.lastElementChild.lastElementChild.dataset.accountId;
  let updatedData = {
    icon: imageSrc,
    accountName: updatedAccountName,
    balance: updatedAmount,
  };

  clickedBtn.dataset.balance = updatedAmount;

  updateAccountDb(updatedData, accountId);
}

//edit account functainolity
editBtns.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    const accountName =
      btn.parentElement.parentElement.parentElement.children[0].children[1]
        .children[0].textContent;

    const amount = 1234567890;

    options[index].classList.remove("active");
    selectedCard = btn.parentElement.parentElement.parentElement;

    accountsList.forEach((account) => {
      if (
        account.children[0].getAttribute("src") ==
        selectedCard.children[0].children[0].getAttribute("src")
      ) {
        accountImg = account.children[0].getAttribute("src");
        account.classList.add("active");
      } else {
        account.classList.remove("active");
      }
    });
    openEditPanael(accountName, amount);
  });
});

function openEditPanael(account, amount) {
  document.querySelector(".account-container").classList.add("blur");

  let acutalAmount = amount.replace(/,/g, "");
  let editAmount = document.getElementById("edit-amount");
  let editAccountName = document.getElementById("edit-account-name");
  editAmount.value = acutalAmount;
  editAccountName.value = account;
  document.querySelector(".edit-box-body").classList.add("active");
  editAmount.focus();
}

//-------DATABASE OPERATIONS ----------------------------------

// 1) SAVE FUNCTIONALITY
async function saveAccountDb(data) {
  let req = await fetch(
    ` https://penny-partner.onrender.com/api/v1/users/accounts`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
  let res = await req.json();

  if (res.status === "success") {
    loadAccountsData();
  }
}

// 2) UPDATE FUCTIONALITY

export async function updateAccountDb(data, accountId) {
  let req = await fetch(
    ` https://penny-partner.onrender.com/api/v1/users/accounts/${accountId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
  let res = await req.json();
  if (req.status === 200) {
    loadAccountsData();
  }
}

export async function updateAccountBalanceDb(data, accountId) {
  let req = await fetch(
    ` https://penny-partner.onrender.com/api/v1/users/accounts/balance/${accountId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
  let res = await req.json();
}

// 3) DELETE FUCTIONALITY

async function deleteAccountDb(accountId) {
  let req = await fetch(
    ` https://penny-partner.onrender.com/api/v1/users/accounts/${accountId}`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    }
  );
  loadAccountsData();
  loadData(document.querySelectorAll(".month")[0].textContent);
}

// TRANSACTION TEMPLATES
export function normalTemplate(data) {
  let template = `
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
                  <small style="display: none;" >${data.description}</small>
                `;
  return template;
}

export function transferTemplate(data) {
  let template = `
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
  return template;
}

export function toReadableDate(createdAt) {
  const date = new Date(createdAt);

  // Format the date
  const options = {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };
  const formattedDate = date.toLocaleString("en-US", options).replace(",", "");
  return formattedDate;
}

export function setHeaderInfo(income, expense) {
  // Set the text content for the expense boxes
  document.querySelector(
    ".expense-box"
  ).lastElementChild.lastChild.textContent = parseFloat(
    expense.toFixed(1)
  ).toLocaleString();
  document.querySelectorAll(
    ".expense-box"
  )[1].lastElementChild.lastChild.textContent = parseFloat(
    expense.toFixed(1)
  ).toLocaleString();

  // Set the text content for the income boxes
  document.querySelector(".income-box").lastElementChild.lastChild.textContent =
    parseFloat(income.toFixed(1)).toLocaleString();
  document.querySelectorAll(
    ".income-box"
  )[1].lastElementChild.lastChild.textContent = parseFloat(
    income.toFixed(1)
  ).toLocaleString();

  // Set the text content for the total boxes
  const total = (income - expense).toFixed(1).toLocaleString();
  document.querySelector(".total-box").lastElementChild.lastChild.textContent =
    parseFloat(total).toLocaleString();
  document.querySelectorAll(
    ".total-box"
  )[1].lastElementChild.lastChild.textContent =
    parseFloat(total).toLocaleString();
}

export function resetHeaderInfo() {
  // Set the text content for the expense boxes
  document.querySelector(
    ".expense-box"
  ).lastElementChild.lastChild.textContent = "0.00";
  document.querySelectorAll(
    ".expense-box"
  )[1].lastElementChild.lastChild.textContent = "0.00";

  // Set the text content for the income boxes
  document.querySelector(".income-box").lastElementChild.lastChild.textContent =
    "0.00";
  document.querySelectorAll(
    ".income-box"
  )[1].lastElementChild.lastChild.textContent = "0.00";

  // Set the text content for the total boxes

  document.querySelector(".total-box").lastElementChild.lastChild.textContent =
    "0.00";
  document.querySelectorAll(
    ".total-box"
  )[1].lastElementChild.lastChild.textContent = "0.00";
}
