async function loadQuestion() {
  const res = await fetch('/api/question');
  const data = await res.json();

  const questionText = document.getElementById('question-text');
  const mediaContainer = document.getElementById('question-media');
  const choicesContainer = document.getElementById('choices-container');

  questionText.textContent = data.question;

  mediaContainer.innerHTML =
    data.media && data.media.trim() !== ''
      ? `<img src="/static/media/${data.media}" alt="Fragebild">`
      : '';

  choicesContainer.innerHTML = '';

  if (data.type === "multiple_choice" && Array.isArray(data.choices)) {
    data.choices.forEach((choice, idx) => {
      const col = document.createElement('div');
      col.className = 'col-md-6';
      const btn = document.createElement('button');
      btn.textContent = choice;
      btn.className = 'btn choice-button';
      btn.onclick = () => lockInChoice(btn, idx, data.correct);
      col.appendChild(btn);
      choicesContainer.appendChild(col);
    });
  } else if (data.type === "estimate") {
    renderEstimateInputs(data, choicesContainer);
  }
}

// Render estimate question inputs for both teams
function renderEstimateInputs(data, container) {
  const teams = ['Team A', 'Team B'];

  teams.forEach((team, index) => {
    const col = document.createElement('div');
    col.className = 'col-md-6';
    const group = document.createElement('div');
    group.className = 'mb-3';

    const label = document.createElement('label');
    label.textContent = `${team} Schätzung`;
    label.className = 'form-label';

    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'form-control estimate-input';
    input.id = `estimate-${index}`;

    group.appendChild(label);
    group.appendChild(input);
    col.appendChild(group);
    container.appendChild(col);
  });

  const submitRow = document.createElement('div');
  submitRow.className = 'col-12 text-center mt-3';

  const submitBtn = document.createElement('button');
  submitBtn.textContent = "Antwort bestätigen";
  submitBtn.className = "btn btn-success btn-lg";
  submitBtn.onclick = () => handleEstimate(data);

  submitRow.appendChild(submitBtn);
  container.appendChild(submitRow);
}

// Handle estimate question
function handleEstimate(data) {
  const valA = parseFloat(document.getElementById('estimate-0').value);
  const valB = parseFloat(document.getElementById('estimate-1').value);
  const correct = parseFloat(data.answer);

  const diffA = Math.abs(valA - correct);
  const diffB = Math.abs(valB - correct);

  const winner = diffA === diffB ? "draw" : (diffA < diffB ? 0 : 1);

  // Color feedback
  const inputA = document.getElementById('estimate-0');
  const inputB = document.getElementById('estimate-1');

  if (winner === "draw") {
    inputA.classList.add('is-valid');
    inputB.classList.add('is-valid');
  } else {
    const winnerInput = document.getElementById(`estimate-${winner}`);
    const loserInput = document.getElementById(`estimate-${1 - winner}`);

    winnerInput.classList.add('is-valid');
    loserInput.classList.add('is-invalid');
  }

  // Show correct answer
  const resultDiv = document.createElement('div');
  resultDiv.className = 'mt-4 text-warning fw-bold';
  resultDiv.innerText = `Richtige Antwort: ${correct} ${data.unit || ''}`;
  document.getElementById('choices-container').appendChild(resultDiv);

  showNextButton();
}

function lockInChoice(button, selectedIndex, correctIndex) {
  const buttons = document.querySelectorAll('.choice-button');
  buttons.forEach(btn => {
    btn.classList.add('locked');
    btn.disabled = true;
  });

  button.classList.add(selectedIndex === correctIndex ? 'correct' : 'wrong');
  const correctBtn = buttons[correctIndex];
  if (correctBtn !== button) {
    correctBtn.classList.add('correct');
  }

  showNextButton();
}

function showNextButton() {
  const container = document.getElementById('choices-container');
  const row = document.createElement('div');
  row.className = 'col-12 mt-4';

  const btn = document.createElement('button');
  btn.textContent = "Nächste Frage";
  btn.className = "btn btn-outline-warning btn-lg";
  btn.onclick = loadQuestion;

  row.appendChild(btn);
  container.appendChild(row);
}

document.addEventListener('DOMContentLoaded', loadQuestion);
