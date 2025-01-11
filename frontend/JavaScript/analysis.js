let chartInstance;
const currentDate = new Date();
const options = { year: "numeric", month: "long" };
const formattedDate = currentDate.toLocaleDateString("en-US", options);
let globalColorsArray = [];

let dataAnalysContainer = document.querySelector(".data-container");
export default async function visualizeData(
  type = "income",
  month = formattedDate
) {
  let req = await fetch(
    `https://penny-partner.onrender.com/api/v1/analytics?type=${type}&month=${month}`
  );
  let res = await req.json();
  let chart = document.querySelector(".chart");
  if (res.totalIncome == 0) {
    dataAnalysContainer.innerHTML = "";

    chart.innerHTML = `<div class="no-content-container" style="margin-bottom: 150px";>
    <img src="images/404.png" alt="no-data-found" />
    <p>
      No record in this month. Tap + to add new expense or income.
    </p>
  </div>`;
    return;
  } else {
    chart.innerHTML = '<canvas width="400" height="400" id="myChart"></canvas>';
  }

  let transactions = res.transactions.map((item) => ({
    category: item.category.name,
    ...item,
  }));

  const labels = transactions.map((transaction) => transaction.category.name);
  const data = transactions.map((transaction) => transaction.totalAmount);

  const ctx = document.getElementById("myChart");

  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const generateRandomColors = (count) => {
    const colors = Array.from({ length: count }, getRandomColor);
    globalColorsArray = [...colors];
    return colors;
  };

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: res.chart || "doughnut",
    data: {
      datasets: [
        {
          data: data,
          backgroundColor: generateRandomColors(data.length),
          hoverOffset: 10,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "top",
          labels: {
            font: {
              size: 14,
            },
          },
        },
      },
      animation: {
        duration: 500,
        easing: "linear",
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            maxRotation: 90,
            minRotation: 90,
          },
        },
        y: {
          grid: {
            display: false,
          },
          ticks: {
            display: false,
          },
        },
      },
      aspectRatio: 1,
    },
  });

  dataAnalysContainer.innerHTML = "";

  transactions.forEach((item, index) => {
    analysis(
      item.category.image,
      item.category.name,
      item.totalAmount.toLocaleString(),
      ((item.totalAmount / res.totalIncome) * 100).toFixed(2),
      index
    );
  });
}

// DOM content interaction
let optionBody = document.querySelector(".opt-body");
let inExoptions = document.querySelector(".category-options");

optionBody.addEventListener("click", () => {
  inExoptions.classList.add("active");
});

document.addEventListener("click", (e) => {
  if (!optionBody.contains(e.target) && !inExoptions.contains(e.target)) {
    inExoptions.classList.remove("active");
  }
});

function analysis(src, name, amount, percentage, index) {
  let userCurrency = "";
  let template = `<li>
                  <div class="img-container">
                    <img src="${src}" alt="${name}" />
                  </div>
                  <div class="text-amount-bar">
                    <div class="category-name-analysis">
                      <p class="little-bold">${name}</p>
                      <div class="money-value"><span class="currency-symbol">${userCurrency}</span> ${amount}</div>
                    </div>
                    <div class="analysis-bar-container">
                      <div class="analysis-bar" style="width:${percentage}%; background:${globalColorsArray[index]}"></div>
                    </div>
                  </div>
                  <div class="percentage little-bold">${percentage}%</div>
                </li>`;
  dataAnalysContainer.innerHTML += template;
}

let analysisBtn = document.querySelectorAll(".chart-section");
analysisBtn.forEach((btn) => {
  btn.addEventListener("click", () => {
    let month = document.querySelectorAll(".month-body .month")[1].textContent;
    let type = document
      .querySelector(".current-view")
      .textContent.toLowerCase()
      .trim()
      .split(" ")[0];
    visualizeData(type, month);
  });
});

document.querySelector(".expense-view").addEventListener("click", () => {
  let month = document.querySelectorAll(".month-body .month")[1].textContent;
  visualizeData("expense", month);
});
document.querySelector(".income-view").addEventListener("click", () => {
  let month = document.querySelectorAll(".month-body .month")[1].textContent;
  visualizeData("income", month);
});
