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
    streetView: null,
    map: null,
    guessMarker: null,
    actualMarker: null,
    connectionLine: null, // 添加連接線追蹤
    isRoundComplete: false
};

// 街景位置
const STREET_VIEW_LOCATIONS = [
    { lat: 35.6762, lng: 139.6503, name: "東京塔" },
    { lat: 22.3193, lng: 114.1694, name: "香港維多利亞港" },
    { lat: 48.8566, lng: 2.3522, name: "巴黎艾菲爾鐵塔" },
    { lat: 51.5074, lng: -0.1278, name: "倫敦大笨鐘" },
    { lat: 40.7589, lng: -73.9851, name: "紐約時代廣場" },
    { lat: 37.7749, lng: -122.4194, name: "舊金山金門大橋" },
    { lat: -33.8688, lng: 151.2093, name: "雪梨歌劇院" },
    { lat: 41.9028, lng: 12.4964, name: "羅馬競技場" },
    { lat: 55.7558, lng: 37.6176, name: "莫斯科紅場" },
    { lat: 25.7617, lng: -80.1918, name: "邁阿密海灘" }
];

// 初始化遊戲
function initGame() {
    console.log('初始化遊戲...');

    // 隱藏載入畫面
    document.getElementById('loading').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';

    // 初始化地圖
    gameState.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 2,
        center: { lat: 20, lng: 0 },
        mapTypeId: 'roadmap',
        disableDefaultUI: true,
        zoomControl: true
    });

    // 初始化街景
    gameState.streetView = new google.maps.StreetViewPanorama(
        document.getElementById('streetview'), {
            disableDefaultUI: true,
            zoomControl: true,
            panControl: true
        }
    );

    // 地圖點擊事件
    gameState.map.addListener('click', (event) => {
        if (!gameState.isRoundComplete) {
            placeGuess(event.latLng);
        }
    });

    // 綁定按鈕事件
    document.getElementById('guess-button').addEventListener('click', makeGuess);
    document.getElementById('next-round').addEventListener('click', nextRound);
    document.getElementById('new-game').addEventListener('click', startNewGame);
    document.getElementById('play-again').addEventListener('click', startNewGame);

    // 開始遊戲
    startNewRound();
}

// 開始新輪次
function startNewRound() {
    gameState.isRoundComplete = false;
    gameState.guessLocation = null;

    // 清除標記
    if (gameState.guessMarker) gameState.guessMarker.setMap(null);
    if (gameState.actualMarker) gameState.actualMarker.setMap(null);
    if (gameState.connectionLine) gameState.connectionLine.setMap(null); // 清除連接線

    // 隱藏UI元素
    document.getElementById('round-result').style.display = 'none';
    document.getElementById('next-round').style.display = 'none';

    // 選擇隨機位置
    const randomIndex = Math.floor(Math.random() * STREET_VIEW_LOCATIONS.length);
    gameState.currentLocation = STREET_VIEW_LOCATIONS[randomIndex];

    // 設定街景
    const position = new google.maps.LatLng(
        gameState.currentLocation.lat,
        gameState.currentLocation.lng
    );
    gameState.streetView.setPosition(position);

    // 更新UI
    document.getElementById('current-round').textContent = gameState.currentRound;
    document.getElementById('total-score').textContent = gameState.totalScore;
    updateGuessButton();
}

// 放置猜測標記
function placeGuess(latLng) {
    gameState.guessLocation = latLng;

    if (gameState.guessMarker) {
        gameState.guessMarker.setMap(null);
    }

    gameState.guessMarker = new google.maps.Marker({
        position: latLng,
        map: gameState.map,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#FF5722',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 3,
            scale: 10
        },
        title: '你的猜測'
    });

    updateGuessButton();
}

// 更新猜測按鈕
function updateGuessButton() {
    const button = document.getElementById('guess-button');
    if (gameState.guessLocation && !gameState.isRoundComplete) {
        button.disabled = false;
        button.textContent = '確認猜測！';
    } else {
        button.disabled = true;
        button.textContent = '在地圖上點擊來猜測位置';
    }
}

