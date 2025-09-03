// 遊戲配置
const GAME_CONFIG = {
    totalRounds: 5,
    maxPoints: 5000,
    maxDistance: 20000 // 20000km for maximum distance
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
    isRoundComplete: false
};

// 預設的街景位置（世界各地有趣的地點）
const STREET_VIEW_LOCATIONS = [
    // 亞洲
    { lat: 35.6762, lng: 139.6503, name: "東京塔" },
    { lat: 22.3193, lng: 114.1694, name: "香港維多利亞港" },
    { lat: 1.3521, lng: 103.8198, name: "新加坡" },
    { lat: 13.7563, lng: 100.5018, name: "曼谷" },
    { lat: 28.6139, lng: 77.2090, name: "新德里" },
    { lat: -6.2088, lng: 106.8456, name: "雅加達" },

    // 歐洲
    { lat: 48.8566, lng: 2.3522, name: "巴黎艾菲爾鐵塔" },
    { lat: 51.5074, lng: -0.1278, name: "倫敦大笨鐘" },
    { lat: 41.9028, lng: 12.4964, name: "羅馬競技場" },
    { lat: 55.7558, lng: 37.6176, name: "莫斯科紅場" },
    { lat: 52.3676, lng: 4.9041, name: "阿姆斯特丹" },
    { lat: 59.9311, lng: 30.3609, name: "聖彼得堡" },

    // 北美洲
    { lat: 40.7589, lng: -73.9851, name: "紐約時代廣場" },
    { lat: 37.7749, lng: -122.4194, name: "舊金山金門大橋" },
    { lat: 34.0522, lng: -118.2437, name: "洛杉磯好萊塢" },
    { lat: 25.7617, lng: -80.1918, name: "邁阿密海灘" },
    { lat: 43.6532, lng: -79.3832, name: "多倫多" },

    // 南美洲
    { lat: -22.9068, lng: -43.1729, name: "里約熱內盧基督像" },
    { lat: -23.5505, lng: -46.6333, name: "聖保羅" },
    { lat: -34.6118, lng: -58.3960, name: "布宜諾斯艾利斯" },

    // 大洋洲
    { lat: -33.8688, lng: 151.2093, name: "雪梨歌劇院" },
    { lat: -37.8136, lng: 144.9631, name: "墨爾本" },

    // 非洲
    { lat: -33.9249, lng: 18.4241, name: "開普敦" },
    { lat: 30.0444, lng: 31.2357, name: "開羅" }
];

// 初始化遊戲
function initGame() {
    console.log('初始化遊戲...');

    // 檢查Google Maps API是否載入
    if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
        console.error('Google Maps API未載入');
        showError('Google Maps API載入失敗，請檢查網路連線或API金鑰設定。');
        return;
    }

    try {
        // 隱藏載入畫面
        document.getElementById('loading').style.display = 'none';
        document.getElementById('game-container').style.display = 'block';

        // 初始化地圖和街景
        initMap();
        initStreetView();

        // 綁定事件監聽器
        bindEventListeners();

        // 開始第一輪
        startNewRound();
    } catch (error) {
        console.error('遊戲初始化錯誤:', error);
        showError('遊戲初始化失敗: ' + error.message);
    }
}

// 顯示錯誤訊息
function showError(message) {
    const loadingScreen = document.getElementById('loading');
    const loadingContent = loadingScreen.querySelector('.loading-content');
    loadingContent.innerHTML = `
        <h1>世界猜猜樂</h1>
        <div style="color: #ff6b6b; margin-bottom: 1.5rem; text-align: left; max-width: 400px;">
            ❌ ${message}
        </div>
        <button onclick="location.reload()" style="
            background: #4CAF50;
            color: white;
            border: none;
            padding: 12px 24px;
            font-size: 1rem;
            border-radius: 25px;
            cursor: pointer;
            margin-right: 10px;
        ">重新載入</button>
        <button onclick="openApiSetup()" style="
            background: #2196F3;
            color: white;
            border: none;
            padding: 12px 24px;
            font-size: 1rem;
            border-radius: 25px;
            cursor: pointer;
        ">API設定說明</button>
    `;
    loadingScreen.style.display = 'flex';
    document.getElementById('game-container').style.display = 'none';
}

