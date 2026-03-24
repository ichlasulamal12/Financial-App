const STORAGE_KEY = "financial_app_entries_v2";

const entryForm = document.getElementById("entry-form");
const entryTable = document.getElementById("entry-table");
const clearBtn = document.getElementById("clear-btn");
const demoBtn = document.getElementById("demo-btn");
const exportBtn = document.getElementById("export-btn");
const importInput = document.getElementById("import-input");
const categorySummary = document.getElementById("category-summary");
const formTitle = document.getElementById("form-title");
const saveBtn = document.getElementById("save-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");

const filterType = document.getElementById("filter-type");
const filterMonth = document.getElementById("filter-month");
const searchInput = document.getElementById("search-input");

const fields = {
  id: document.getElementById("entry-id"),
  type: document.getElementById("type"),
  name: document.getElementById("name"),
  category: document.getElementById("category"),
  note: document.getElementById("note"),
  amount: document.getElementById("amount"),
  date: document.getElementById("date"),
};

const totalsEl = {
  income: document.getElementById("total-income"),
  expense: document.getElementById("total-expense"),
  asset: document.getElementById("total-asset"),
  liability: document.getElementById("total-liability"),
  netWorth: document.getElementById("net-worth"),
  cashflow: document.getElementById("cashflow"),
};

let entries = loadEntries();
renderAll();
setToday();

entryForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const parsed = parseForm();
  if (!parsed) {
    alert("Mohon isi data dengan benar.");
    return;
  }

  if (parsed.id) {
    const existingIndex = entries.findIndex((entry) => entry.id === parsed.id);
    if (existingIndex >= 0) {
      entries[existingIndex] = parsed;
    }
  } else {
    parsed.id = crypto.randomUUID();
    entries.unshift(parsed);
  }

  persistEntries();
  renderAll();
  resetForm();
});

cancelEditBtn.addEventListener("click", resetForm);

clearBtn.addEventListener("click", () => {
  const confirmed = confirm("Yakin ingin menghapus semua data?");
  if (!confirmed) return;

  entries = [];
  persistEntries();
  renderAll();
  resetForm();
});

demoBtn.addEventListener("click", () => {
  if (entries.length > 0 && !confirm("Data contoh akan ditambahkan. Lanjutkan?")) return;

  entries = [...buildDemoData(), ...entries];
  persistEntries();
  renderAll();
});

