# 項目：Gemacau — 澳門數字孿生城市規劃輔助系統

## 項目概述
構建一個基於 CesiumJS 的澳門 3D 城市數字孿生原型，用於城市規劃可視化分析。
首個應用場景：益隆新村（Iao Hon Estate）都市更新重建方案的 3D 可視化與容積率模擬。
品牌域名：gemacau.com（已購）

## 技術棧（已鎖定）
- 構建工具：**Vite**（不用純 CDN，token 走 Vite env）
- 前端 UI：**Vanilla JS**（demo 階段保持 Vanilla；M3 後視 state 痛點決定是否上 Svelte 5）
- 3D 引擎：CesiumJS（WebGL）
- 3D 建築數據：Cesium OSM Buildings（全球 OpenStreetMap 建築物 3D Tiles）+ OSM GeoJSON（11,971 棟）
- 地形：Cesium World Terrain
- 地圖底圖：Cesium Ion 衛星影像 + Bing Maps
- 後端：demo 階段**無後端**（純靜態）；M4+ 用 Cloudflare Pages Functions；M7+ 可選 Python FastAPI sidecar（澳大團隊共寫分析算法時）
- 部署：Cloudflare Pages（靜態前端）

## 核心座標
- 澳門中心：113.5439°E, 22.1987°N
- 益隆新村區域：約 113.5503°E, 22.2087°N
- 澳門面積：約 33 km²

## 項目結構（當前狀態）
```
gemacau/
├── index.html                 # CesiumJS 入口頁面
├── src/
│   ├── main.js                # 主邏輯：初始化 Viewer、載入建築物、分析圖層
│   ├── config/
│   │   └── macau-regions.js   # 澳門各區座標和邊界數據
│   ├── analysis/
│   │   ├── building-density.js # 建築密度熱力圖
│   │   ├── far-grid.js        # 容積率估算（網格法）
│   │   ├── population-density.js # 人口密度（堂區級）
│   │   ├── sunlight.js        # 日照分析（ShadowMap + 時間軸）
│   │   ├── scenario.js        # 場景切換（現狀 vs 重建方案）
│   │   └── color-scale.js     # 多色漸變映射
│   └── styles/
│       └── main.css           # UI 樣式（深色模式）
├── data/
│   ├── macau-buildings.geojson    # OSM 澳門建築 footprint（11,971 棟）
│   ├── macau-grid.geojson         # 200m 網格 FAR 計算結果
│   ├── macau-freguesias.geojson   # OSM 7 堂區行政邊界
│   └── macau-population.json      # DSEC 2021 普查人口
├── scripts/
│   ├── fetch-freguesias.js    # 拉取 OSM 堂區邊界
│   ├── extract-buildings.py   # 從 .osm.pbf 提取建築 footprint
│   └── compute-grid.py        # 計算 200m 網格 FAR
├── .env.example
├── .env                       # 已 gitignore
├── .gitignore
├── package.json
├── vite.config.js             # Cesium 靜態資源處理 + data 拷貝
└── README.md
```

## 開發里程碑（已完成）

### Phase 1：基礎 3D 城市底圖 ✅
- [x] Vite 專案初始化，cesium + vite-plugin-cesium 安裝
- [x] vite.config.js 處理 Cesium 靜態資源
- [x] main.js 讀取 VITE_CESIUM_ION_TOKEN
- [x] 全球地形（Cesium World Terrain）+ Bing Maps 底圖
- [x] Cesium OSM Buildings 全球建築物圖層
- [x] 相機飛到澳門（113.5439, 22.1987），高度 2000m，俯角 -45°
- [x] 左側工具列（Gemacau 品牌 + 圖層/分析/日照/場景按鈕）
- [x] token 缺失降級（console.warn，不 throw）
- [x] 點擊建築物顯示 OSM 屬性

### Phase 2：三圖層分析 ✅
- [x] OSM 澳門建築 footprint 提取（11,971 棟，scripts/extract-buildings.py）
- [x] 200m 網格 FAR 計算（scripts/compute-grid.py）
- [x] 建築密度熱力圖（src/analysis/building-density.js）
- [x] 容積率估算（src/analysis/far-grid.js）
- [x] 人口密度（src/analysis/population-density.js，7 堂區）
- [x] 多色漸變映射（src/analysis/color-scale.js，對數映射 6 階色）
- [x] 分析子選單切換

### Phase 3：日照 + 場景 + 截圖 ✅
- [x] 日照分析：Cesium ShadowMap + 夏至/冬至/春分預設 + 時間滑桿
- [x] 場景切換：現狀 vs 重建方案 A（青綠）vs 重建方案 B（橙）
- [x] 螢幕截圖：一鍵下載 PNG

### Phase 4：UI 優化與展示（待做）
- [ ] 23 統計分區邊界手繪（替換 7 堂區）
- [ ] 益隆七棟樓群手建 GeoJSON（替換模擬數據）
- [ ] 中葡英三語 UI
- [ ] 手機版適配
- [ ] 數據精度提升（樓層真實值替換假設值）

## 設計風格
- 主色：深藍灰（#1a2332）
- 強調色：青綠（#00d4aa）— Gemacau 品牌色
- 深色模式優先

## 數據精度誠實聲明（重要）
- OSM 對澳門建築的樓層/高度屬性覆蓋稀疏（僅 5.2% 有 levels），其餘按建築類型假設
- 容積率計算使用**網格法**（200m × 200m），非官方地段邊界
- 人口密度為**堂區級**（7 區），非 23 統計分區級
- 日照分析為 Cesium ShadowMap **視覺化模擬**，非工程級陰影時長計算
- 正式版需與 DSCC 地圖繪製暨地籍局簽署地籍數據使用協議

## 開發命令
```bash
npm run dev      # 啟動開發伺服器（:5173）
npm run build    # production build
npm run preview  # 預覽 build 結果
```

## 數據更新
```bash
# 重新提取 OSM 建築（需先下載 macau-latest.osm.pbf 到 /tmp/）
python3 scripts/extract-buildings.py

# 重新計算 FAR 網格
python3 scripts/compute-grid.py

# 重新拉取堂區邊界
node scripts/fetch-freguesias.js
```
