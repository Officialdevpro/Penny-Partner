const excelJs = require("exceljs");

exports.generateReport = async (data, res) => {
  try {
    const workBook = new excelJs.Workbook();
    const workSheet = workBook.addWorksheet("Sheet");

    // Add column headers
    workSheet.columns = [
      { header: "TIME", key: "time", width: 20 },
      { header: "TYPE", key: "type", width: 10 },
      { header: "AMOUNT", key: "amount", width: 10 },
      { header: "ACCOUNT", key: "account", width: 15 },
      { header: "CATEGORY", key: "category", width: 15 },
      { header: "NOTES", key: "notes", width: 30 },
    ];

    data.forEach((doc) => {
      console.log(doc)
      workSheet.addRow({
        time: dateTimeFormat(doc.date),
        type:
          doc.type == "expense"
            ? "(-)" + doc.type
            : doc.type == "income"
            ? "(+)" + doc.type
            : doc.type,
        amount: doc.amount,
        category: doc.categoryInfo?.name || "transfer",
        account: doc.accountInfo.accountName,
        notes: doc.description,
      });
    });

    // Set response headers for download
    res.setHeader("Content-Disposition", "attachment; filename=data.xlsx");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    // Write the workbook to the response
    await workBook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).send("Error generating Excel file");
  }
};

function dateTimeFormat(ISOformat){
  const date = new Date(ISOformat);

// Helper function for 12-hour format with am/pm
function formatTime(date) {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "pm" : "am";
  const formattedHours = hours % 12 || 12; // Convert 0 -> 12 for midnight
  const formattedMinutes = minutes.toString().padStart(2, "0"); // Add leading zero
  return `${formattedHours}:${formattedMinutes}${ampm}`;
}

// Get components
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const month = months[date.getMonth()];
const day = date.getDate();
const weekday = days[date.getDay()];
const time = formatTime(date);

// Combine the output
const customFormattedDate = `${month} ${day} ${weekday} ${time}`;
return customFormattedDate;
}
