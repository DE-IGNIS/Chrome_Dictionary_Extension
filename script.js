const searchBtn = document.getElementById("searchBtn");
const wordInput = document.getElementById("word_search");
const contentElement = document.getElementById("content");

searchBtn.addEventListener("click", searchWord);

// Attach keydown listener only on the input field
wordInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    searchWord();
  }
});

// Debounce function to delay search execution on continuous typing
function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

// Optionally debounce the input if you want live search suggestions
wordInput.addEventListener(
  "input",
  debounce(() => {
    if (wordInput.value.trim()) {
      searchWord();
    }
  }, 300)
);

async function searchWord() {
  const word = wordInput.value.trim();
  if (!word) {
    contentElement.innerHTML = "<li>Please enter a word to search.</li>";
    return;
  }

  // Disable button or show loading indicator if desired
  searchBtn.disabled = true;
  contentElement.innerHTML = "<li>Loading...</li>";

  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );

    if (!response.ok) {
      contentElement.innerHTML = `<li>No results found for "${word}".</li>`;
      searchBtn.disabled = false;
      return;
    }

    const data = await response.json();

    const allDefinitions = data.flatMap((entry) =>
      entry.meanings.flatMap((meaning) =>
        meaning.definitions.map((d) => d.definition)
      )
    );

    if (allDefinitions.length === 0) {
      contentElement.innerHTML = `<li>No definitions found for "${word}".</li>`;
      searchBtn.disabled = false;
      return;
    }

    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();
    allDefinitions.forEach((definition) => {
      const li = document.createElement("li");
      li.textContent = definition;
      fragment.appendChild(li);
    });

    contentElement.innerHTML = ""; // Clear previous content
    contentElement.appendChild(fragment);
  } catch (error) {
    contentElement.innerHTML =
      "<li>Error fetching data. Please try again.</li>";
    console.error("Error fetching data:", error);
  } finally {
    searchBtn.disabled = false;
  }
}
