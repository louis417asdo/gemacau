# Gemacau 🇲🇴

> **Gémeo Digital de Macau** — 澳門高密度城區數字孿生規劃輔助系統

Gemacau 是一個基於開源技術構建的澳門城市級數字孿生平台，用於都市更新、城市規劃的可視化分析與決策輔助。

## ✨ 核心功能

- **3D 城市底圖**：基於 CesiumJS + OpenStreetMap 建築物數據，瀏覽器中渲染澳門全城 3D 模型
- **建築密度熱力圖**：200m 網格可視化澳門全市建築密度分佈
- **容積率估算**：基於 OSM 建築 footprint 的網格法容積率計算
- **人口密度**：DSEC 2021 普查人口 × OSM 堂區邊界
- **日照分析**：Cesium ShadowMap 模擬冬至/夏至不同時段的建築陰影投射
- **場景切換**：現狀 vs 重建方案 A vs 重建方案 B，直觀對比
- **螢幕截圖**：一鍵下載當前視角 PNG

## 🛠 技術棧

| 組件 | 技術 |
|------|------|
| 3D 引擎 | CesiumJS (WebGL) |
| 建築數據 | Cesium OSM Buildings (3D Tiles) + OSM GeoJSON (11,971 棟) |
| 地形 | Cesium World Terrain |
| 構建工具 | Vite |
| 前端 | Vanilla JS + CesiumJS |
| 空間分析後端 | Cloudflare Pages Functions（M4+）+ 可選 Python FastAPI sidecar（M7+ 學術合作） |
| 部署 | Cloudflare Pages |

## 🚀 快速開始

```bash
# 1. 克隆項目
git clone https://github.com/gemacau/gemacau.git
cd gemacau

# 2. 安裝依賴
npm install

# 3. 設定環境變數
cp .env.example .env
# 在 .env 中填入你的 Cesium Ion Access Token（格式：VITE_CESIUM_ION_TOKEN=eyJ...）
# 到 https://cesium.com/ion 註冊免費取得
# 注意：token 走 Vite env，不是 process.env；缺失時會降級並 console.warn

# 4. 啟動開發伺服器
npm run dev

# 5. 打開瀏覽器
# http://localhost:5173
```

## 📁 項目結構

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
├── .env                       # 已 gitignore，填入 VITE_CESIUM_ION_TOKEN
├── .gitignore
├── package.json
├── vite.config.js             # Cesium 靜態資源處理 + data 拷貝
└── README.md
```

## 📍 首個應用場景：益隆新村重建

益隆新村（Iao Hon Estate）七棟樓群重建計劃歷時 20 年，涉及約 2,556 個住宅和商業單位，人口密度達每平方公里 14 萬人。Gemacau 通過 3D 可視化幫助：

- 直觀展示重建前後建築對比
- 模擬不同容積率方案的人口影響
- 分析重建對周邊日照的影響
- 降低業主與政府之間的溝通門檻

## 🗺 數據來源

| 數據 | 來源 | 授權 | 精度 |
|------|------|------|------|
| 建築物輪廓 | OpenStreetMap (Geofabrik) | ODbL | 11,971 棟 |
| 建築高度 | OSM + 按類型假設 | ODbL | 6,901 棟真實，餘為估算 |
| 全球地形 | Cesium World Terrain | Cesium Ion | 全球 |
| 衛星影像 | Bing Maps | Cesium Ion | 全球 |
| 分區人口 | DSEC 2021 普查 | 公開 | 23 統計分區 |
| 堂區邊界 | OpenStreetMap | ODbL | 7 堂區 |

## 📄 授權

MIT License

## 🔗 連結

- 網站：[gemacau.com](https://gemacau.com)
- GitHub：[github.com/gemacau](https://github.com/gemacau)
- CesiumJS：[cesium.com/learn](https://cesium.com/learn)

## 🏛 合作夥伴

- 澳門大學智慧城市物聯網全國重點實驗室（SKL-IoTSC）— 學術合作
- [你的公司名稱] — 技術開發

---

*Gemacau — 孿生澳門，看見城市的未來。*
