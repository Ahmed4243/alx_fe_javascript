// Initial array of quotes
let quotes = [
  { text: "The only way to do great work is to love what you do.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "If you judge people, you have no time to love them.", category: "Wisdom" },
];

// Get DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categorySelect = document.getElementById("categorySelect");

// Extract unique categories and populate dropdown
function updateCategoryOptions() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categorySelect.innerHTML = ""; // Clear old options
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

// Display a random quote based on selected category
function showRandomQuote() {
  const selectedCategory = categorySelect.value;
  const filteredQuotes = quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes found for this category.";
    return;
  }

  const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  quoteDisplay.textContent = `"${randomQuote.text}" — ${randomQuote.category}`;
}

// Create the quote form dynamically and handle quote addition
function createAddQuoteForm() {
  const container = document.createElement("div");

  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.placeholder = "Enter quote";
  container.appendChild(textInput);

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter category";
  container.appendChild(categoryInput);

  const button = document.createElement("button");
  button.id = "addQuoteBtn";
  button.textContent = "Add Quote";
  container.appendChild(button);

  document.body.appendChild(container);

  button.addEventListener("click", () => {
    const text = textInput.value.trim();
    const category = categoryInput.value.trim();

    if (!text || !category) {
      alert("Please fill in both fields.");
      return;
    }

    quotes.push({ text, category });
    updateCategoryOptions();

    textInput.value = "";
    categoryInput.value = "";

    alert("Quote added!");
  });
}

// Event listeners
newQuoteBtn.addEventListener("click", showRandomQuote);

// Initial load
updateCategoryOptions();
createAddQuoteForm(); // Call it on load

// Expose for test scripts
window.createAddQuoteForm = createAddQuoteForm;