// 打開API設定說明
function openApiSetup() {
    window.open('https://console.cloud.google.com/apis/library/maps-backend.googleapis.com', '_blank');
}

// 初始化地圖
function initMap() {
    gameState.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 2,
        center: { lat: 20, lng: 0 },
        mapTypeId: 'roadmap',
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
            {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
            }
        ]
    });

    // 地圖點擊事件
    gameState.map.addListener('click', (event) => {
        if (!gameState.isRoundComplete) {
            placeGuess(event.latLng);
        }
    });
}

// 初始化街景
function initStreetView() {
    try {
        gameState.streetView = new google.maps.StreetViewPanorama(
            document.getElementById('streetview'), {
                disableDefaultUI: true,
                showRoadLabels: false,
                zoomControl: true,
                panControl: true,
                addressControl: false,
                fullscreenControl: false
            }
        );

        // 監聽街景載入錯誤
        gameState.streetView.addListener('status_changed', function() {
            const status = gameState.streetView.getStatus();
            console.log('街景狀態:', status);

            if (status === 'ZERO_RESULTS') {
                console.warn('此位置沒有街景數據');
                // 嘗試載入下一個位置
                selectRandomLocation();
            } else if (status === 'UNKNOWN_ERROR') {
                console.error('街景載入錯誤');
                showError('街景服務暫時無法使用，請稍後再試。');
            }
        });

        log('✅ StreetView 初始化成功', 'success');
    } catch (error) {
        console.error('StreetView 初始化失敗:', error);
        showError('街景初始化失敗: ' + error.message);
    }
}

// 綁定事件監聽器
function bindEventListeners() {
    document.getElementById('guess-button').addEventListener('click', makeGuess);
    document.getElementById('next-round').addEventListener('click', nextRound);
    document.getElementById('new-game').addEventListener('click', startNewGame);
    document.getElementById('play-again').addEventListener('click', startNewGame);
}

// 開始新輪次
function startNewRound() {
    console.log(`開始第 ${gameState.currentRound} 輪`);

    // 重設狀態
    gameState.isRoundComplete = false;
    gameState.guessLocation = null;

    // 清除標記
    if (gameState.guessMarker) {
        gameState.guessMarker.setMap(null);
    }
    if (gameState.actualMarker) {
        gameState.actualMarker.setMap(null);
    }

    // 隱藏結果和下一輪按鈕
    document.getElementById('round-result').style.display = 'none';
    document.getElementById('next-round').style.display = 'none';

    // 啟用猜測按鈕（如果有猜測位置）
    updateGuessButton();

    // 選擇隨機位置
    selectRandomLocation();

    // 更新UI
    updateRoundInfo();
}

// 選擇隨機位置
function selectRandomLocation() {
    const randomIndex = Math.floor(Math.random() * STREET_VIEW_LOCATIONS.length);
    gameState.currentLocation = STREET_VIEW_LOCATIONS[randomIndex];

    console.log('當前位置:', gameState.currentLocation);

    // 設定街景
    const position = new google.maps.LatLng(
        gameState.currentLocation.lat,
        gameState.currentLocation.lng
    );

    // 檢查街景是否可用
    const streetViewService = new google.maps.StreetViewService();
    streetViewService.getPanorama({
        location: position,
        radius: 50,
        source: google.maps.StreetViewSource.OUTDOOR
    }, (data, status) => {
        if (status === 'OK') {
            gameState.streetView.setPosition(position);
            log(`✅ 街景載入成功: ${gameState.currentLocation.name}`, 'success');
        } else {
            log(`⚠️ 此位置無街景，正在選擇新位置...`, 'warning');
            // 遞歸選擇新位置
            selectRandomLocation();
        }
    });
}