// 進行猜測
function makeGuess() {
    if (!gameState.guessLocation || gameState.isRoundComplete) return;

    gameState.isRoundComplete = true;

    // 計算距離
    const actualLocation = new google.maps.LatLng(
        gameState.currentLocation.lat,
        gameState.currentLocation.lng
    );

    const distance = google.maps.geometry.spherical.computeDistanceBetween(
        gameState.guessLocation,
        actualLocation
    ) / 1000;

    // 計算分數
    const points = calculatePoints(distance);
    gameState.totalScore += points;
    gameState.roundScores.push({
        round: gameState.currentRound,
        distance: distance,
        points: points,
        location: gameState.currentLocation.name
    });

    // 顯示實際位置
    gameState.actualMarker = new google.maps.Marker({
        position: actualLocation,
        map: gameState.map,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#4CAF50',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 3,
            scale: 12
        },
        title: `實際位置: ${gameState.currentLocation.name}`
    });

    // 顯示連接線
    gameState.connectionLine = new google.maps.Polyline({
        path: [gameState.guessLocation, actualLocation],
        geodesic: true,
        strokeColor: '#FF5722',
        strokeOpacity: 1.0,
        strokeWeight: 3,
        map: gameState.map
    });

    // 調整地圖視野
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(gameState.guessLocation);
    bounds.extend(actualLocation);
    gameState.map.fitBounds(bounds);

    // 顯示結果
    document.getElementById('result-round').textContent = gameState.currentRound;
    document.getElementById('result-location').textContent = gameState.currentLocation.name;
    document.getElementById('result-distance').textContent = Math.round(distance);
    document.getElementById('result-points').textContent = points;
    document.getElementById('round-result').style.display = 'block';

    // 更新總分顯示
    document.getElementById('total-score').textContent = gameState.totalScore;

    // 檢查遊戲是否結束
    if (gameState.currentRound >= GAME_CONFIG.totalRounds) {
        setTimeout(endGame, 3000);
    } else {
        document.getElementById('next-round').style.display = 'block';
    }
}

// 計算分數
function calculatePoints(distance) {
    if (distance <= 25) return 5000;
    if (distance <= 100) return Math.round(4500 - (distance - 25) * 20);
    if (distance <= 500) return Math.round(3000 - (distance - 100) * 5);
    if (distance <= 1000) return Math.round(1500 - (distance - 500) * 2);
    if (distance <= 5000) return Math.round(500 - (distance - 1000) * 0.1);
    return 0;
}

// 下一輪
function nextRound() {
    gameState.map.setZoom(2);
    gameState.map.setCenter({ lat: 20, lng: 0 });

    if (gameState.guessMarker) gameState.guessMarker.setMap(null);
    if (gameState.actualMarker) gameState.actualMarker.setMap(null);
    if (gameState.connectionLine) gameState.connectionLine.setMap(null); // 清除連接線

    gameState.currentRound++;
    startNewRound();
}

// 新遊戲
function startNewGame() {
    gameState.currentRound = 1;
    gameState.totalScore = 0;
    gameState.roundScores = [];
    gameState.isRoundComplete = false;
    gameState.guessLocation = null;

    if (gameState.guessMarker) gameState.guessMarker.setMap(null);
    if (gameState.actualMarker) gameState.actualMarker.setMap(null);
    if (gameState.connectionLine) gameState.connectionLine.setMap(null); // 清除連接線

    document.getElementById('game-end').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';

    gameState.map.setZoom(2);
    gameState.map.setCenter({ lat: 20, lng: 0 });

    startNewRound();
}

// 結束遊戲
function endGame() {
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('game-end').style.display = 'flex';

    document.getElementById('final-score').textContent = gameState.totalScore;

    const breakdown = document.getElementById('score-breakdown');
    breakdown.innerHTML = gameState.roundScores.map(score => `
        <div class="score-item">
            <span class="round">第${score.round}輪</span>
            <span class="location">${score.location}</span>
            <span class="distance">${Math.round(score.distance)}km</span>
            <span class="points">${score.points}分</span>
        </div>
    `).join('');
}
