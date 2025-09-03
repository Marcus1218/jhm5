// 離線版世界猜猜樂遊戲邏輯

// 遊戲配置
const GAME_CONFIG = {
    totalRounds: 5,
    maxPoints: 5000,
    maxDistance: 20000
};

// 遊戲狀態
let gameState = {
    currentRound: 1,
    totalScore: 0,
    roundScores: [],
    currentLocation: null,
    guessLocation: null,
    isRoundComplete: false
};

// 離線版街景位置（包含詳細線索）
const OFFLINE_LOCATIONS = [
    {
        lat: 35.6762, lng: 139.6503, name: "東京",
        clues: ["🗼 看到高聳的紅色鐵塔", "🍣 到處都是壽司店", "🚅 新幹線列車呼嘯而過", "🏮 傳統燈籠裝飾街道"],
        hint: "這是亞洲最繁忙的大都市之一，以動漫文化聞名"
    },
    {
        lat: 48.8566, lng: 2.3522, name: "巴黎",
        clues: ["🗼 鐵製格子狀高塔矗立天際", "🥐 麵包店飄出誘人香味", "🎨 到處都是藝術畫廊", "🍷 人們在咖啡廳享用紅酒"],
        hint: "浪漫之都，以鐵塔和藝術聞名"
    },
    {
        lat: 51.5074, lng: -0.1278, name: "倫敦",
        clues: ["🕐 巨大的鐘樓響起鐘聲", "☔ 經常下雨的天氣", "🚌 紅色雙層巴士穿梭街頭", "🍺 古老的酒吧隨處可見"],
        hint: "霧都，以大笨鐘和紅色電話亭著稱"
    },
    {
        lat: 40.7589, lng: -73.9851, name: "紐約",
        clues: ["🏢 摩天大樓高聳入雲", "🚕 黃色計程車滿街跑", "🎭 百老匯音樂劇廣告牌", "🍕 街角有很多披薩店"],
        hint: "不夜城，世界金融中心"
    },
    {
        lat: -33.8688, lng: 151.2093, name: "雪梨",
        clues: ["🏛️ 白色帆船造型建築物", "🏄 海灘上有很多衝浪者", "🐨 動物園裡有無尾熊", "☀️ 陽光明媚的海港城市"],
        hint: "南半球的海港城市，以歌劇院聞名"
    },
    {
        lat: -22.9068, lng: -43.1729, name: "里約熱內盧",
        clues: ["⛰️ 山頂上有巨大的雕像", "🏖️ 美麗的海灘和比基尼", "⚽ 到處都是足球迷", "🎉 嘉年華會的音樂響起"],
        hint: "南美洲的海濱城市，以基督像和嘉年華著稱"
    },
    {
        lat: 55.7558, lng: 37.6176, name: "莫斯科",
        clues: ["🏰 紅色城堡和洋蔥頭建築", "❄️ 寒冷的冬季雪花飛舞", "🪆 俄羅斯套娃商店", "🍺 伏特加酒吧林立"],
        hint: "俄羅斯首都，以紅場和克里姆林宮聞名"
    },
    {
        lat: 28.6139, lng: 77.2090, name: "新德里",
        clues: ["🕌 金色圓頂的清真寺", "🐘 街上偶爾看見大象", "🍛 香料市場香氣四溢", "🚗 繁忙的交通和嘟嘟車"],
        hint: "南亞次大陸的首都，以泰姬瑪哈陵附近"
    },
    {
        lat: 30.0444, lng: 31.2357, name: "開羅",
        clues: ["🔺 沙漠中的金字塔", "🐪 駱駝商隊經過", "🏺 古老的法老王雕像", "🌴 尼羅河畔的棕櫚樹"],
        hint: "非洲古老文明的中心，金字塔所在地"
    },
    {
        lat: 1.3521, lng: 103.8198, name: "新加坡",
        clues: ["🌺 美麗的植物園", "🍜 多元文化的小販中心", "🏙️ 現代化的摩天大樓", "🚢 繁忙的國際港口"],
        hint: "東南亞的花園城市國家"
    }
];

