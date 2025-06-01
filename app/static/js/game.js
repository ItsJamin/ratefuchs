document.addEventListener("keydown", async (e) => {
    const isShift = e.shiftKey;
    const key = e.key;

    // Reveal answer with Enter
    if (key === "Enter") {
        const res = await fetch("/reveal_answer");
        const data = await res.json();

        const answerType = data.type;
        const answer = data.answer;

        if (answerType === "multiple_choice") {
            // Highlight correct answer by index
            const correctIndex = answer;
            document.querySelectorAll(".answer").forEach((el, i) => {
                if (i === correctIndex) {
                    el.classList.add("correct");
                } else {
                    el.classList.add("wrong");
                }
            });
        } else if (answerType === "guess") {
            // Show answer prominently as text
            let el = document.getElementById("answer-display");
            if (!el) {
                el = document.createElement("div");
                el.id = "answer-display";
                el.style.marginTop = "30px";
                el.style.fontSize = "2rem";
                el.style.color = "#26A69A";
                document.querySelector(".question-box")?.appendChild(el);
            }
            el.textContent = "Richtige Antwort: " + answer.toLocaleString();  // formatiert große Zahlen
        } else {
            // Fallback: einfach Antworttext zeigen
            let el = document.getElementById("answer-display");
            if (!el) {
                el = document.createElement("div");
                el.id = "answer-display";
                el.style.marginTop = "30px";
                el.style.fontSize = "2rem";
                el.style.color = "#26A69A";
                document.querySelector(".question-box")?.appendChild(el);
            }
            el.textContent = "Antwort: " + answer;
        }
    }


    // Number keys 1–9 → Score update
    if (/^[1-9]$/.test(key)) {
        const playerId = parseInt(key);
        const delta = isShift ? -100 : 100;

        const res = await fetch("/update_score", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ player_id: playerId, delta: delta })
        });

        const data = await res.json();
        const scoreEl = document.getElementById(`score-${playerId}`);
        scoreEl.textContent = data.player.score;

        // Optional: Add visual score animation
        scoreEl.classList.add("score-update");
        setTimeout(() => scoreEl.classList.remove("score-update"), 1000);
    }

    // N → nächste Frage
    if (key === "n") {
        const res = await fetch("/next_question", { method: "POST" });
        const data = await res.json();
        if (data.success) {
            window.location.reload();  // reload to show next question
        } else {
            alert("Keine weiteren Fragen.");
        }
    }
});
