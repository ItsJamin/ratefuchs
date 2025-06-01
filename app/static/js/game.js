const pressedKeys = new Set();
let is_revealed = false;

// Handle answer reveal visual feedback for multiple choice
function revealAnswer(correctIndex) {
    const answers = document.querySelectorAll(".answer");
    answers.forEach((el, i) => {
        if (i === correctIndex) {
            el.classList.add("correct", "glow", "scale-pop");
        } else {
            el.classList.add("dimmed");
        }
        el.classList.add("disabled");
    });
}

// Show floating score delta near player name
function showFloatingDelta(playerId, delta) {
    const playerEl = document.querySelector(`.player[data-id='${playerId}']`);
    if (!playerEl) return;

    const deltaEl = document.createElement("div");
    deltaEl.classList.add("floating-delta");
    deltaEl.textContent = (delta > 0 ? "+" : "") + delta;

    const nameEl = playerEl.querySelector(".name");
    if (!nameEl) return;

    // Position based on offset relative to parent container
    const rect = nameEl.getBoundingClientRect();
    const parentRect = playerEl.getBoundingClientRect();
    deltaEl.style.left = `${rect.left - parentRect.left}px`;
    deltaEl.style.top = `${rect.top - parentRect.top - 25}px`;

    playerEl.appendChild(deltaEl);
    deltaEl.addEventListener("animationend", () => deltaEl.remove());
}

// Animate score text pulse (green for positive, red for negative)
function pulseScore(playerId, delta) {
    const scoreEl = document.querySelector(`#score-${playerId} .score-value`);
    if (!scoreEl) return;

    scoreEl.classList.remove("pulse-score-positive", "pulse-score-negative");
    void scoreEl.offsetWidth; // Force reflow to restart animation

    scoreEl.classList.add(delta > 0 ? "pulse-score-positive" : "pulse-score-negative");

    setTimeout(() => {
        scoreEl.classList.remove("pulse-score-positive", "pulse-score-negative");
    }, 1000);
}

// Reveal answer and update UI accordingly
async function revealAnswerAndUpdateUI(data) {
    const { type, answer } = data;

    if (type === "multiple_choice") {
        revealAnswer(answer);
    } else {
        showAnswerText(typeof answer === "number" ? answer.toLocaleString() : answer);
    }

    is_revealed = true;
}

// Typewriter effect
function typeText(element, text, speed = 30) {
    return new Promise(resolve => {
        element.classList.remove('typing');
        element.innerHTML = '';
        let i = 0;

        function typeChar() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(typeChar, speed);
            } else {
                element.classList.remove('typing');
                resolve();
            }
        }

        element.classList.add('typing');
        typeChar();
    });
}

async function showAnswerText(text) {
    const display = document.getElementById("answer-display");
    await typeText(display, text);
}



document.addEventListener("keydown", async (e) => {
    pressedKeys.add(e.code);

    const isShift = pressedKeys.has("ShiftLeft") || pressedKeys.has("ShiftRight");

    if (e.code === "Enter" && !is_revealed) {
        const res = await fetch("/reveal_answer");
        const data = await res.json();
        await revealAnswerAndUpdateUI(data);
    }

    if (e.code.startsWith("Digit") && is_revealed) {
        const digit = parseInt(e.code.replace("Digit", ""));
        if (digit >= 1 && digit <= 9) {
            const delta = isShift ? -100 : 100;

            const res = await fetch("/update_score", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ player_id: digit, delta: delta })
            });

            const data = await res.json();

            const scoreValueEl = document.querySelector(`#score-${digit} .score-value`);
            if (scoreValueEl) scoreValueEl.textContent = data.player.score;

            showFloatingDelta(digit, delta);
            pulseScore(digit, delta);
        }
    }

    if (e.code === "Space" && is_revealed) {
        e.preventDefault();
        const res = await fetch("/next_question", { method: "POST" });
        const data = await res.json();

        if (data.success) {
            is_revealed = false;
            window.location.reload();
        } else {
            alert("No more questions.");
        }
    }
});

document.addEventListener("keyup", (e) => {
    pressedKeys.delete(e.code);
});

document.addEventListener("DOMContentLoaded", async () => {
    const questionElement = document.getElementById("question-text");
    const questionText = questionElement.dataset.question;

    if (questionText) {
        questionElement.textContent = questionText;
    }
});