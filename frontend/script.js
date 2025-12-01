const video = document.getElementById("cam");
const emotionText = document.getElementById("emotion");
const player = document.getElementById("player");

let currentEmotion = null;

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
    .then(stream => video.srcObject = stream);

// Send webcam frame to backend
function sendFrame() {
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
            const emotion = data.emotion;
            emotionText.innerText = "Emotion: " + emotion;

            if (emotion !== currentEmotion && songs[emotion]) {
                currentEmotion = emotion;
                player.src = songs[emotion][0];
                player.play();
            }
        });
    }, "image/jpeg");
}

// Capture frame every 1.5 sec
setInterval(sendFrame, 1500);
