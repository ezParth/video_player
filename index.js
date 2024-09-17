const playPauseBtn = document.querySelector(".play-pause-btn");
const video = document.querySelector("video");
const theaterBtn = document.querySelector(".theater-btn");
const miniPlayerBtn = document.querySelector(".mini-player-btn");
const fullScreenBtn = document.querySelector(".full-screen-btn");
const videoContainer = document.querySelector(".video-container");
const muteBtn = document.querySelector(".mute-btn");
const volumeSlider = document.querySelector(".volume-slider");
const currentTimeElement = document.querySelector(".current-time");
const totalTimeElement = document.querySelector(".total-time");
const captionsBtn = document.querySelector(".captions-btn");
const speedBtn = document.querySelector(".speed-btn");
const previewImage = document.querySelector(".preview-img");
const thumbnailImg = document.querySelector(".thumbnail-img");
const timelineContainer = document.querySelector(".timeline-container")

document.addEventListener("keydown", (e) => {
  const tagName = document.activeElement.tagName.toLowerCase();
  if (tagName === "input") return; // this will return and function will not execute furthur when user is typing something
  switch (e.key.toLowerCase()) {
    case " ":
      if (tagName === "button") return;
    case "k":
      togglePlay();
      break;
    case "f":
      togglefullScreenMode();
      break;
    case "i":
      toggleminiPlayerMode();
      break;
    case "t":
      toggleTheaterMode();
      break;
    case "m":
      toggleMute();
      break;
    case "arrowleft":
    case "j":
      skip(-5);
      break;
    case "arrowright":
    case "l":
      skip(+5);
      break;
    case "c":
      toggleCaptions();
      break;
  }
});

//timeline

timelineContainer.addEventListener("mousemove", handleTimelineUpdate);
timelineContainer.addEventListener("mousedown", toggleScrubbing)

document.addEventListener("mouseup", e=> {
  if (isScrubbing) toggleScrubbing(e)
})

document.addEventListener("mousemove", e=> {
  if (isScrubbing) handleTimelineUpdate(e)
})

isScrubbing = false;
let wasPaused;
function toggleScrubbing(e) {
  const rect = timelineContainer.getBoundingClientRect()
  const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width
  isScrubbing = (e.buttons & 1) === 1
  videoContainer.classList.toggle("scrubbing", isScrubbing)
  if (isScrubbing) {
    wasPaused = video.paused
    video.pause()
  } else {
    video.currentTime = percent * video.duration
    if (!wasPaused) video.play()
  }

  handleTimelineUpdate(e)
}

function handleTimelineUpdate(e){
  const rect = timelineContainer.getBoundingClientRect();
  const percent = Math.min(Math.max(0, e.x - rect.x), rect.width)/rect.width;
  const previewImgNumber = Math.max(1, Math.floor((percent*video.duration)/10));
  const previewImgSrc = `assets/previewImages/output${previewImgNumber}.jpeg`
  previewImage.src = previewImgSrc;
  timelineContainer.style.setProperty("--preview-position", percent);
  if (isScrubbing) {
    e.preventDefault()
    thumbnailImg.src = previewImgSrc
    timelineContainer.style.setProperty("--progress-position", percent)
  }
}

//playback

speedBtn.addEventListener("click", changePlaybackspeed);

function changePlaybackspeed(){
  let newPlaybackRate = video.playbackRate + 0.25;
  if(newPlaybackRate>2) newPlaybackRate = 0.25;
  video.playbackRate = newPlaybackRate;
  speedBtn.textContent = `${newPlaybackRate}x`

  if(isScrubbing){
    e.preventDefault();
    thumbnailImg.src = previewImgSrc;
  timelineContainer.style.setProperty("--progress-position", percent);
  }
}

//captions

const captions = video.textTracks[0];
captions.mode = "hidden";

captionsBtn.addEventListener("click", toggleCaptions);

function toggleCaptions() {
  const isHidden = captions.mode === "hiddlen";
  captions.mode = isHidden ? "showing" : "hidden";
  videoContainer.classList.toggle("captions", isHidden); // check it
}

// time

video.addEventListener("loadeddata", () => {
  totalTimeElement.textContent = formatDuration(video.duration);
});

video.addEventListener("timeupdate", () => {
  currentTimeElement.textContent = formatDuration(video.currentTime);
  const percent = video.currentTime / video.duration
  timelineContainer.style.setProperty("--progress-position", percent);
});

const leadingZeroFormatter = new Intl.NumberFormat(undefined, {
  minimumIntegerDigits: 2,
});
function formatDuration(time) {
  const secounds = Math.floor(time % 60);
  const minutes = Math.floor(time / 60) % 60;
  const hours = Math.floor(time / 3600);
  if (hours === 0) {
    return `${minutes}:${leadingZeroFormatter.format(secounds)}`;
  } else {
    return `${hours}:${leadingZeroFormatter.format(
      minutes
    )}:${leadingZeroFormatter.format(secounds)}`;
  }
}

function skip(duration) {
  video.currentTime += duration;
}

//volume

muteBtn.addEventListener("click", toggleMute);
volumeSlider.addEventListener("input", (e) => {
  video.volume = e.target.value;
  video.muted = e.target.value === 0;
});

function toggleMute() {
  video.muted = !video.muted;
}

video.addEventListener("volumechange", () => {
  volumeSlider.value = video.volume;
  let volumeLevel;
  if (video.muted || video.volume === 0) {
    volumeSlider.value = 0;
    volumeLevel = "muted";
  } else if (video.volume >= 0.5) {
    volumeLevel = "high";
  } else {
    volumeLevel = "low";
  }

  videoContainer.dataset.volumeLevel = volumeLevel;
});

// #video - viewing mode - (theater, full, mini)

theaterBtn.addEventListener("click", toggleTheaterMode);
fullScreenBtn.addEventListener("click", togglefullScreenMode);
miniPlayerBtn.addEventListener("click", toggleminiPlayerMode);

function toggleTheaterMode() {
  videoContainer.classList.toggle("theater");
}

function togglefullScreenMode() {
  if (document.fullscreenElement == null) {
    videoContainer.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

function toggleminiPlayerMode() {
  if (videoContainer.classList.contains("mini-player")) {
    document.exitPictureInPicture();
  } else {
    video.requestPictureInPicture();
  }
}

document.addEventListener("fullscreenchange", () => {
  videoContainer.classList.toggle("full-screen", document.fullscreenElement);
});

video.addEventListener("enterpictureinpicture", () => {
  videoContainer.classList.add("mini-player");
});

video.addEventListener("leavepictureinpicture", () => {
  videoContainer.classList.remove("mini-player");
});

playPauseBtn.addEventListener("click", togglePlay);
video.addEventListener("click", togglePlay);

function togglePlay() {
  video.paused ? video.play() : video.pause();
}

video.addEventListener("play", () => {
  videoContainer.classList.remove("paused");
});

video.addEventListener("pause", () => {
  videoContainer.classList.add("paused");
});
