const pressedKeys = new Set();
let is_revealed = false;

document.addEventListener("keydown", async (e) => {
    pressedKeys.add(e.code);

    const isShift = pressedKeys.has("ShiftLeft") || pressedKeys.has("ShiftRight");

    // Reveal answer with Enter
    if (e.code === "Enter" && !is_revealed) {
        const res = await fetch("/reveal_answer");
        const data = await res.json();

        const answerType = data.type;
        const answer = data.answer;

        if (answerType === "multiple_choice") {
            const correctIndex = answer;
            document.querySelectorAll(".answer").forEach((el, i) => {
                if (i === correctIndex) {
                    el.classList.add("correct");
                } else {
                    el.classList.add("wrong");
                }
            });
        } else {
            let el = document.getElementById("answer-display");
            if (!el) {
                el = document.createElement("div");
                el.id = "answer-display";
                el.style.marginTop = "30px";
                el.style.fontSize = "2rem";
                el.style.color = "#26A69A";
                document.querySelector(".question-box")?.appendChild(el);
            }
            el.textContent = "Richtige Antwort: " + (
                typeof answer === "number" ? answer.toLocaleString() : answer
            );
        }
        is_revealed = true;
    }

    // Digit1–Digit9 → Score update (only after reveal)
    if (e.code.startsWith("Digit") && is_revealed) {
        const digit = parseInt(e.code.replace("Digit", ""));
        if (digit >= 1 && digit <= 9) {
            const delta = isShift ? -100 : 100;

            const res = await fetch("/update_score", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ player_id: digit, delta: delta })
            });

            const data = await res.json();
            const scoreEl = document.getElementById(`score-${digit}`);
            scoreEl.textContent = data.player.score;

            scoreEl.classList.add("score-update");
            setTimeout(() => scoreEl.classList.remove("score-update"), 1000);
        }
    }

    // N → next question
    if (e.code === "KeyN") {
        const res = await fetch("/next_question", { method: "POST" });
        const data = await res.json();
        if (data.success) {
            is_revealed = false;
            window.location.reload();
        } else {
            alert("Keine weiteren Fragen.");
        }
    }
});

document.addEventListener("keyup", (e) => {
    pressedKeys.delete(e.code);
});
