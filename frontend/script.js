let video = document.getElementById("cam");
let emotionText = document.getElementById("emotionText");
let emotionEmoji = document.getElementById("emotionEmoji");
let player = document.getElementById("player");
const heartsContainer = document.getElementById("heartsContainer");

let currentEmotion = null;
let detecting = false;

// Emotion configuration
const emotionConfig = {
    happy: { emoji: '😊', text: 'Happy', hearts: ['💛', '💖', '✨', '🌟'] },
    sad: { emoji: '😢', text: 'Sad', hearts: ['💙', '💧', '🌧️', '💔'] },
    angry: { emoji: '😠', text: 'Angry', hearts: ['❤️‍🔥', '💢', '⚡', '🔥'] },
    neutral: { emoji: '😐', text: 'Neutral', hearts: ['🤍', '💭', '☁️', '🌸'] },
    fear: { emoji: '😨', text: 'Fear', hearts: ['💜', '👻', '🌙', '⭐'] },
    disgust: { emoji: '🤢', text: 'Disgust', hearts: ['💚', '🍀', '🌿', '🌱'] },
    surprise: { emoji: '😲', text: 'Surprise', hearts: ['🧡', '🎉', '✨', '🎊'] }
};

// Emotion → Song mapping
const songs = {
    happy: ["music/happy/1.mp3"],
    sad: ["music/sad/1.mp3"],
    angry: ["music/angry/1.mp3"],
    neutral: ["music/neutral/1.mp3"],
    fear: ["music/fear/1.mp3"],
    disgust: ["music/disgust/1.mp3"],
    surprise: ["music/surprise/1.mp3"]
};

// Start webcam
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
        setTimeout(() => detectEmotionLoop(), 2000);
    })
    .catch(err => {
        console.error("Webcam error:", err);
        emotionText.innerText = "Camera access denied";
    });

// Update UI
function updateUI(emotion) {
    const config = emotionConfig[emotion];
    if (!config) return;

    emotionEmoji.innerText = config.emoji;
    emotionText.innerText = config.text;
    document.body.className = emotion;

    createFloatingIcons(config.hearts);
}

function createFloatingIcons(icons) {
    const icon = document.createElement("div");
    icon.className = "floating-heart";
    icon.innerText = icons[Math.floor(Math.random() * icons.length)];
    icon.style.left = Math.random() * 100 + "%";
    icon.style.animationDuration = (Math.random() * 2 + 3) + "s";

    heartsContainer.appendChild(icon);
    setTimeout(() => icon.remove(), 5000);
}

// -------------------------
// DETECTION LOGIC
// -------------------------
function detectEmotionLoop() {
    console.log("Detection loop started");
    detecting = true;

    const interval = setInterval(() => {
        if (!detecting) {
            clearInterval(interval);
            return;
        }

        detectEmotionOnce().then(emotion => {
            if (emotion && emotion !== "no_face") {
                console.log("Emotion detected:", emotion);

                detecting = false;
                clearInterval(interval);

                playSong(emotion);
            }
        });

    }, 1200);
}

function detectEmotionOnce() {
    return new Promise(resolve => {
        if (!video.videoWidth) return resolve("no_face");

        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d").drawImage(video, 0, 0);

        canvas.toBlob(blob => {
            const form = new FormData();
            form.append("frame", blob);

            fetch("http://127.0.0.1:5000/detect", {
                method: "POST",
                body: form
            })
            .then(res => res.json())
            .then(data => {
                const emotion = data.emotion.toLowerCase();
                updateUI(emotion);
                resolve(emotion);
            })
            .catch(err => {
                console.error("Detection error:", err);
                resolve("no_face");
            });

        }, "image/jpeg");
    });
}

// -------------------------
// FIXED SONG PLAYBACK LOGIC
// -------------------------
function playSong(emotion) {
    if (!songs[emotion]) return;

    currentEmotion = emotion;
    const song = songs[emotion][0];

    console.log("Playing song:", song);

    // RESET PLAYER — this ensures old events are removed
    const newPlayer = player.cloneNode(true);
    player.parentNode.replaceChild(newPlayer, player);
    player = newPlayer;

    // Load and play
    player.src = song;

    player.addEventListener("loadedmetadata", () => {
        console.log("Song loaded. Playing...");
        player.play().catch(err => console.log("Autoplay blocked:", err));
    });

    // When song ENDS → restart detection
    player.addEventListener("ended", () => {
        console.log("Song ended. Restarting detection...");
        detectEmotionLoop();
    });

    // DEBUGGING
    player.addEventListener("play", () => console.log("DEBUG: play fired"));
    player.addEventListener("pause", () => console.log("DEBUG: pause fired"));
    player.addEventListener("ended", () => console.log("DEBUG: ended fired"));
}

// -------------------------
// Background animation
// -------------------------
function createParticles() {
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const particle = document.createElement("div");
            particle.className = "particle";
            particle.style.left = Math.random() * 100 + "%";
            particle.style.animationDelay = Math.random() * 8 + "s";
            particle.style.animationDuration = (Math.random() * 5 + 8) + "s";
            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), 13000);
        }, i * 200);
    }
}

function createShapes() {
    const shapes = ["shape-circle", "shape-square", "shape-triangle"];
    for (let i = 0; i < 6; i++) {
        const shape = document.createElement("div");
        shape.className = "shape " + shapes[Math.floor(Math.random() * shapes.length)];
        shape.style.top = Math.random() * 100 + "%";
        shape.style.left = Math.random() * 100 + "%";
        shape.style.animationDelay = Math.random() * 5 + "s";
        document.body.appendChild(shape);
    }
}

function createSparkles() {
    for (let i = 0; i < 20; i++) {
        const sparkle = document.createElement("div");
        sparkle.className = "sparkle";
        sparkle.style.top = Math.random() * 100 + "%";
        sparkle.style.left = Math.random() * 100 + "%";
        sparkle.style.animationDelay = Math.random() * 2 + "s";
        document.body.appendChild(sparkle);
    }
}

createParticles();
createShapes();
createSparkles();
setInterval(createParticles, 10000);
