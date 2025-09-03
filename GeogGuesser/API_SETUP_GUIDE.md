# Google Maps API 設定指南

## 步驟 1: 前往 Google Cloud Console
1. 打開 https://console.cloud.google.com/
2. 登入你的 Google 帳戶
3. 選擇或創建一個專案

## 步驟 2: 啟用必要的 API
你需要啟用以下 API：
- **Maps JavaScript API** ✅ (必須)
- **Street View Static API** ✅ (必須)
- **Places API** (可選，但推薦)

### 如何啟用：
1. 在左側選單選擇「API 和服務」→「程式庫」
2. 搜尋 "Maps JavaScript API" 並點擊
3. 點擊「啟用」按鈕
4. 重複步驟 2-3 來啟用 "Street View Static API"

## 步驟 3: 創建 API 金鑰
1. 在左側選單選擇「API 和服務」→「憑證」
2. 點擊「+ 建立憑證」→「API 金鑰」
3. 複製生成的 API 金鑰

## 步驟 4: 設定 API 金鑰限制（重要！）
1. 點擊剛創建的 API 金鑰
2. 在「應用程式限制」中選擇「HTTP 引薦者 (網站)」
3. 新增以下網站限制：
   - `localhost:8000/*`
   - `127.0.0.1:8000/*`
   - `http://localhost:8000/*`
   - `http://127.0.0.1:8000/*`

## 步驟 5: 檢查配額
1. 在左側選單選擇「API 和服務」→「配額」
2. 確認 Maps JavaScript API 的每日限制未超過

## 常見問題解決

### 問題 1: "RefererNotAllowedMapError"
**解決方案：** 在 API 金鑰設定中加入你的網域名稱限制

### 問題 2: "This page can't load Google Maps correctly"
**解決方案：** 檢查 API 金鑰是否正確，以及是否已啟用必要的 API

### 問題 3: 配額超限
**解決方案：** 等待配額重置或升級到付費方案

## 你當前的 API 金鑰
```
AIzaSyCkb3gNyldoHpt7IwyduZtXQ2Br1K0ooc0
```

## 快速測試
重新整理你的遊戲頁面 http://localhost:8000，如果仍有問題：
1. 按 F12 打開開發者工具
2. 查看 Console 標籤中的錯誤訊息
3. 根據錯誤訊息對照上述解決方案