// 初始化遊戲
function initOfflineGame() {
    console.log('初始化離線版遊戲...');

    // 隱藏載入畫面
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('game-container').style.display = 'block';

        // 綁定事件監聽器
        bindEventListeners();

        // 開始第一輪
        startNewRound();
    }, 1000);
}

// 綁定事件監聽器
function bindEventListeners() {
    document.getElementById('guess-button').addEventListener('click', makeGuess);
    document.getElementById('next-round').addEventListener('click', nextRound);
    document.getElementById('new-game').addEventListener('click', startNewGame);
    document.getElementById('play-again').addEventListener('click', startNewGame);

    // 地圖點擊事件
    document.getElementById('map').addEventListener('click', handleMapClick);
}

// 處理地圖點擊
function handleMapClick(event) {
    if (gameState.isRoundComplete) return;

    const mapElement = document.getElementById('map');
    const rect = mapElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    // 將像素位置轉換為經緯度（簡化版）
    const lng = (x - 50) * 3.6; // -180 to 180
    const lat = (50 - y) * 1.8; // -90 to 90

    gameState.guessLocation = { lat, lng, x, y };

    // 移除之前的標記
    const existingMarker = document.querySelector('.guess-marker');
    if (existingMarker) {
        existingMarker.remove();
    }

    // 添加新標記
    const marker = document.createElement('div');
    marker.className = 'guess-marker';
    marker.style.left = x + '%';
    marker.style.top = y + '%';
    marker.title = '你的猜測';
    mapElement.appendChild(marker);

    updateGuessButton();
}

// 開始新輪次
function startNewRound() {
    console.log(`開始第 ${gameState.currentRound} 輪`);

    // 重設狀態
    gameState.isRoundComplete = false;
    gameState.guessLocation = null;

    // 清除地圖標記和連線
    const mapElement = document.getElementById('map');
    mapElement.querySelectorAll('.guess-marker, .actual-marker, .connecting-line').forEach(el => el.remove());

    // 隱藏結果和下一輪按鈕
    document.getElementById('round-result').style.display = 'none';
    document.getElementById('next-round').style.display = 'none';

    updateGuessButton();
    selectRandomLocation();
    updateRoundInfo();
}

// 選擇隨機位置
function selectRandomLocation() {
    const randomIndex = Math.floor(Math.random() * OFFLINE_LOCATIONS.length);
    gameState.currentLocation = OFFLINE_LOCATIONS[randomIndex];

    console.log('當前位置:', gameState.currentLocation);

    // 顯示線索
    showLocationClues();
}

// 顯示位置線索
function showLocationClues() {
    const hintElement = document.getElementById('location-hint');
    const location = gameState.currentLocation;

    let cluesHtml = `
        <h3>🌍 第 ${gameState.currentRound} 輪</h3>
        <p style="margin: 10px 0; font-style: italic;">${location.hint}</p>
        <div style="text-align: left; margin: 15px 0;">
    `;

    location.clues.forEach(clue => {
        cluesHtml += `<p style="margin: 5px 0;">• ${clue}</p>`;
    });

    cluesHtml += `
        </div>
        <p style="margin-top: 15px; font-size: 0.9rem; opacity: 0.8;">
            👆 點擊右側地圖進行猜測
        </p>
    `;

    hintElement.innerHTML = cluesHtml;
}

// 更新猜測按鈕狀態
function updateGuessButton() {
    const button = document.getElementById('guess-button');
    button.disabled = !(gameState.guessLocation && !gameState.isRoundComplete);
}

