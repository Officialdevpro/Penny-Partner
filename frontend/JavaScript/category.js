import { loadData as reloadHomePage } from "./home.js";
//Skeleton load effect
let incomeElement = document.querySelector(".income-list-skeketon");
let expenseElement = document.querySelector(".expense-list-skeketon");
let skeketon = ` <li>
<div class="left-portion-skeleton">
  <div class="img"></div>
  <p class="change-font-style"></p>
</div>
<div class="right-portion-skeleton">
  <div class="dot svg img"></div>
</div>
</li>`;
for (let i = 0; i < 12; i++) {
  incomeElement.innerHTML += skeketon;
  expenseElement.innerHTML += skeketon;
}

let switchBtn = document.querySelector(".category");
let addCategoryBtn = document.querySelector(".add-category .add-box");
let categoryBox = document.querySelector(".category-box-body");
let editcategoryBox = document.querySelector(".edit-category-box-body");
let cancelCategoryBox = document.querySelector(".cancel-add-category");
let cancelEditCategoryBox = document.querySelector(".cancel-edit-category");
let categoryContainer = document.querySelector(
  ".categories .category-container"
);
let categories = document.querySelectorAll(
  ".category-container .category-list li"
);
let saveCategoryBtn = document.querySelector(".save-category-btn");
let clickedItem = "";
let incomeCategoryParent = document.querySelector(`.income-category ul`);
let expenseCategoryParent = document.querySelector(`.expense-category ul`);

categories.forEach((categorie) => {
  categorie.addEventListener("click", () => {
    categories.forEach((categorie) => categorie.classList.remove("active"));
    categorie.classList.add("active");
  });
});

switchBtn.addEventListener("click", () => {
  document.querySelector(".switch").classList.toggle("active");
});

addCategoryBtn.addEventListener("click", () => {
  categoryBox.classList.add("active");
  categoryContainer.classList.add("blurbg");
});

cancelCategoryBox.addEventListener("click", () => {
  categoryBox.classList.remove("active");
  categoryContainer.classList.remove("blurbg");
});
cancelEditCategoryBox.addEventListener("click", () => {
  editcategoryBox.classList.remove("active");
  editcategoryBox.classList.remove("open");
  categoryContainer.classList.remove("blur");
  categoryContainer.classList.remove("expense");
});
document.querySelectorAll(".edit-category-btn").forEach((btn) => {
  btn.addEventListener("click", reload);
});
function reload() {
  let editBtn = document.querySelectorAll(".edit-category-btn");

  let dots = document.querySelectorAll(".right-portion .dot");
  let options = document.querySelectorAll(".right-portion .options");
  let categoryDelBtn = document.querySelectorAll(".delete-account");
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

  //delete category
  categoryDelBtn.forEach((catItem) => {
    catItem.addEventListener("click", () => {
      let userId =
        catItem.parentElement.parentElement.parentElement.dataset.userId;
      catItem.parentElement.parentElement.parentElement.remove();
      deleteCategoryDb(userId, catItem.parentElement.dataset.categoryId);
    });
  });
  //edit btn
  editBtn.forEach((btn) => {
    btn.addEventListener("click", () => {
      let categoryName =
        btn.parentElement.parentElement.previousElementSibling.children[1]
          .textContent;
      let imageSrc =
        btn.parentElement.parentElement.previousElementSibling.children[0].getAttribute(
          "src"
        );
      let category =
        btn.parentElement.parentElement.parentElement.parentElement.classList.contains(
          "income-list"
        )
          ? "income"
          : "expense";
      clickedItem = btn.parentElement.parentElement.parentElement;
      openEditPanel(categoryName, imageSrc);
      options.forEach((option) => option.classList.remove("active"));
    });
  });
}

function openEditPanel(name, src) {
  categoryContainer.classList.add("blur");
  let editName = document.getElementById("edit-category-name");
  editName.value = name;

  editcategoryBox.classList.add("active");

  categories.forEach((categorie) => {
    if (categorie.children[0].getAttribute("src") == src) {
      categorie.classList.add("active");
    } else {
      categorie.classList.remove("active");
    }
  });
}

document
  .querySelector(".save-edit-category-btn")
  .addEventListener("click", updateCategory);

function updateCategory() {
  editcategoryBox.classList.remove("active");
  categoryContainer.classList.remove("blur");
  let updatedName = document.getElementById("edit-category-name");
  if (updatedName.value.trim().lenght < 0) return;

  let updatedIcon;
  categories.forEach((item) => {
    if (item.classList.contains("active")) {
      updatedIcon = item.children[0].getAttribute("src");
    }
  });

  clickedItem.children[0].children[0].setAttribute("src", updatedIcon);
  clickedItem.children[0].children[1].textContent = updatedName.value;

  let categoryId =
    clickedItem.lastElementChild.lastElementChild.dataset.categoryId;

  let data = {
    name: updatedName.value,
    image: updatedIcon,
  };
  document.querySelector(".edit-category-box-body").classList.remove("open");
  document.querySelector(".category-container").classList.remove("expense");
  updateCategoryDb(data, categoryId);
}

