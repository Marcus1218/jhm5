# Google Maps API 錯誤修復指南

## 問題分析
你遇到的 `ApiNotActivatedMapError` 錯誤表示雖然你的API金鑰是有效的，但缺少某些必要的API服務啟用。

## 當前API金鑰
```
AIzaSyCkb3gNyldoHpt7IwyduZtXQ2Br1K0ooc0
```

## 必須啟用的API服務

### 1. Maps JavaScript API
- 🔗 連結: https://console.cloud.google.com/apis/library/maps-backend.googleapis.com
- ✅ 狀態: 你說已經啟用了

### 2. Street View Static API  
- 🔗 連結: https://console.cloud.google.com/apis/library/street-view-image-backend.googleapis.com
- ✅ 狀態: 你說已經啟用了

### 3. **需要額外啟用的API (重要!)**
以下API可能也需要啟用才能完全支援街景功能：

#### Maps Embed API
- 🔗 連結: https://console.cloud.google.com/apis/library/maps-embed-backend.googleapis.com
- 📝 說明: 支援嵌入式地圖

#### Places API (New)
- 🔗 連結: https://console.cloud.google.com/apis/library/places-backend.googleapis.com  
- 📝 說明: 支援地點資訊

#### Geocoding API
- 🔗 連結: https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com
- 📝 說明: 支援地址轉換

## 修復步驟

### 步驟 1: 啟用所有必要的API
1. 打開 [Google Cloud Console](https://console.cloud.google.com/)
2. 選擇你的專案
3. 前往「API和服務」→「資料庫」
4. 搜尋並啟用以下API：
   - Maps JavaScript API ✅ (已啟用)
   - Street View Static API ✅ (已啟用)
   - **Maps Embed API** ← 請啟用這個
   - **Places API (New)** ← 請啟用這個
   - **Geocoding API** ← 請啟用這個

### 步驟 2: 檢查計費設定
1. 確認專案已連接有效的計費帳戶
2. 檢查是否有足夠的信用額度
3. 確認沒有達到每日配額限制

### 步驟 3: 檢查API金鑰限制
1. 前往「API和服務」→「憑證」
2. 點擊你的API金鑰
3. 確認沒有設定IP限制或HTTP referrer限制
4. 或者設定正確的localhost限制：`http://localhost:*/*`

### 步驟 4: 等待生效
- API啟用可能需要5-10分鐘才會生效
- 建議啟用所有API後等待10分鐘再測試

## 快速測試方法
啟用API後，打開以下網址測試：
- http://localhost:8000/full-diagnosis.html
- http://localhost:8000/index.html

## 如果問題仍然存在
1. 嘗試創建一個新的API金鑰
2. 確認Google Cloud專案計費狀態
3. 檢查API使用統計是否有錯誤記錄
