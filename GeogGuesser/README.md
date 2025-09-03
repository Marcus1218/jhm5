# 世界猜猜樂 (World Guesser Game)

一個使用 Google Maps API 的地理猜測遊戲，玩家需要根據街景圖片猜測地點在世界地圖上的位置。

## 功能特色

- 🌍 **全球街景**: 使用 Google Street View API 顯示世界各地的 360 度街景
- 🗺️ **互動地圖**: 點擊地圖進行位置猜測
- 🎯 **精準計分**: 根據猜測距離計算得分（最高 5000 分/輪）
- 🏆 **多輪遊戲**: 5 輪遊戲，總分 25000 分
- 📱 **響應式設計**: 支援桌面和行動裝置
- 🇹🇼 **繁體中文介面**: 完整的繁體中文遊戲體驗

## 遊戲規則

1. 觀察街景圖片，尋找線索判斷位置
2. 在右側地圖上點擊你認為的位置
3. 點擊「在此猜測！」按鈕確認
4. 系統會顯示實際位置和你的猜測距離
5. 根據距離遠近獲得分數（越近分數越高）
6. 完成 5 輪後查看總分

## 設定說明

### Google Maps API 設定

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 創建新專案或選擇現有專案
3. 啟用以下 API：
   - Maps JavaScript API
   - Street View Static API
   - Places API
4. 創建 API 金鑰
5. 在 `index.html` 中找到這行：
   ```html
   src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=geometry&callback=initGame"
   ```
6. 將 `YOUR_API_KEY` 替換為你的實際 API 金鑰

### 本地測試

由於 Google Maps API 的安全限制，你需要：
1. 使用本地伺服器（不能直接打開 HTML 文件）
2. 設定 API 金鑰的域名限制

推薦使用以下方式啟動本地伺服器：
```bash
# 使用 Python
python -m http.server 8000

# 或使用 Node.js
npx http-server

# 或使用 PHP
php -S localhost:8000
```

## 遊戲位置

遊戲包含世界各地 25+ 個著名地點：
- 亞洲：東京、香港、新加坡、曼谷、新德里、雅加達
- 歐洲：巴黎、倫敦、羅馬、莫斯科、阿姆斯特丹、聖彼得堡
- 北美：紐約、舊金山、洛杉磯、邁阿密、多倫多
- 南美：里約熱內盧、聖保羅、布宜諾斯艾利斯
- 大洋洲：雪梨、墨爾本
- 非洲：開普敦、開羅

## 技術特點

- **純 JavaScript**: 無需額外框架
- **響應式 CSS**: 支援各種螢幕尺寸
- **Google Maps Integration**: 完整的地圖和街景功能
- **距離計算**: 使用球面幾何學計算精確距離
- **評分系統**: 公平的距離評分機制

## 瀏覽器支援

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 授權

MIT License
