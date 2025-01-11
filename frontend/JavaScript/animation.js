async function countUsers() {
  let req = await fetch(
    " https://penny-partner.onrender.com/api/v1/users/count"
  );
  let res = await req.json();
  if (res.status == "success") {
    return res.userCount;
  }
  return 0;
}

let countContainer = document.querySelector(".pp-users-container");
let userCount = document.getElementById("user-count");
let sideBar = document.querySelector(".sidebar");
let showCountBtn = document.querySelector(".total-users");

showCountBtn.addEventListener("click", async () => {
  // Wait for totalUsers to be resolved before continuing
  userCount.innerHTML = "0";
  let totalUsers = await countUsers();

  // Calculate the interval time after getting the total users
  const intervalTime = 2500 / totalUsers; // Adjust the denominator to control the overall speed
  let i = 0;

  sideBar.classList.remove("active");
  countContainer.classList.add("active");

  const counter = setInterval(() => {
    if (i <= totalUsers) {
      userCount.innerHTML = i;
      i++;
    } else {
      document.querySelector(".message-thank").textContent =
        "Grateful for your valued partnership.";
      clearInterval(counter);
      userCount.classList.add("active");

      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      const count = 200,
        defaults = {
          origin: { y: 0.7 },
        };

      function fire(particleRatio, opts) {
        confetti(
          Object.assign({}, defaults, opts, {
            particleCount: Math.floor(count * particleRatio),
          })
        );
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
      });

      fire(0.2, {
        spread: 60,
      });

      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
      });

      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
      });

      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });
      i = 0;
    }
  }, intervalTime);
});

document.querySelector(".close-button").addEventListener("click", () => {
  countContainer.classList.remove("active");
});

document.addEventListener("click", (e) => {
  if (
    !document.getElementById("user-count-body").contains(e.target) &&
    !showCountBtn.contains(e.target)
  ) {
    countContainer.classList.remove("active");
  }
});

// SHARE FUNCTIONALITY
document
  .getElementById("invite-friends")
  .addEventListener("click", async function () {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check this out!",
          text: "Here is something interesting I found.",
          url: window.location.href,
        });
      } catch (error) {}
    } else {
      alert("Web Share API is not supported in your browser.");
    }
  });
