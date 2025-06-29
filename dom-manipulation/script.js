// Load from localStorage or initialize default quotes
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The only way to do great work is to love what you do.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "If you judge people, you have no time to love them.", category: "Wisdom" }
];

const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categorySelect = document.getElementById("categorySelect");
const categoryFilter = document.getElementById("categoryFilter");
const addQuoteBtn = document.getElementById("addQuoteBtn");

// Store selected filter in localStorage
function saveFilterSelection() {
  localStorage.setItem("selectedCategory", categoryFilter.value);
}

// Load saved filter if available
function loadFilterSelection() {
  const saved = localStorage.getItem("selectedCategory");
  if (saved) categoryFilter.value = saved;
}

// Populate both dropdowns
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categorySelect.innerHTML = "";
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  categories.forEach(cat => {
    const option1 = document.createElement("option");
    option1.value = cat;
    option1.textContent = cat;
    categorySelect.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = cat;
    option2.textContent = cat;
    categoryFilter.appendChild(option2);
  }

  );
  loadFilterSelection();
}

// Show quote based on dropdown
function showRandomQuote() {
  const selectedCategory = categorySelect.value;
  const filtered = quotes.filter(q => q.category === selectedCategory);
  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes found for this category.";
    return;
  }
  const q = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.textContent = `"${q.text}" — ${q.category}`;
}

// Filter displayed quotes
function filterQuotes() {
  saveFilterSelection();
  const filter = categoryFilter.value;
  const filtered = (filter === "all") ? quotes : quotes.filter(q => q.category === filter);
  const list = filtered.map(q => `"${q.text}" — ${q.category}`).join("\n\n");
  quoteDisplay.textContent = list || "No quotes found.";
}

// Add new quote
addQuoteBtn.addEventListener("click", () => {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please fill in both fields.");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  localStorage.setItem("quotes", JSON.stringify(quotes));
  populateCategories();
  filterQuotes();

  // ✅ Send to simulated server
  fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newQuote)
  })
    .then(res => res.json())
    .then(data => {
      console.log("Synced to server:", data);
    })
    .catch(err => {
      console.warn("Server sync failed:", err);
    });

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  alert("Quote added!");
});

// Sync from server (simulated fetch)
function syncFromServer() {
  fetch("https://jsonplaceholder.typicode.com/posts")
    .then(res => res.json())
    .then(serverQuotes => {
      let added = 0;
      serverQuotes.forEach(item => {
        if (item.title && item.body) {
          const quoteObj = { text: item.body, category: item.title };
          const exists = quotes.some(q => q.text === quoteObj.text && q.category === quoteObj.category);
          if (!exists) {
            quotes.push(quoteObj);
            added++;
          }
        }
      });
      if (added > 0) {
        localStorage.setItem("quotes", JSON.stringify(quotes));
        populateCategories();
        alert(`📥 Synced ${added} new quotes from server.`);
      }
    })
    .catch(err => {
      console.warn("Error syncing from server:", err);
    });
}

// Event listeners
newQuoteBtn.addEventListener("click", showRandomQuote);
categoryFilter.addEventListener("change", filterQuotes);

// Initial setup
populateCategories();
loadFilterSelection();
filterQuotes();
syncFromServer(); // Periodic sync
setInterval(syncFromServer, 60000); // Every 60 seconds
