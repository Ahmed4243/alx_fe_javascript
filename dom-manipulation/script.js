// Load from localStorage or initialize
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The only way to do great work is to love what you do.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "If you judge people, you have no time to love them.", category: "Wisdom" },
];

const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");
const newQuoteBtn = document.getElementById("newQuote");
const exportBtn = document.getElementById("exportBtn");
const importFile = document.getElementById("importFile");

const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Sync quotes with server
async function syncWithServer() {
  try {
    const response = await fetch(SERVER_URL);
    const serverQuotes = await response.json();

    const parsedQuotes = serverQuotes
      .filter(q => q.title && q.body)
      .map(q => ({ text: q.title, category: q.body }));

    // Simple conflict resolution: server wins
    quotes = parsedQuotes;
    saveQuotes();
    populateCategories();
    showNotification("Quotes synced with server. Server data has been applied.");
  } catch (err) {
    console.error("Sync failed:", err);
    showNotification("Sync failed. Working with local data.");
  }
}

// Send new quote to server
async function sendQuoteToServer(quote) {
  try {
    await fetch(SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ title: quote.text, body: quote.category })
    });
  } catch (err) {
    console.warn("Failed to send quote to server:", err);
  }
}

// Notification UI
function showNotification(message) {
  let note = document.createElement("div");
  note.className = "notification";
  note.textContent = message;
  document.body.appendChild(note);
  setTimeout(() => note.remove(), 4000);
}

// Extract unique categories and populate dropdown
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  const lastFilter = localStorage.getItem("selectedCategory");
  if (lastFilter && categoryFilter.querySelector(`option[value="${lastFilter}"]`)) {
    categoryFilter.value = lastFilter;
  }
}

// Display a random quote from filtered list
function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  const filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes found for this category.";
    return;
  }

  const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  quoteDisplay.textContent = `"${randomQuote.text}" — ${randomQuote.category}`;
  sessionStorage.setItem("lastQuote", JSON.stringify(randomQuote));
}

// Filter quotes and update display
function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem("selectedCategory", selectedCategory);
  showRandomQuote();
}

// Add a new quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please fill in both fields.");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  sendQuoteToServer(newQuote);
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  alert("Quote added!");
}

// Export to JSON
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Import from JSON
function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("Invalid format");
      quotes.push(...imported);
      saveQuotes();
      populateCategories();
      alert("Quotes imported successfully!");
    } catch (err) {
      alert("Import failed: " + err.message);
    }
  };
  reader.readAsText(event.target.files[0]);
}

// Initial load
populateCategories();
filterQuotes();
syncWithServer();
setInterval(syncWithServer, 30000); // every 30 seconds

// Event listeners
document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
newQuoteBtn.addEventListener("click", showRandomQuote);
exportBtn.addEventListener("click", exportToJsonFile);
importFile.addEventListener("change", importFromJsonFile);

// Optional: Show last session quote
const last = sessionStorage.getItem("lastQuote");
if (last) {
  const q = JSON.parse(last);
  quoteDisplay.textContent = `"${q.text}" — ${q.category} (last viewed)`;
}

// Expose functions for testing
window.populateCategories = populateCategories;
window.filterQuotes = filterQuotes;
window.addQuote = addQuote;