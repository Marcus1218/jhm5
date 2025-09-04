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
    connectionLine: null,
    isRoundComplete: false,
    usedLocations: [] // 添加已使用地點追蹤
};

// 街景位置 - 100個世界著名地點
const STREET_VIEW_LOCATIONS = [
    // 亞洲
    { lat: 35.6762, lng: 139.6503, name: "東京塔" },
    { lat: 22.3193, lng: 114.1694, name: "香港維多利亞港" },
    { lat: 31.2304, lng: 121.4737, name: "上海外灘" },
    { lat: 39.9042, lng: 116.4074, name: "北京天安門" },
    { lat: 1.3521, lng: 103.8198, name: "新加坡魚尾獅公園" },
    { lat: 13.7563, lng: 100.5018, name: "曼谷大皇宮" },
    { lat: 21.0285, lng: 105.8542, name: "河內還劍湖" },
    { lat: 14.5995, lng: 120.9842, name: "馬尼拉黎剎公園" },
    { lat: -6.2088, lng: 106.8456, name: "雅加達獨立廣場" },
    { lat: 3.1390, lng: 101.6869, name: "吉隆坡雙子塔" },
    { lat: 28.6139, lng: 77.2090, name: "新德里印度門" },
    { lat: 19.0760, lng: 72.8777, name: "孟買印度門" },
    { lat: 12.9716, lng: 77.5946, name: "班加羅爾" },
    { lat: 35.6892, lng: 51.3890, name: "德黑蘭自由紀念塔" },
    { lat: 33.6844, lng: 73.0479, name: "伊斯蘭馬巴德" },
    { lat: 24.8607, lng: 67.0011, name: "喀拉蚩" },
    { lat: 41.3775, lng: 64.5853, name: "撒馬爾罕" },
    { lat: 40.1431, lng: 47.5769, name: "巴庫" },
    { lat: 23.8103, lng: 90.4125, name: "達卡" },
    { lat: 27.7172, lng: 85.3240, name: "加德滿都" },

    // 歐洲
    { lat: 48.8566, lng: 2.3522, name: "巴黎艾菲爾鐵塔" },
    { lat: 51.5074, lng: -0.1278, name: "倫敦大笨鐘" },
    { lat: 52.5200, lng: 13.4050, name: "柏林布蘭登堡門" },
    { lat: 41.9028, lng: 12.4964, name: "羅馬競技場" },
    { lat: 40.4168, lng: -3.7038, name: "馬德里太陽門廣場" },
    { lat: 45.4642, lng: 9.1900, name: "米蘭大教堂" },
    { lat: 50.0755, lng: 14.4378, name: "布拉格城堡" },
    { lat: 47.4979, lng: 19.0402, name: "布達佩斯國會大廈" },
    { lat: 52.3676, lng: 4.9041, name: "阿姆斯特丹水壩廣場" },
    { lat: 50.8503, lng: 4.3517, name: "布魯塞爾大廣場" },
    { lat: 46.2044, lng: 6.1432, name: "日內瓦噴泉" },
    { lat: 59.9139, lng: 10.7522, name: "奧斯陸市政廳" },
    { lat: 55.6761, lng: 12.5683, name: "哥本哈根小美人魚" },
    { lat: 59.3293, lng: 18.0686, name: "斯德哥爾摩老城" },
    { lat: 60.1695, lng: 24.9354, name: "赫爾辛基大教堂" },
    { lat: 47.3769, lng: 8.5417, name: "蘇黎世班霍夫大街" },
    { lat: 38.7223, lng: -9.1393, name: "里斯本商業廣場" },
    { lat: 55.7558, lng: 37.6176, name: "莫斯科紅場" },
    { lat: 50.4501, lng: 30.5234, name: "基輔獨立廣場" },
    { lat: 53.9045, lng: 27.5615, name: "明斯克" },

    // 北美洲
    { lat: 40.7589, lng: -73.9851, name: "紐約時代廣場" },
    { lat: 37.7749, lng: -122.4194, name: "舊金山金門大橋" },
    { lat: 41.8781, lng: -87.6298, name: "芝加哥千禧公園" },
    { lat: 34.0522, lng: -118.2437, name: "洛杉磯好萊塢" },
    { lat: 25.7617, lng: -80.1918, name: "邁阿密海灘" },
    { lat: 43.6532, lng: -79.3832, name: "多倫多CN塔" },
    { lat: 45.5017, lng: -73.5673, name: "蒙特婁聖母大教堂" },
    { lat: 49.2827, lng: -123.1207, name: "溫哥華加拿大廣場" },
    { lat: 38.9072, lng: -77.0369, name: "華盛頓特區白宮" },
    { lat: 29.7604, lng: -95.3698, name: "休斯頓" },
    { lat: 33.4484, lng: -112.0740, name: "鳳凰城" },
    { lat: 39.7392, lng: -104.9903, name: "丹佛" },
    { lat: 47.6062, lng: -122.3321, name: "西雅圖太空針塔" },
    { lat: 45.5152, lng: -122.6784, name: "波特蘭" },
    { lat: 36.1627, lng: -115.1627, name: "拉斯維加斯" },

    // 南美洲
    { lat: -34.6037, lng: -58.3816, name: "布宜諾斯艾利斯方尖碑" },
    { lat: -22.9068, lng: -43.1729, name: "里約熱內盧基督像" },
    { lat: -23.5505, lng: -46.6333, name: "聖保羅大教堂" },
    { lat: -33.4489, lng: -70.6693, name: "聖地亞哥拉莫內達宮" },
    { lat: -12.0464, lng: -77.0428, name: "利馬武器廣場" },
    { lat: 4.7110, lng: -74.0721, name: "波哥大黃金博物館" },
    { lat: 10.4806, lng: -66.9036, name: "卡拉卡斯" },
    { lat: -25.2637, lng: -57.5759, name: "亞松森" },
    { lat: -34.9011, lng: -56.1645, name: "蒙得維的亞" },
    { lat: 5.8520, lng: -55.2038, name: "帕拉馬里博" },

    // 大洋洲
    { lat: -33.8688, lng: 151.2093, name: "雪梨歌劇院" },
    { lat: -37.8136, lng: 144.9631, name: "墨爾本聯邦廣場" },
    { lat: -27.4698, lng: 153.0251, name: "布里斯班" },
    { lat: -31.9505, lng: 115.8605, name: "珀斯" },
    { lat: -35.2809, lng: 149.1300, name: "坎培拉" },
    { lat: -36.8485, lng: 174.7633, name: "奧克蘭天空塔" },
    { lat: -41.2865, lng: 174.7762, name: "威靈頓" },
    { lat: -43.5321, lng: 172.6362, name: "基督城" },

    // 非洲
    { lat: -33.9249, lng: 18.4241, name: "開普敦桌山" },
    { lat: -26.2041, lng: 28.0473, name: "約翰尼斯堡" },
    { lat: 30.0444, lng: 31.2357, name: "開羅金字塔" },
    { lat: -1.2921, lng: 36.8219, name: "奈洛比" },
    { lat: 6.5244, lng: 3.3792, name: "拉哥斯" },
    { lat: -18.9165, lng: 47.5166, name: "塔那那利佛" },
    { lat: 36.8065, lng: 10.1815, name: "突尼斯" },
    { lat: 33.9716, lng: -6.8498, name: "拉巴特" },
    { lat: 14.7167, lng: -17.4677, name: "達喀爾" },
    { lat: 5.6037, lng: -0.1870, name: "阿克拉" },

    // 中東
    { lat: 25.2048, lng: 55.2708, name: "杜拜哈利法塔" },
    { lat: 24.4539, lng: 54.3773, name: "阿布達比" },
    { lat: 29.3759, lng: 47.9774, name: "科威特城" },
    { lat: 26.2285, lng: 50.5860, name: "麥納瑪" },
    { lat: 25.2854, lng: 51.5310, name: "杜哈" },
    { lat: 24.7136, lng: 46.6753, name: "利雅德" },
    { lat: 21.4858, lng: 39.1925, name: "麥加" },
    { lat: 31.7683, lng: 35.2137, name: "耶路撒冷" },
    { lat: 33.8869, lng: 35.5131, name: "貝魯特" },
    { lat: 36.2021, lng: 37.1343, name: "阿勒坡" },

    // 其他地區
    { lat: 64.1466, lng: -21.9426, name: "雷克雅維克" },
    { lat: 78.2232, lng: 15.6267, name: "朗伊爾城" },
    { lat: -54.8019, lng: -68.3030, name: "烏斯懷亞" },
    { lat: 71.0486, lng: -8.0221, name: "特羅姆瑟" },
    { lat: 69.6492, lng: 18.9553, name: "特羅姆瑟北極光" },
    { lat: 18.2208, lng: -66.5901, name: "聖胡安" },
    { lat: 32.2968, lng: -64.7824, name: "百慕達" },
    { lat: 9.7489, lng: -83.7534, name: "聖荷西" },
    { lat: 14.6349, lng: -90.5069, name: "瓜地馬拉城" },
    { lat: 17.2500, lng: -88.7675, name: "貝里斯市" },
    { lat: 12.1165, lng: -86.2362, name: "馬納瓜" },
    { lat: 9.9281, lng: -84.0907, name: "聖荷西" },
    { lat: 8.9824, lng: -79.5199, name: "巴拿馬城" },
    { lat: 23.1136, lng: -82.3666, name: "哈瓦那" },
    { lat: 18.4861, lng: -69.9312, name: "聖多明哥" },
    { lat: 18.2208, lng: -67.1408, name: "聖胡安" }
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
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * STREET_VIEW_LOCATIONS.length);
    } while (gameState.usedLocations.includes(randomIndex)); // 確保不重複使用地點

    gameState.currentLocation = STREET_VIEW_LOCATIONS[randomIndex];
    gameState.usedLocations.push(randomIndex); // 將地點標記為已使用

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
    gameState.usedLocations = []; // 重置已使用地點

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
