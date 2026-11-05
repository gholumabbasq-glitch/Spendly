const formInput = document.querySelector("#expense-form");
const expensiveName = document.querySelector("#expense-name");
const priceInput = document.querySelector("#expense-amount");
const expenCtegory = document.querySelector("#expense-category");
const dateInput = document.querySelector("#expense-date");
const expensiveLists = document.querySelector("#expense-list");
const traLists = document.querySelector("#transaction-count");
const totalExpenses = document.querySelector("#total-expenses");
const emptyState = document.querySelector("#empty-state");
const submitBtn = document.querySelector("#btn");
const monthlyExpenses = document.querySelector("#monthly-expenses");
const categoryFilter = document.querySelector("#category-filter");
const expenseSearch = document.querySelector("#expense-search");

jalaliDatepicker.startWatch();

let editIndex = null;

const expens = JSON.parse(localStorage.getItem("expenses")) || [];

// ثبت و ویرایش هزینه
function get(event) {
  event.preventDefault();

  const name = expensiveName.value.trim();

  if (name === "") {
    alert("نام هزینه را وارد کنید.");
    return;
  }

  const price = Number(priceInput.value);

  if (!Number.isFinite(price) || price <= 0) {
    alert("مبلغ معتبر وارد کنید.");
    return;
  }

  const category = expenCtegory.value;

  if (category === "") {
    alert("یک دسته‌بندی انتخاب کنید.");
    return;
  }

  const date = dateInput.value;

  if (date === "") {
    alert("تاریخ را انتخاب کنید.");
    return;
  }

  const expen = {
    name: name,
    amount: price,
    category: category,
    date: date,
  };

  if (editIndex === null) {
    // ثبت هزینه جدید
    expens.push(expen);
  } else {
    // ویرایش هزینه قبلی
    expens[editIndex] = expen;
    editIndex = null;
  }

  saveExpenses();
  renderExpenses();

  formInput.reset();

  submitBtn.innerHTML = "<span>＋</span> ثبت هزینه";

  expensiveName.focus();
}

// محاسبه مجموع هزینه‌ها
function updatetotal() {
  const total = expens.reduce((sum, item) => {
    return sum + Number(item.amount);
  }, 0);

  totalExpenses.textContent = `${total.toLocaleString("en-US")} تومان`;
}

function updateMonthlyExpenses() {
  const today = new Date();

  // دریافت سال و ماه فعلی شمسی
  const formatter = new Intl.DateTimeFormat("en-US-u-ca-persian-nu-latn", {
    year: "numeric",
    month: "numeric",
  });

  const todayParts = formatter.formatToParts(today);

  const currentYear = Number(
    todayParts.find((part) => part.type === "year").value,
  );

  const currentMonth = Number(
    todayParts.find((part) => part.type === "month").value,
  );

  // بررسی هزینه‌های ثبت‌شده در ماه جاری شمسی
  const monthlyItems = expens.filter(function (item) {
    const parts = item.date.split(/[/-]/);

    const expenseYear = Number(parts[0]);
    const expenseMonth = Number(parts[1]);

    return expenseYear === currentYear && expenseMonth === currentMonth;
  });

  // محاسبه مجموع
  const monthlyTotal = monthlyItems.reduce(function (sum, item) {
    return sum + Number(item.amount);
  }, 0);

  monthlyExpenses.textContent = `${monthlyTotal.toLocaleString("en-US")} تومان`;
}

// ذخیره هزینه‌ها
function saveExpenses() {
  localStorage.setItem("expenses", JSON.stringify(expens));
}

// ساخت یک سطر برای هر هزینه
function createExpenseRow(expen) {
  const tr = document.createElement("tr");

  const nametd = document.createElement("td");
  nametd.textContent = expen.name;

  const categoryy = document.createElement("td");
  categoryy.textContent = expen.category || "-";

  const dateIn = document.createElement("td");
  dateIn.textContent = expen.date || "-";

  const meqdar = document.createElement("td");
  meqdar.textContent = `${Number(expen.amount).toLocaleString("en-US")} تومان`;

  // دکمه حذف
  const dltbtn = document.createElement("button");
  dltbtn.textContent = "حذف";
  dltbtn.type = "button";
  dltbtn.classList.add("delete-btn");

  // دکمه ویرایش
  const editbtn = document.createElement("button");
  editbtn.textContent = "ویرایش";
  editbtn.type = "button";
  editbtn.classList.add("edit-btn");

  const dlttd = document.createElement("td");
  dlttd.append(editbtn, dltbtn);

  tr.append(nametd, categoryy, dateIn, meqdar, dlttd);

  // رویداد حذف
  dltbtn.addEventListener("click", function () {
    const index = expens.indexOf(expen);

    if (index === -1) return;

    expens.splice(index, 1);

    if (editIndex === index) {
      editIndex = null;
      formInput.reset();
      submitBtn.innerHTML = "<span>＋</span> ثبت هزینه";
    } else if (editIndex !== null && editIndex > index) {
      editIndex--;
    }

    saveExpenses();
    renderExpenses();
  });

  // رویداد ویرایش
  editbtn.addEventListener("click", function () {
    editIndex = expens.indexOf(expen);

    if (editIndex === -1) return;

    expensiveName.value = expen.name;
    priceInput.value = expen.amount;
    expenCtegory.value = expen.category;
    dateInput.value = expen.date;

    submitBtn.innerHTML = "ذخیره تغییرات";

    expensiveName.focus();
  });

  return tr;
}

// نمایش تمام هزینه‌ها
function renderExpenses() {
  expensiveLists.innerHTML = "";

  const selectedCategory = categoryFilter.value;
  const searchText = expenseSearch.value.trim().toLowerCase();

  const filteredExpenses = expens.filter(function (expen) {
    const matchesCategory =
      selectedCategory === "همه هزینه‌ها" ||
      expen.category === selectedCategory;

    const matchesSearch = expen.name.toLowerCase().includes(searchText);

    return matchesCategory && matchesSearch;
  });

  filteredExpenses.forEach(function (expen) {
    const tr = createExpenseRow(expen);
    expensiveLists.appendChild(tr);
  });

  updatetotal();
  updateMonthlyExpenses();

  traLists.textContent = expens.length;

  emptyState.style.display = filteredExpenses.length === 0 ? "block" : "none";
}

// رویداد فرم
formInput.addEventListener("submit", get);
categoryFilter.addEventListener("change", renderExpenses);
expenseSearch.addEventListener("input", renderExpenses);

// نمایش هزینه‌ها هنگام بازشدن صفحه
renderExpenses();
