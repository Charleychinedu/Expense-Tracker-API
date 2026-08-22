const app = require("./app");

const PORT = process.env.PORT || 8888;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.status(200).json({ message: "Expense Tracker API is running" });
});