exportBtn.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(entries, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `financial-data-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
});

importInput.addEventListener("change", async () => {
  const file = importInput.files?.[0];
  if (!file) return;

  try {
    const content = await file.text();
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed)) throw new Error("format tidak valid");

    const sanitized = parsed.map(sanitizeEntry).filter(Boolean);
    if (sanitized.length === 0) throw new Error("data kosong");

    entries = sanitized;
    persistEntries();
    renderAll();
    resetForm();
    alert("Import berhasil.");
  } catch {
    alert("Import gagal. Pastikan file JSON valid.");
  } finally {
    importInput.value = "";
  }
});

entryTable.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const deleteId = target.getAttribute("data-delete-id");
  if (deleteId) {
    entries = entries.filter((item) => item.id !== deleteId);
    persistEntries();
    renderAll();
    return;
  }

  const editId = target.getAttribute("data-edit-id");
  if (!editId) return;

  const entry = entries.find((item) => item.id === editId);
  if (!entry) return;

  fillForm(entry);
});

[filterType, filterMonth, searchInput].forEach((el) => {
  el.addEventListener("input", renderAll);
  el.addEventListener("change", renderAll);
});

function parseForm() {
  const entry = {
    id: fields.id.value || "",
    type: fields.type.value,
    name: fields.name.value.trim(),
    category: fields.category.value.trim(),
    note: fields.note.value.trim(),
    amount: Number(fields.amount.value),
    date: fields.date.value,
  };

  if (!entry.name || !entry.category || !entry.date || Number.isNaN(entry.amount) || entry.amount < 0) {
    return null;
  }

  return entry;
}

function fillForm(entry) {
  fields.id.value = entry.id;
  fields.type.value = entry.type;
  fields.name.value = entry.name;
  fields.category.value = entry.category;
  fields.note.value = entry.note || "";
  fields.amount.value = entry.amount;
  fields.date.value = entry.date;

  formTitle.textContent = "Edit Data";
  saveBtn.textContent = "Update";
  cancelEditBtn.hidden = false;
}

function resetForm() {
  entryForm.reset();
  fields.id.value = "";
  setToday();

  formTitle.textContent = "Tambah Data";
  saveBtn.textContent = "Simpan";
  cancelEditBtn.hidden = true;
}

function getFilteredEntries() {
  const activeType = filterType.value;
  const activeMonth = filterMonth.value;
  const keyword = searchInput.value.trim().toLowerCase();

  return entries.filter((entry) => {
    if (activeType !== "all" && entry.type !== activeType) return false;
    if (activeMonth && !entry.date.startsWith(activeMonth)) return false;

    if (keyword) {
      const haystack = `${entry.name} ${entry.category} ${entry.note || ""}`.toLowerCase();
      if (!haystack.includes(keyword)) return false;
    }

    return true;
  });
}

function renderAll() {
  const filteredEntries = getFilteredEntries();
  renderTable(filteredEntries);
  renderTotals(filteredEntries);
  renderCategorySummary(filteredEntries);
}

function renderTable(filteredEntries) {
  if (filteredEntries.length === 0) {
    entryTable.innerHTML = `
      <tr>
        <td class="empty-row" colspan="7">Belum ada data yang sesuai filter.</td>
      </tr>
    `;
    return;
  }

  entryTable.innerHTML = filteredEntries
    .map((entry) => {
      const amountClass = `amount-${entry.type}`;
      return `
        <tr>
          <td>${escapeHtml(formatDate(entry.date))}</td>
          <td>${escapeHtml(capitalize(entry.type))}</td>
          <td>${escapeHtml(entry.name)}</td>
          <td>${escapeHtml(entry.category)}</td>
          <td>${escapeHtml(entry.note || "-")}</td>
          <td class="${amountClass}">${formatCurrency(entry.amount)}</td>
          <td>
            <div class="actions">
              <button class="inline-btn edit" data-edit-id="${entry.id}" type="button">Edit</button>
              <button class="inline-btn" data-delete-id="${entry.id}" type="button">Hapus</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderTotals(filteredEntries) {
  const totals = {
    income: sumByType(filteredEntries, "income"),
    expense: sumByType(filteredEntries, "expense"),
    asset: sumByType(filteredEntries, "asset"),
    liability: sumByType(filteredEntries, "liability"),
  };

  const netWorth = totals.asset - totals.liability;
  const cashflow = totals.income - totals.expense;

  totalsEl.income.textContent = formatCurrency(totals.income);
  totalsEl.expense.textContent = formatCurrency(totals.expense);
  totalsEl.asset.textContent = formatCurrency(totals.asset);
  totalsEl.liability.textContent = formatCurrency(totals.liability);
  totalsEl.netWorth.textContent = formatCurrency(netWorth);
  totalsEl.cashflow.textContent = formatCurrency(cashflow);
}

function renderCategorySummary(filteredEntries) {
  const relevant = filteredEntries.filter((entry) => entry.type === "income" || entry.type === "expense");
  if (relevant.length === 0) {
    categorySummary.innerHTML = "<li>Belum ada data income/expense.</li>";
    return;
  }

  const categoryMap = relevant.reduce((acc, entry) => {
    const key = `${entry.type}|${entry.category}`;
    acc[key] = (acc[key] || 0) + entry.amount;
    return acc;
  }, {});

  const sorted = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
  categorySummary.innerHTML = sorted
    .map(([key, amount]) => {
      const [type, category] = key.split("|");
      return `<li>${escapeHtml(capitalize(type))} - ${escapeHtml(category)}: <strong>${formatCurrency(amount)}</strong></li>`;
    })
    .join("");
}

function sumByType(list, type) {
  return list.filter((entry) => entry.type === type).reduce((acc, curr) => acc + curr.amount, 0);
}

function setToday() {
  fields.date.valueAsDate = new Date();
}

function loadEntries() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(sanitizeEntry).filter(Boolean);
  } catch {
    return [];
  }
}

function sanitizeEntry(entry) {
  if (!entry || typeof entry !== "object") return null;

  const safe = {
    id: String(entry.id || crypto.randomUUID()),
    type: ["income", "expense", "asset", "liability"].includes(entry.type) ? entry.type : "expense",
    name: String(entry.name || "").trim(),
    category: String(entry.category || "").trim(),
    note: String(entry.note || "").trim(),
    amount: Number(entry.amount),
    date: String(entry.date || ""),
  };

  if (!safe.name || !safe.category || Number.isNaN(safe.amount) || safe.amount < 0 || !safe.date) {
    return null;
  }

  return safe;
}

function persistEntries() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function buildDemoData() {
  const today = new Date();
  const thisMonth = today.toISOString().slice(0, 7);

  return [
    demo("income", "Gaji", "Pekerjaan", 12000000, `${thisMonth}-01`, "Gaji bulanan"),
    demo("expense", "Sewa Kos", "Tempat Tinggal", 2500000, `${thisMonth}-03`, "Bayar kos"),
    demo("expense", "Makan", "Kebutuhan Harian", 1800000, `${thisMonth}-10`, "Belanja mingguan"),
    demo("asset", "Tabungan BCA", "Kas/Bank", 35000000, `${thisMonth}-05`, "Saldo rekening"),
    demo("liability", "Kartu Kredit", "Utang Jangka Pendek", 2700000, `${thisMonth}-12`, "Tagihan belum lunas"),
  ];
}

function demo(type, name, category, amount, date, note) {
  return {
    id: crypto.randomUUID(),
    type,
    name,
    category,
    amount,
    date,
    note,
  };
}

function formatCurrency(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDate(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
