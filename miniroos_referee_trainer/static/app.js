const bank = JSON.parse(document.getElementById("question-bank-data").textContent);

let currentGroupKey = null;
let currentQuestions = [];
let currentIndex = 0;
let score = 0;
let answered = false;

const groupGrid = document.getElementById("group-grid");
const quizPanel = document.getElementById("quiz-panel");
const resultsPanel = document.getElementById("results-panel");
const scoreEl = document.getElementById("score");
const quizTitle = document.getElementById("quiz-title");
const questionCounter = document.getElementById("question-counter");
const questionText = document.getElementById("question-text");
const choicesWrap = document.getElementById("choices");
const feedback = document.getElementById("feedback");
const feedbackTitle = document.getElementById("feedback-title");
const feedbackExplanation = document.getElementById("feedback-explanation");
const feedbackTip = document.getElementById("feedback-tip");
const nextButton = document.getElementById("next-button");
const restartButton = document.getElementById("restart-button");
const backButton = document.getElementById("back-button");
const progressBar = document.getElementById("progress-bar");
const resultsTitle = document.getElementById("results-title");
const resultsSummary = document.getElementById("results-summary");
const resultsMessage = document.getElementById("results-message");
const resultsRestart = document.getElementById("results-restart");
const resultsChangeGroup = document.getElementById("results-change-group");

function shuffle(items) {
  const clone = [...items];
  for (let index = clone.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [clone[index], clone[swapIndex]] = [clone[swapIndex], clone[index]];
  }
  return clone;
}

function renderGroupCards() {
  groupGrid.innerHTML = "";

  Object.entries(bank).forEach(([key, group]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "group-card";
    button.addEventListener("click", () => beginQuiz(key));

    button.innerHTML = `
      <span class="group-tag">${group.title}</span>
      <strong>${group.summary}</strong>
      <span class="group-meta">${group.questions.length} questions</span>
    `;

    groupGrid.appendChild(button);
  });
}

function beginQuiz(groupKey) {
  currentGroupKey = groupKey;
  currentQuestions = shuffle(bank[groupKey].questions);
  currentIndex = 0;
  score = 0;
  answered = false;

  scoreEl.textContent = "0";
  resultsPanel.classList.add("hidden");
  quizPanel.classList.remove("hidden");
  renderQuestion();
}

function renderQuestion() {
  const group = bank[currentGroupKey];
  const question = currentQuestions[currentIndex];

  answered = false;
  quizTitle.textContent = group.title;
  questionCounter.textContent = `Question ${currentIndex + 1} of ${currentQuestions.length}`;
  questionText.textContent = question.prompt;
  feedback.classList.add("hidden");
  nextButton.classList.add("hidden");
  restartButton.classList.add("hidden");
  choicesWrap.innerHTML = "";

  const progress = (currentIndex / currentQuestions.length) * 100;
  progressBar.style.width = `${progress}%`;

  question.choices.forEach((choice, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice";
    button.textContent = choice;
    button.addEventListener("click", () => checkAnswer(index));
    choicesWrap.appendChild(button);
  });
}

function checkAnswer(selectedIndex) {
  if (answered) {
    return;
  }

  answered = true;
  const question = currentQuestions[currentIndex];
  const choiceButtons = [...document.querySelectorAll(".choice")];
  const correct = selectedIndex === question.answer;

  choiceButtons.forEach((button, index) => {
    button.disabled = true;
    if (index === question.answer) {
      button.classList.add("correct");
    } else if (index === selectedIndex) {
      button.classList.add("incorrect");
    }
  });

  if (correct) {
    score += 1;
    scoreEl.textContent = String(score);
  }

  feedbackTitle.textContent = correct ? "Correct call" : "Review the restart";
  feedbackExplanation.textContent = question.explanation;
  feedbackTip.textContent = `Confidence tip: ${question.confidence_tip}`;
  feedback.classList.remove("hidden");

  nextButton.textContent = currentIndex === currentQuestions.length - 1 ? "See Results" : "Next Question";
  nextButton.classList.remove("hidden");

  if (currentIndex === currentQuestions.length - 1) {
    restartButton.classList.remove("hidden");
  }
}

function submitResult(groupTitle, score, total, percent) {
  fetch("submit-result", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ age_group: groupTitle, score, total, percent }),
  }).catch(() => {}); // silently ignore network errors
}

function showResults() {
  const group = bank[currentGroupKey];
  const total = currentQuestions.length;
  const percent = Math.round((score / total) * 100);
  let message = "Good start. One more pass through this track will make the match-day calls feel much more automatic.";

  if (percent >= 85) {
    message = "Sharp work. You’re making quick, accurate calls and reading the age-group differences well.";
  } else if (percent >= 60) {
    message = "Solid base. Focus on restart spacing and what changes between formats to level up fast.";
  }

  submitResult(group.title, score, total, percent);

  quizPanel.classList.add("hidden");
  resultsPanel.classList.remove("hidden");
  progressBar.style.width = "100%";
  resultsTitle.textContent = `${group.title} complete`;
  resultsSummary.textContent = `You scored ${score} out of ${total} (${percent}%).`;
  resultsMessage.textContent = message;
}

function resetToChooser() {
  quizPanel.classList.add("hidden");
  resultsPanel.classList.add("hidden");
  feedback.classList.add("hidden");
  progressBar.style.width = "0%";
  currentGroupKey = null;
}

nextButton.addEventListener("click", () => {
  if (currentIndex === currentQuestions.length - 1) {
    showResults();
    return;
  }

  currentIndex += 1;
  renderQuestion();
});

restartButton.addEventListener("click", () => {
  beginQuiz(currentGroupKey);
});

backButton.addEventListener("click", () => {
  resetToChooser();
});

resultsRestart.addEventListener("click", () => {
  beginQuiz(currentGroupKey);
});

resultsChangeGroup.addEventListener("click", () => {
  resetToChooser();
});

renderGroupCards();