// 放置猜測標記
function placeGuess(latLng) {
    gameState.guessLocation = latLng;

    // 移除之前的標記
    if (gameState.guessMarker) {
        gameState.guessMarker.setMap(null);
    }

    // 放置新標記
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

// 更新猜測按鈕狀態
function updateGuessButton() {
    const guessButton = document.getElementById('guess-button');
    if (gameState.guessLocation && !gameState.isRoundComplete) {
        guessButton.disabled = false;
        guessButton.textContent = '確認猜測！';
    } else {
        guessButton.disabled = true;
        guessButton.textContent = '在地圖上點擊來猜測位置';
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
    ) / 1000; // 轉換為公里

    // 計算分數
    const points = calculatePoints(distance);
    gameState.roundScores.push({
        round: gameState.currentRound,
        distance: distance,
        points: points,
        location: gameState.currentLocation.name
    });
    gameState.totalScore += points;

    // 顯示實際位置標記
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

    // 繪製連接線
    const line = new google.maps.Polyline({
        path: [gameState.guessLocation, actualLocation],
        geodesic: true,
        strokeColor: '#FF5722',
        strokeOpacity: 1.0,
        strokeWeight: 3,
        map: gameState.map
    });

    // 調整地圖視野包含兩個點
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(gameState.guessLocation);
    bounds.extend(actualLocation);
    gameState.map.fitBounds(bounds);

    // 顯示結果
    showRoundResult(distance, points);

    // 更新UI
    updateGameUI();

    // 檢查是否遊戲結束
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

// 顯示輪次結果
function showRoundResult(distance, points) {
    const resultDiv = document.getElementById('round-result');
    document.getElementById('result-round').textContent = gameState.currentRound;
    document.getElementById('result-distance').textContent = Math.round(distance);
    document.getElementById('result-points').textContent = points;
    resultDiv.style.display = 'block';
}

// 更新遊戲UI
function updateGameUI() {
    document.getElementById('current-round').textContent = gameState.currentRound;
    document.getElementById('total-score').textContent = gameState.totalScore;
    updateGuessButton();
}

// 更新輪次信息
function updateRoundInfo() {
    document.getElementById('current-round').textContent = gameState.currentRound;
    document.getElementById('total-score').textContent = gameState.totalScore;
}

// 下一輪
function nextRound() {
    // 清除連接線和實際位置標記
    gameState.map.setZoom(2);
    gameState.map.setCenter({ lat: 20, lng: 0 });

    // 清除所有標記
    if (gameState.guessMarker) {
        gameState.guessMarker.setMap(null);
    }
    if (gameState.actualMarker) {
        gameState.actualMarker.setMap(null);
    }

    gameState.currentRound++;
    startNewRound();
}

// 開始新遊戲
function startNewGame() {
    // 重設遊戲狀態
    gameState.currentRound = 1;
    gameState.totalScore = 0;
    gameState.roundScores = [];
    gameState.isRoundComplete = false;
    gameState.guessLocation = null;

    // 清除所有標記
    if (gameState.guessMarker) {
        gameState.guessMarker.setMap(null);
    }
    if (gameState.actualMarker) {
        gameState.actualMarker.setMap(null);
    }

    // 隱藏遊戲結束畫面
    document.getElementById('game-end').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';

    // 重設地圖
    gameState.map.setZoom(2);
    gameState.map.setCenter({ lat: 20, lng: 0 });

    // 開始新輪次
    startNewRound();
}

// 結束遊戲
function endGame() {
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('game-end').style.display = 'flex';

    // 顯示最終分數
    document.getElementById('final-score').textContent = gameState.totalScore;

    // 顯示分數明細
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

// Google Maps API 載入完成後的回調函數
window.initGame = initGame;

// 添加日誌函數（如果不存在）
function log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] ${message}`);
}
