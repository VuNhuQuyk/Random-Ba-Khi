const imageInput = document.getElementById("imageInput");
const imageCount = document.getElementById("imageCount");
const imageList = document.getElementById("imageList");
const stage = document.getElementById("stage");
const placeholder = document.getElementById("placeholder");
const preview = document.getElementById("preview");
const winnerBanner = document.getElementById("winnerBanner");
const statusText = document.getElementById("status");
const timer = document.getElementById("timer");
const startButton = document.getElementById("startButton");
const resetButton = document.getElementById("resetButton");

const allowedExtension = /\.(jfif|jpe?g|jeg|png)$/i;
let images = [];
let objectUrls = [];
let isRunning = false;
let animationFrame = null;
let startTime = 0;
let selectedWinner = -1;
let lastPreviewIndex = -1;

function clearObjectUrls() {
  objectUrls.forEach((url) => URL.revokeObjectURL(url));
  objectUrls = [];
}

function showImage(index) {
  if (!images[index]) return;
  preview.src = objectUrls[index];
  preview.classList.remove("hidden");
  placeholder.classList.add("hidden");
}

function renderImageList() {
  imageCount.textContent = `${images.length} ảnh`;
  imageList.replaceChildren();

  images.forEach((file, index) => {
    const tile = document.createElement("div");
    tile.className = "image-tile";

    const img = document.createElement("img");
    img.src = objectUrls[index];
    img.alt = file.name;

    const name = document.createElement("span");
    name.textContent = file.name;
    name.title = file.name;

    tile.append(img, name);
    imageList.append(tile);
  });

  startButton.disabled = images.length === 0 || isRunning;
}

imageInput.addEventListener("change", (event) => {
  if (isRunning) return;

  const selectedFiles = Array.from(event.target.files || []).filter((file) => {
    return allowedExtension.test(file.name) &&
      (file.type === "" || file.type.startsWith("image/"));
  });

  if (selectedFiles.length === 0) {
    statusText.textContent = "Không tìm thấy ảnh hợp lệ. Hãy thử JPG, PNG hoặc JFIF.";
    event.target.value = "";
    return;
  }

  clearObjectUrls();
  images = selectedFiles;
  objectUrls = images.map((file) => URL.createObjectURL(file));

  selectedWinner = -1;
  preview.classList.add("hidden");
  placeholder.classList.remove("hidden");
  winnerBanner.classList.add("hidden");
  stage.classList.remove("glowing", "shaking");
  timer.textContent = "05.00";
  statusText.textContent = "Đã sẵn sàng! Nhấn bắt đầu nào.";

  renderImageList();
  event.target.value = "";
});

function finishDraw() {
  isRunning = false;
  cancelAnimationFrame(animationFrame);

  showImage(selectedWinner);
  stage.classList.remove("shaking");
  stage.classList.add("glowing");
  winnerBanner.classList.remove("hidden");

  timer.textContent = "00.00";
  statusText.textContent = "🎉 KẾT QUẢ CUỐI CÙNG ĐÃ ĐƯỢC ĐỊNH ĐOẠT!";
  startButton.disabled = false;
  startButton.textContent = "QUAY LẠI LẦN NỮA";
}

function animateDraw(now) {
  const elapsed = now - startTime;
  const remaining = Math.max(0, 5000 - elapsed);

  timer.textContent = (remaining / 1000).toFixed(2);

  if (remaining <= 0) {
    finishDraw();
    return;
  }

  // Ảnh chuyển nhanh lúc đầu và chậm dần về cuối.
  const progress = elapsed / 5000;
  const interval = 45 + progress * 300;
  const previewIndex = Math.floor(elapsed / interval) % images.length;

  if (previewIndex !== lastPreviewIndex) {
    lastPreviewIndex = previewIndex;
    showImage(previewIndex);
  }

  if (progress < 0.4) {
    statusText.textContent = "⚡ ĐANG QUÉT CÁC ỨNG VIÊN...";
  } else if (progress < 0.8) {
    statusText.textContent = "🔥 VẬN MỆNH ĐANG ĐƯỢC QUYẾT ĐỊNH...";
  } else {
    statusText.textContent = "👑 CHUẨN BỊ CÔNG BỐ NHÀ VÔ ĐỊCH!";
  }

  animationFrame = requestAnimationFrame(animateDraw);
}

startButton.addEventListener("click", () => {
  if (isRunning || images.length === 0) return;

  isRunning = true;
  selectedWinner = Math.floor(Math.random() * images.length);
  lastPreviewIndex = -1;

  startButton.disabled = true;
  startButton.textContent = "ĐANG QUAY...";
  winnerBanner.classList.add("hidden");
  stage.classList.remove("glowing");
  stage.classList.add("shaking");

  startTime = performance.now();
  animationFrame = requestAnimationFrame(animateDraw);
});

resetButton.addEventListener("click", () => {
  if (isRunning) {
    isRunning = false;
    cancelAnimationFrame(animationFrame);
  }

  selectedWinner = -1;
  stage.classList.remove("glowing", "shaking");
  winnerBanner.classList.add("hidden");
  preview.classList.add("hidden");
  placeholder.classList.remove("hidden");

  timer.textContent = "05.00";
  statusText.textContent = "Sẵn sàng khai chiến!";
  startButton.textContent = "BẮT ĐẦU";
  renderImageList();
});