// 進行猜測
function makeGuess() {
    if (!gameState.guessLocation || gameState.isRoundComplete) return;

    gameState.isRoundComplete = true;

    // 顯示實際位置標記
    const mapElement = document.getElementById('map');
    const actualX = ((gameState.currentLocation.lng + 180) / 360) * 100;
    const actualY = ((90 - gameState.currentLocation.lat) / 180) * 100;

    const actualMarker = document.createElement('div');
    actualMarker.className = 'actual-marker';
    actualMarker.style.left = actualX + '%';
    actualMarker.style.top = actualY + '%';
    actualMarker.title = `實際位置: ${gameState.currentLocation.name}`;
    mapElement.appendChild(actualMarker);

    // 繪製連線
    drawConnectionLine(gameState.guessLocation.x, gameState.guessLocation.y, actualX, actualY);

    // 計算距離和得分
    const distance = calculateDistance(gameState.guessLocation, gameState.currentLocation);
    const points = calculatePoints(distance);

    // 記錄分數
    const roundResult = {
        round: gameState.currentRound,
        distance: Math.round(distance),
        points: points,
        location: gameState.currentLocation.name
    };

    gameState.roundScores.push(roundResult);
    gameState.totalScore += points;

    // 顯示結果
    showRoundResult(roundResult);
    updateGuessButton();
    updateScoreInfo();

    // 顯示下一輪按鈕或結束遊戲
    if (gameState.currentRound < GAME_CONFIG.totalRounds) {
        document.getElementById('next-round').style.display = 'block';
    } else {
        setTimeout(() => endGame(), 3000);
    }
}

// 繪製連接線
function drawConnectionLine(x1, y1, x2, y2) {
    const mapElement = document.getElementById('map');

    const deltaX = x2 - x1;
    const deltaY = y2 - y1;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;

    const line = document.createElement('div');
    line.className = 'connecting-line';
    line.style.left = x1 + '%';
    line.style.top = y1 + '%';
    line.style.width = distance + '%';
    line.style.transform = `rotate(${angle}deg)`;

    mapElement.appendChild(line);
}

// 計算距離（簡化版球面距離）
function calculateDistance(pos1, pos2) {
    const R = 6371; // 地球半徑
    const dLat = (pos2.lat - pos1.lat) * Math.PI / 180;
    const dLng = (pos2.lng - pos1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// 根據距離計算得分
function calculatePoints(distance) {
    if (distance > GAME_CONFIG.maxDistance) return 0;
    const ratio = 1 - (distance / GAME_CONFIG.maxDistance);
    return Math.round(ratio * GAME_CONFIG.maxPoints);
}

// 顯示輪次結果
function showRoundResult(result) {
    document.getElementById('result-round').textContent = result.round;
    document.getElementById('result-distance').textContent = result.distance.toLocaleString();
    document.getElementById('result-points').textContent = result.points;
    document.getElementById('round-result').style.display = 'block';
}

// 下一輪
function nextRound() {
    gameState.currentRound++;
    startNewRound();
}

// 結束遊戲
function endGame() {
    document.getElementById('final-score').textContent = gameState.totalScore;

    const breakdown = document.getElementById('score-breakdown');
    breakdown.innerHTML = '<h3>各輪得分詳情：</h3>';

    gameState.roundScores.forEach(round => {
        const div = document.createElement('div');
        div.className = 'round-summary';
        div.innerHTML = `
            <span>第 ${round.round} 輪 - ${round.location}</span>
            <span>${round.distance.toLocaleString()} km - ${round.points} 分</span>
        `;
        breakdown.appendChild(div);
    });

    document.getElementById('game-end').style.display = 'flex';
}

// 開始新遊戲
function startNewGame() {
    gameState = {
        currentRound: 1,
        totalScore: 0,
        roundScores: [],
        currentLocation: null,
        guessLocation: null,
        isRoundComplete: false
    };

    document.getElementById('game-end').style.display = 'none';
    startNewRound();
}

// 更新輪次信息
function updateRoundInfo() {
    document.getElementById('current-round').textContent = gameState.currentRound;
}

// 更新分數信息
function updateScoreInfo() {
    document.getElementById('total-score').textContent = gameState.totalScore;
}

// 啟動遊戲
document.addEventListener('DOMContentLoaded', initOfflineGame);
