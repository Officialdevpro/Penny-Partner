let wordCount = document.querySelector(".word-count");
let reviewInput = document.getElementById("calculate-word-len");
let reviewId;
let date;
let clickedReview;

reviewInput.addEventListener("input", () => {
  wordCount.innerHTML = `${reviewInput.value.length}/500`;
});

let userFeedBack = document.querySelector(".user-feedback");
function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function handleReviewStar(num) {
  let star = ``;
  for (let i = 0; i < 5; i++) {
    if (i < num) {
      star += '<img src="icons/filledstar.svg" alt="" />';
    } else {
      star += '<img class="star-shadow" src="icons/star.svg" alt="" />';
    }
  }
  return star;
}
setTimeout(() => {
  loadReviews();
}, 100);

function isAuthor(review_userId, userId, reviewId) {
  if (review_userId !== userId) {
    return "";
  } else {
    document.querySelector(".write-pen").classList.add("hide");
    return `<div class="review-operations">
           
                    <img class="dot svg rr-dots" src="icons/dot.svg" alt="" />
                    <div class="options rr-options" data-review-id=${reviewId}>
                      <p class="edit-btn-rr">Edit</p>
                      <p class="delete-review">Delete</p>
                    </div>
                </div>  `;
  }
}
let userReview = "";
async function loadReviews() {
  let userId = document.querySelector(".home-display-username").dataset;

  let req = await fetch(" http://localhost:4000/api/v1/reviews");
  let res = await req.json();
  if (req.status === 200) {
    let { stats, reviews } = res;
    document.querySelector(".user-feedback").innerHTML = "";
    document.querySelector(".rating-num-left h1").innerHTML = stats.avgRating;
    document.querySelector(".nRating").innerHTML = stats.nRating;

    let barData = stats.percentages;
    loadBars(barData);
    reviews.forEach((data) => {
      let template = ` <li class="review-card">
        <div class="review-card-head">
          <div class="review-left-part">
            <div style="background-color:${getRandomColor()}" class="img review-profile">${data.user.username
        .charAt(0)
        .toLocaleUpperCase()}</div>
            <p>${data.user.username}</p>
          </div>
          ${isAuthor(data.user._id, userId.userId, data._id)}
        </div>
        <div class="review-card-center">
          <div class="reviewed-star">
            ${handleReviewStar(data.rating)}
          </div>
          <small class="review-date">${data.createdAt.slice(0, 10)}</small>
        </div>
        <p class="review-text">
          ${data.review}
        </p>
      </li>`;
      if (data.user._id === userId.userId) {
        userReview = template;
        // Prepend the review by adding it to the start of the container
        userFeedBack.innerHTML = template + userFeedBack.innerHTML;
      } else {
        // Append the review by adding it to the end of the container
        userFeedBack.innerHTML += template;
      }

      let deleteButtons = document.querySelectorAll(".delete-review");

      deleteButtons.forEach((btn, index) => {
        btn.addEventListener("click", (event) => {
          document.querySelector(".write-pen").classList.remove("hide");
          deleteReviewFromServer(event.target.parentElement.dataset.reviewId);
          let reviewCard = event.target.closest(".review-card");

          reviewCard.remove(); // Remove the review from DOM
        });
      });
    });
  }

  attachEditListeners();
  document.querySelectorAll(".rr-dots").forEach((dot, index) => {
    dot.addEventListener("click", () => {
      document
        .querySelectorAll(".rr-options")
        [index].classList.toggle("active");
    });
  });
}

function attachEditListeners() {
  // Select all edit buttons
  let editBtns = document.querySelectorAll(".edit-btn-rr");

  editBtns.forEach((editBtn) => {
    editBtn.addEventListener("click", () => {
      reviewId = editBtn.parentElement.dataset.reviewId;
      clickedReview = editBtn.closest("li");

      // Find the review text
      let reviewTextElement = editBtn
        .closest(".review-card")
        .querySelector(".review-text");
      let reviewText = reviewTextElement.textContent.trim();

      document.getElementById("calculate-word-len").value = reviewText;

      // Find the star rating
      let filledStarsContainer = editBtn
        .closest(".review-card")
        .querySelector(".reviewed-star");
      let filledStarCount = (
        filledStarsContainer.innerHTML.match(/icons\/filledstar\.svg/g) || []
      ).length;

      // Populate edit modal or input fields
      document.getElementById("rateValue").value = filledStarCount;
      document.getElementById("calculate-word-len").textContent = reviewText;

      // Update stars in the modal
      let stars = document.querySelectorAll(".rating-star-container div.star");
      stars.forEach((star, index) => {
        star.classList.toggle("active", index < filledStarCount);
      });

      // Enable update button and change its text
      let updateBtn = document.querySelector(".review-post-btn");
      updateBtn.disabled = false;
      updateBtn.textContent = "UPDATE";

      // Show the review input container for editing
      document.querySelector(".review-input-container").classList.add("active");

      // Handle update on button click
      updateBtn.addEventListener("click", () => {
        // Get the updated stars and review text
        let updatedStarCount = document.querySelectorAll(
          ".rating-star-container .star.active"
        ).length;
        let updatedReviewText = document
          .getElementById("calculate-word-len")
          .textContent.trim();

        // Update the DOM
        filledStarsContainer.innerHTML = generateStarHTML(updatedStarCount);
        reviewTextElement.textContent = updatedReviewText;

        // Close the modal or editing section
        document
          .querySelector(".review-input-container")
          .classList.remove("active");
        updateBtn.textContent = "POST";
        updateBtn.disabled = true;
      });
    });
  });
}
// Helper function to generate star HTML
function generateStarHTML(count) {
  let starHTML = "";
  for (let i = 0; i < count; i++) {
    starHTML += `<img src="icons/filledstar.svg" alt="star" />`;
  }
  for (let i = count; i < 5; i++) {
    starHTML += `<img src="icons/star.svg" alt="star" />`;
  }
  return starHTML;
}