saveCategoryBtn.addEventListener("click", () => {
  categoryBox.classList.remove("active");
  categoryContainer.classList.remove("blurbg");
  let categoryName = document.getElementById("category-name").value.trim();
  let selectedIcon = "";
  categories.forEach((categorie) => {
    if (categorie.classList.contains("active")) {
      selectedIcon = categorie.children[0].getAttribute("src");
    }
  });
  let category = document.querySelector(".switch").classList.contains("active")
    ? "income"
    : "expense";
  if (categoryName != "") {
    createCategory(categoryName, selectedIcon, category);
    let userId = "66efbc38dadf2a87f3644e04";
    let data = {
      image: selectedIcon,
      name: categoryName,
      type: category,
      userId,
    };
    saveCategoryDb(data);
  } else {
    return;
  }
  reload();
  reloadExpense();
  loadData();
});

function createCategory(name, icon, category, categoryId, userId) {
  if (name == " " || name.lenght < 0) {
    return;
  }

  let parent = document.querySelector(`.${category}-category ul`);

  let template = `<li data-user-id="${userId}">
                  <div class="left-portion">
                    <img src="${icon}" alt="" />
                    <p class="change-font-style">${name}</p>
                  </div>
                  <div class="right-portion">
                    <img class="dot svg" src="icons/dot.svg" alt="" />
                    <div class="options" data-category-id="${categoryId}">
                      <p class="edit-category-btn">Edit</p>
                      <p class="delete-account">Delete</p>
                    </div>
                  </div>
                </li>`;
  parent.innerHTML += template;

  document.getElementById("category-name").value = "";
  // reload();
}

document.addEventListener("click", (e) => {
  let dots = document.querySelectorAll(".income-list li .right-portion .dot");
  let edots = document.querySelectorAll(".expense-list li .right-portion .dot");

  let options = document.querySelectorAll(
    ".income-list li .right-portion .options"
  );
  let eoptions = document.querySelectorAll(
    ".expense-list li .right-portion .options"
  );

  dots.forEach((dot, i) => {
    if (!dot.contains(e.target)) {
      options[i].classList.remove("active");
    }
  });
  edots.forEach((dot, i) => {
    if (!dot.contains(e.target)) {
      eoptions[i].classList.remove("active");
    }
  });

  let isClicked = true;

  options.forEach((opt) => {
    if (opt.contains(e.target)) {
      isClicked = false;
      setTimeout(() => {
        isClicked = true;
      }, 1000);
    }
  });

  if (!editcategoryBox.contains(e.target) && isClicked) {
    editcategoryBox.classList.remove("active");
    categoryContainer.classList.remove("blur");
  }
});

async function loadData() {
  let req = await fetch(
    ` https://penny-partner.onrender.com/api/v1/users/categories`
  );
  let res = await req.json();

  if (res.status == "success") {
    incomeCategoryParent.innerHTML = "";
    expenseCategoryParent.innerHTML = "";
    document.querySelector(".income-category-skeleton").style.display = "none";
    document.querySelector(".expense-category-skeleton").style.display = "none";
    showCategory();
    let categories = res.data;
    categories.forEach((category) => {
      createCategory(
        category.name,
        category.image,
        category.type,
        category._id,
        category.userId
      );
    });
  } else {
    document.querySelector(".income-category-skeleton").style.display = "flex";
  }
  reload();
  reloadExpense();
}

document.querySelectorAll(".skeleton-category").forEach((item) => {
  item.addEventListener("click", () => {
    loadData();
  });
});

function showCategory() {
  document
    .querySelectorAll(".active-category h3")
    .forEach((item) => (item.style.display = "flex"));
  document.querySelector(".active-category  .add-box").style.display = "flex";
}

// -----------------CREATE CATEGORY TO DB ----------------------------
async function saveCategoryDb(data) {
  let req = await fetch(
    ` https://penny-partner.onrender.com/api/v1/users/categories`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
  let res = await req.json();
}

// -----------------UPDATE CATEGORY TO DB ----------------------------
async function updateCategoryDb(data, categoryId) {
  let req = await fetch(
    ` https://penny-partner.onrender.com/api/v1/users/categories/${categoryId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
}

// -----------------DELETE CATEGORY TO DB ----------------------------
async function deleteCategoryDb(userId, categoryId) {
  let req = await fetch(
    ` https://penny-partner.onrender.com/api/v1/users/categories/${categoryId}?userId=${userId}`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    }
  );

  reloadHomePage(document.querySelectorAll(".month")[0].textContent);
}

function reloadExpense() {
  let dots = document.querySelectorAll(
    "ul.expense-list li .right-portion .dot"
  );

  let options = document.querySelectorAll(
    ".expense-list li .right-portion .options"
  );

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
      options[index].classList.add("active");
    });
  });

  let editBtn = document.querySelectorAll(
    "ul.expense-list li .right-portion .options .edit-category-btn"
  );
  //edit btn
  editBtn.forEach((btn) => {
    btn.addEventListener("click", () => {
      let categoryName =
        btn.parentElement.parentElement.previousElementSibling.children[1]
          .textContent;
      let imageSrc =
        btn.parentElement.parentElement.previousElementSibling.children[0].getAttribute(
          "src"
        );
      let category =
        btn.parentElement.parentElement.parentElement.parentElement.classList.contains(
          "income-list"
        )
          ? "income"
          : "expense";
      clickedItem = btn.parentElement.parentElement.parentElement;

      document.querySelector(".edit-category-box-body").classList.add("open");
      document.querySelector(".category-container").classList.add("expense");
      openEditPanel(categoryName, imageSrc);

      options.forEach((option) => option.classList.remove("active"));
    });
  });
}
