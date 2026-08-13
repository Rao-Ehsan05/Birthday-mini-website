const form = document.getElementById("birthdayForm");
const mediaInput = document.getElementById("media");
const preview = document.getElementById("preview");

const setup = document.getElementById("setup");
const countdown = document.getElementById("countdown");
const birthday = document.getElementById("birthday");
const countNumber = document.getElementById("countNumber");

const birthdayMusic = document.getElementById("birthdayMusic");
const birthdayEffects = document.getElementById("birthdayEffects");
const musicBtn = document.getElementById("musicBtn");

let currentData = null;


/* =========================================================
   PHOTO / VIDEO PREVIEW
   ========================================================= */

mediaInput.addEventListener("change", () => {

    preview.innerHTML = "";

    [...mediaInput.files].forEach(file => {

        const url = URL.createObjectURL(file);

        const el = file.type.startsWith("video/")
            ? document.createElement("video")
            : document.createElement("img");

        el.src = url;

        if (el.tagName === "VIDEO") {
            el.muted = true;
        }

        preview.appendChild(el);

    });

});


/* =========================================================
   FORM SUBMISSION
   ========================================================= */

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const fd = new FormData(form);

    const response = await fetch("/api/create", {
        method: "POST",
        body: fd
    });

    const result = await response.json();

    if (!response.ok) {
        return alert(result.error || "Something went wrong.");
    }

    currentData = result.data;

    setup.classList.add("hidden");

    countdown.classList.remove("hidden");

    runCountdown();

});


/* =========================================================
   COUNTDOWN
   ========================================================= */

function runCountdown() {

    let n = 3;

    countNumber.textContent = n;

    const timer = setInterval(() => {

        n--;

        if (n > 0) {

            countNumber.textContent = n;

            countNumber.style.animation = "none";

            void countNumber.offsetWidth;

            countNumber.style.animation = "pop .8s ease";

        } else {

            clearInterval(timer);

            showBirthday();

        }

    }, 1000);

}


/* =========================================================
   SHOW BIRTHDAY
   ========================================================= */

function showBirthday() {

    countdown.classList.add("hidden");

    birthday.classList.remove("hidden");

    document.getElementById("birthdayName").textContent =
        currentData.name;

    document.getElementById("birthdayAge").textContent =
        currentData.birthday_number;


    /* Gallery */

    const gallery = document.getElementById("gallery");

    gallery.innerHTML = "";


    (currentData.media || []).forEach(item => {

        const el =
            item.type === "video"
                ? document.createElement("video")
                : document.createElement("img");

        el.src = item.url;

        if (item.type === "video") {

            el.controls = true;
            el.playsInline = true;

        }

        gallery.appendChild(el);

    });


    /* Birthday celebration */

    createFullScreenCelebration();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   MUSIC BUTTON
   ========================================================= */

musicBtn.addEventListener("click", async () => {

    if (birthdayMusic.paused) {

        try {

            await birthdayMusic.play();

            musicBtn.textContent =
                "🔊 Birthday Music On";

            musicBtn.classList.add("playing");

        } catch (error) {

            alert(
                "The music could not be started. Please check your MP3 file."
            );

        }

    } else {

        birthdayMusic.pause();

        musicBtn.textContent =
            "🔇 Birthday Music Off";

        musicBtn.classList.remove("playing");

    }

});


/* =========================================================
   DOUBLE CLICK = FULL SCREEN BALLOON BURST
   ========================================================= */

document.addEventListener("dblclick", () => {

    if (!birthday.classList.contains("hidden")) {

        createFullScreenCelebration();

    }

});


/* =========================================================
   FULL SCREEN CELEBRATION
   ========================================================= */

function createFullScreenCelebration() {

    if (!birthdayEffects) {
        return;
    }


    /* Flash */

    const flash = document.createElement("div");

    flash.className = "celebration-flash";

    birthdayEffects.appendChild(flash);

    setTimeout(() => {

        flash.remove();

    }, 400);


    /* Balloons */

    const numberOfBalloons = 35;

    for (let i = 0; i < numberOfBalloons; i++) {

        createBurstBalloon();

    }


    /* Confetti */

    const numberOfConfetti = 100;

    for (let i = 0; i < numberOfConfetti; i++) {

        createConfetti();

    }

}


/* =========================================================
   CREATE BURST BALLOON
   ========================================================= */

function createBurstBalloon() {

    const balloon = document.createElement("div");

    balloon.className = "burst-balloon";


    const colors = [
        "#ff6b81",
        "#6c63ff",
        "#ffd166",
        "#06d6a0",
        "#ff9f1c",
        "#ef476f",
        "#8338ec",
        "#00b4d8",
        "#f72585",
        "#3a86ff"
    ];


    balloon.style.background =
        colors[
            Math.floor(
                Math.random() * colors.length
            )
        ];


    balloon.style.left =
        `${Math.random() * window.innerWidth}px`;

    balloon.style.top =
        `${Math.random() * window.innerHeight}px`;


    birthdayEffects.appendChild(balloon);


    setTimeout(() => {

        balloon.remove();

    }, 800);

}


/* =========================================================
   CREATE CONFETTI
   ========================================================= */

function createConfetti() {

    const confetti = document.createElement("div");

    confetti.className = "burst-confetti";


    const colors = [
        "#ff6b81",
        "#6c63ff",
        "#ffd166",
        "#06d6a0",
        "#ff9f1c",
        "#ef476f",
        "#8338ec",
        "#00b4d8"
    ];


    confetti.style.background =
        colors[
            Math.floor(
                Math.random() * colors.length
            )
        ];


    const startX =
        Math.random() * window.innerWidth;

    const startY =
        Math.random() * window.innerHeight;


    const moveX =
        (Math.random() - 0.5) * 600;

    const moveY =
        (Math.random() - 0.5) * 600;


    confetti.style.left =
        `${startX}px`;

    confetti.style.top =
        `${startY}px`;


    confetti.style.setProperty(
        "--x",
        `${moveX}px`
    );

    confetti.style.setProperty(
        "--y",
        `${moveY}px`
    );


    birthdayEffects.appendChild(confetti);


    setTimeout(() => {

        confetti.remove();

    }, 1300);

}


/* =========================================================
   CREATE ANOTHER BIRTHDAY
   ========================================================= */

document.getElementById("newBtn").addEventListener("click", () => {

    birthdayMusic.pause();

    birthdayMusic.currentTime = 0;

    location.reload();

});


/* =========================================================
   SAVE BIRTHDAY
   ========================================================= */

document.getElementById("saveBtn").addEventListener("click", async () => {

    if (!currentData) {
        return;
    }


    const payload = {
        ...currentData,
        saved_at: new Date().toISOString()
    };


    const response = await fetch("/api/save", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(payload)

    });


    await response.json();


    const blob = new Blob(
        [
            JSON.stringify(
                payload,
                null,
                2
            )
        ],
        {
            type: "application/json"
        }
    );


    const a = document.createElement("a");

    a.href =
        URL.createObjectURL(blob);

    a.download =
        `${currentData.name.replace(/\s+/g, "_")}_birthday.json`;

    a.click();


    URL.revokeObjectURL(a.href);


    alert(
        "Your birthday data file has been saved to your device."
    );

});