//Star animation
let stars = document.querySelectorAll(".rating-star-container .star");
let postBtn = document.querySelector(".review-post-btn");
let feedBack = document.getElementById("calculate-word-len");
let reviewBox = document.querySelector(".review-input-container");
let reviewWritePen = document.querySelector(".write-pen");

reviewWritePen.addEventListener("click", () => {
  reviewBox.classList.toggle("active");
});
stars.forEach((star, index) => {
  star.addEventListener("click", () => {
    stars.forEach((s) => s.classList.remove("active"));
    document.getElementById("rateValue").value = index + 1;
    isValidReview();
    for (let i = 0; i <= index; i++) {
      stars[i].classList.add("active");
    }
  });
});

feedBack.addEventListener("input", isValidReview);

function isValidReview() {
  let feedBack = document.getElementById("calculate-word-len");
  let rateValue = document.getElementById("rateValue").value;
  if (feedBack.value.trim().length > 3 && rateValue != 0) {
    postBtn.disabled = false;
  } else {
    postBtn.disabled = true;
  }
}
postBtn.addEventListener("click", async () => {
  const today = new Date();
  document.querySelector(".write-pen").classList.add("hide");

  // Get the day, month, and year
  let day = today.getDate();
  let month = today.getMonth() + 1; // Months are zero-based, so add 1
  const year = today.getFullYear();

  // Add leading zeros if day or month is less than 10
  if (day < 10) {
    day = "0" + day;
  }

  if (month < 10) {
    month = "0" + month;
  }

  let feedBack = document.getElementById("calculate-word-len");

  let rateValue = document.getElementById("rateValue");
  date = `${year}-${month}-${day}`;

  let reviewObj = {
    rating: rateValue.value,
    review: feedBack.value.trim(),
  };

  dynamictemplate(reviewObj);
  if (postBtn.textContent.trim() == "UPDATE") {
    clickedReview.remove();
    updateReviewFromServer(reviewId, reviewObj);
    return;
  }
  let req = await fetch(" http://localhost:4000/api/v1/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reviewObj),
  });
  let res = await req.json();
  feedBack.value = "";
  rateValue.vlaue = 0;
  stars.forEach((s) => s.classList.remove("active"));
  reviewBox.classList.remove("active");
  postBtn.disabled = true;
  loadReviews();
});

function loadBars(data) {
  document.querySelector(".bar-rating-5 .child-bar-line").style.width =
    `${data["5"]}` + "%";
  document.querySelector(".bar-rating-4 .child-bar-line").style.width =
    `${data["4"]}` + "%";
  document.querySelector(".bar-rating-3 .child-bar-line").style.width =
    `${data["3"]}` + "%";
  document.querySelector(".bar-rating-2 .child-bar-line").style.width =
    `${data["2"]}` + "%";
  document.querySelector(".bar-rating-1 .child-bar-line").style.width =
    `${data["1"]}` + "%";
}

function dynamictemplate(reviewObj) {
  let userName = document.querySelector(".home-display-username").textContent;
  let template = ` <li class="review-card">
      <div class="review-card-head">
        <div class="review-left-part">
          <div style="background-color:${getRandomColor()}" class="img review-profile">${userName
    .charAt(0)
    .toLocaleUpperCase()}</div>
          <p>${userName}</p>
        </div>
      </div>
      <div class="review-card-center">
        <div class="reviewed-star">
          ${handleReviewStar(reviewObj.rating)}
        </div>
        <small class="review-date">${date}</small>
      </div>
      <p class="review-text">
        ${reviewObj.review}
      </p>
    </li>`;
  // userFeedBack.innerHTML = template + userFeedBack.innerHTML;
}
async function deleteReviewFromServer(reviewId) {
  try {
    let response = await fetch(
      ` http://localhost:4000/api/v1/reviews/${reviewId}`,
      {
        method: "DELETE",
      }
    );
  } catch (error) {
    console.error("Error deleting review:", error);
  }
}
document.querySelector(".account-back-btn").addEventListener("click", () => {
  document.getElementById("privacy-btn").classList.remove("active");
});
async function updateReviewFromServer(reviewId, data) {
  try {
    let response = await fetch(
      ` http://localhost:4000/api/v1/reviews/${reviewId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json", // Fixed syntax
        },
        body: JSON.stringify(data),
      }
    );
    if (response.status === 200) {
      loadReviews();
      let re = await response.json();
    }
  } catch (error) {
    console.error("Error deleting review:", error);
  }
}
