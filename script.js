let currentCorrect = "";
let currentQuestionRaw = "";
let score = JSON.parse(localStorage.getItem("score")) || { correct: 0, total: 0 };
let streak = 0;
let questionAnswered = false; // Track if the current question is already answered

// On page load
document.addEventListener("DOMContentLoaded", () => {
  initCategories();
  loadQuestion();
  initDarkMode();
  showScore();
  updateProgress();
});

// Load categories dynamically from API
function initCategories() {
  const select = document.getElementById("category");
  fetch("https://opentdb.com/api_category.php")
    .then(res => res.json())
    .then(data => {
      data.trivia_categories.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat.id;
        opt.textContent = cat.name;
        select.appendChild(opt);
      });
    });
}

// Load a new question
function loadQuestion() {
  questionAnswered = false; // Reset answered flag

  const cat = document.getElementById("category").value;
  const diff = document.getElementById("difficulty").value;
  const type = document.getElementById("type").value;

  let url = `https://opentdb.com/api.php?amount=1`;
  if (cat) url += `&category=${cat}`;
  if (diff) url += `&difficulty=${diff}`;
  if (type) url += `&type=${type}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const q = data.results[0];
      currentQuestionRaw = decodeHTML(q.question);
      currentCorrect = decodeHTML(q.correct_answer);

      // Display question
      document.getElementById("question").innerHTML = currentQuestionRaw;

      // Shuffle and display choices
      const choices = [...q.incorrect_answers.map(decodeHTML), currentCorrect]
        .sort(() => Math.random() - 0.5);

      document.getElementById("choices").innerHTML = choices
        .map(choice => `<button onclick="checkAnswer(this, '${escapeQuotes(choice)}')">${choice}</button>`)
        .join("");

      document.getElementById("output").textContent = "";
    });
}

// Handle answer selection
function checkAnswer(button, answer) {
  if (questionAnswered) return; // Prevent re-answering
  questionAnswered = true;

  const correctSound = document.getElementById("correctSound");
  const wrongSound = document.getElementById("wrongSound");

  // Disable all answer buttons
  const buttons = document.querySelectorAll("#choices button");
  buttons.forEach(btn => btn.disabled = true);

  score.total++;
  if (answer === currentCorrect) {
    score.correct++;
    streak++;
    button.classList.add("correct");
    document.getElementById("output").textContent = `✅ Correct! 🔥 Streak: ${streak}`;
    correctSound.play();
  } else {
    streak = 0;
    button.classList.add("wrong");
    document.getElementById("output").textContent = `❌ Wrong! Correct: ${currentCorrect}`;
    wrongSound.play();
  }

  localStorage.setItem("score", JSON.stringify(score));
  showScore();
  updateProgress();
}

// Show score
function showScore() {
  document.getElementById("score").textContent = `Score: ${score.correct} / ${score.total}`;
}

// Reset score
function resetScore() {
  score = { correct: 0, total: 0 };
  localStorage.setItem("score", JSON.stringify(score));
  showScore();
  updateProgress();
}

// Update progress bar
function updateProgress() {
  const progress = document.getElementById("progress");
  progress.value = score.correct;
  progress.max = score.total || 1;
}

// HTML decode helper
function decodeHTML(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

// Escape quotes in strings
function escapeQuotes(str) {
  return str.replace(/'/g, "\\'");
}

// Dark mode init
function initDarkMode() {
  const darkPref = localStorage.getItem("darkMode") === "true";
  document.body.classList.toggle("dark", darkPref);
  document.getElementById("darkModeToggle").checked = darkPref;
}

// Toggle dark mode
function toggleDarkMode() {
  const isDark = document.getElementById("darkModeToggle").checked;
  document.body.classList.toggle("dark", isDark);
  localStorage.setItem("darkMode", isDark);
}
