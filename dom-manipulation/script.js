// Full Updated JavaScript (script.js) for Enhanced Dynamic Quote Generator

let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "The purpose of our lives is to be happy.", category: "Happiness" },
];

// Load last selected filter from localStorage
window.onload = function () {
  populateCategories();
  applySavedFilter();
  displayRandomQuote();
};

function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  const select = document.getElementById("categorySelect");
  const filter = document.getElementById("categoryFilter");
  select.innerHTML = "";
  filter.innerHTML = '<option value="all">All Categories</option>';

  categories.forEach(cat => {
    let option1 = document.createElement("option");
    option1.value = cat;
    option1.textContent = cat;
    select.appendChild(option1);

    let option2 = document.createElement("option");
    option2.value = cat;
    option2.textContent = cat;
    filter.appendChild(option2);
  });
}

function displayRandomQuote() {
  const selectedCat = document.getElementById("categorySelect").value;
  const filtered = selectedCat ? quotes.filter(q => q.category === selectedCat) : quotes;
  const random = filtered[Math.floor(Math.random() * filtered.length)];
  document.getElementById("quoteDisplay").textContent = random ? random.text : "No quotes available.";
}

document.getElementById("newQuote").addEventListener("click", displayRandomQuote);
document.getElementById("addQuoteBtn").addEventListener("click", () => {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();
  if (!text || !category) return alert("Both fields are required.");

  quotes.push({ text, category });
  localStorage.setItem("quotes", JSON.stringify(quotes));
  populateCategories();
});

document.getElementById("exportBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(quotes)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
});

document.getElementById("importFile").addEventListener("change", function () {
  const file = this.files[0];
  const reader = new FileReader();
  reader.onload = function (e) {
    const imported = JSON.parse(e.target.result);
    quotes = [...quotes, ...imported];
    localStorage.setItem("quotes", JSON.stringify(quotes));
    populateCategories();
  };
  reader.readAsText(file);
});

function filterQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedFilter", selected);
  const display = document.getElementById("quoteDisplay");
  const filtered = selected === "all" ? quotes : quotes.filter(q => q.category === selected);
  display.textContent = filtered.length ? filtered[0].text : "No quotes available in this category.";
}

function applySavedFilter() {
  const saved = localStorage.getItem("selectedFilter");
  if (saved) {
    document.getElementById("categoryFilter").value = saved;
    filterQuotes();
  }
}

// Sync with server every 60s
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

async function fetchQuotesFromServer() {
  try {
    const res = await fetch(SERVER_URL);
    const data = await res.json();
    const serverQuotes = data.slice(0, 5).map(post => ({ text: post.title, category: "Server" }));

    // Merge
    const existing = JSON.parse(localStorage.getItem("quotes")) || [];
    const merged = [
      ...existing,
      ...serverQuotes.filter(sq => !existing.some(eq => eq.text === sq.text && eq.category === sq.category))
    ];

    quotes = merged;
    localStorage.setItem("quotes", JSON.stringify(merged));
    populateCategories();
    notify("Quotes synced from server.");
  } catch (err) {
    console.error("Sync failed", err);
  }
}

setInterval(fetchQuotesFromServer, 60000);

function notify(msg) {
  const div = document.createElement("div");
  div.textContent = msg;
  div.style.cssText = "background: #ffd54f; padding: 10px; margin: 10px 0; border-radius: 4px;";
  document.body.prepend(div);
  setTimeout(() => div.remove(), 4000);
}
