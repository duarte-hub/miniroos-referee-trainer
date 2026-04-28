let bank = {};
let currentGroupKey = "u6_7";
let currentQuestions = [];
let currentIndex = 0;
let score = 0;
let answered = false;

const ageGroupSelect = document.getElementById("age-group");
const startButton = document.getElementById("start-button");
const quizPanel = document.getElementById("quiz-panel");
const resultsPanel = document.getElementById("results-panel");
const quizTitle = document.getElementById("quiz-title");
const questionCounter = document.getElementById("question-counter");
const questionText = document.getElementById("question-text");
const choicesWrap = document.getElementById("choices");
const scoreEl = document.getElementById("score");
const feedback = document.getElementById("feedback");
const feedbackTitle = document.getElementById("feedback-title");
const feedbackExplanation = document.getElementById("feedback-explanation");
const feedbackTip = document.getElementById("feedback-tip");
const nextButton = document.getElementById("next-button");
const restartButton = document.getElementById("restart-button");
const progressBar = document.getElementById("progress-bar");
const resultsTitle = document.getElementById("results-title");
const resultsSummary = document.getElementById("results-summary");
const resultsMessage = document.getElementById("results-message");
const resultsRestart = document.getElementById("results-restart");

async function loadQuestions() {
  const response = await fetch("./api/questions");
  bank = await response.json();

  Object.entries(bank).forEach(([key, group]) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = `${group.title} - ${group.summary}`;
    ageGroupSelect.appendChild(option);
  });
}

function shuffle(items) {
  const clone = [...items];
  for (let index = clone.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [clone[index], clone[swapIndex]] = [clone[swapIndex], clone[index]];
  }
  return clone;
}

function beginQuiz() {
  currentGroupKey = ageGroupSelect.value;
  currentQuestions = shuffle(bank[currentGroupKey].questions);
  currentIndex = 0;
  score = 0;
  answered = false;

  resultsPanel.classList.add("hidden");
  quizPanel.classList.remove("hidden");
  renderQuestion();
}

function renderQuestion() {
  const group = bank[currentGroupKey];
  const question = currentQuestions[currentIndex];

  answered = false;
  scoreEl.textContent = score;
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
    button.className = "button choice";
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

  choiceButtons.forEach((button, index) => {
    button.disabled = true;
    if (index === question.answer) {
      button.classList.add("correct");
    } else if (index === selectedIndex) {
      button.classList.add("incorrect");
    }
  });

  const correct = selectedIndex === question.answer;
  if (correct) {
    score += 1;
    scoreEl.textContent = score;
  }

  feedbackTitle.textContent = correct ? "Correct call" : "Good learning moment";
  feedbackExplanation.textContent = question.explanation;
  feedbackTip.textContent = `Confidence tip: ${question.confidence_tip}`;
  feedback.classList.remove("hidden");

  if (currentIndex === currentQuestions.length - 1) {
    restartButton.classList.remove("hidden");
    nextButton.textContent = "See Results";
  } else {
    nextButton.textContent = "Next Question";
  }

  nextButton.classList.remove("hidden");
}

function showResults() {
  const group = bank[currentGroupKey];
  const total = currentQuestions.length;
  const percent = Math.round((score / total) * 100);
  let message = "";

  if (percent >= 85) {
    message = "Strong match-day confidence. You’re reading the age-group rules sharply and making calm restart decisions.";
  } else if (percent >= 60) {
    message = "Solid foundation. A second pass will tighten your restart details and distance management.";
  } else {
    message = "Good start. Focus on the restart procedures and what changes between age groups to build faster confidence.";
  }

  quizPanel.classList.add("hidden");
  resultsPanel.classList.remove("hidden");
  progressBar.style.width = "100%";
  resultsTitle.textContent = `${group.title} complete`;
  resultsSummary.textContent = `You scored ${score} out of ${total} (${percent}%).`;
  resultsMessage.textContent = message;
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
  beginQuiz();
});

resultsRestart.addEventListener("click", () => {
  beginQuiz();
});

startButton.addEventListener("click", () => {
  beginQuiz();
});

loadQuestions();
