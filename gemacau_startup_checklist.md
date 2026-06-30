# Gemacau — 啟動清單

## ✅ 已完成
- [x] 確定項目方向：澳門數字孿生城市規劃系統
- [x] 確定品牌名：Gemacau（Gémeo + Macau = 孿生澳門）
- [x] 購買域名：gemacau.com ✅
- [x] git init repo（main branch）+ .gitignore + .env.example + .env
- [x] 商業計劃補充數據依賴聲明、Cesium 配額風險、工程級日照說明
- [x] 修正 opencode prompt（Vite + VITE_CESIUM_ION_TOKEN + token 降級）
- [x] **Phase 1：3D 城市底圖** — CesiumJS Viewer、地形、OSM Buildings、相機、工具列
- [x] **Phase 2：三圖層分析** — 建築密度熱力圖、容積率估算（200m 網格）、人口密度（7 堂區）
- [x] **Phase 3：日照 + 場景 + 截圖** — ShadowMap 時間軸、重建方案 A/B、一鍵截圖
- [x] 數據準備：OSM 11,971 建築 footprint、DSEC 2021 普查人口、OSM 7 堂區邊界

## 🔐 前置人類任務（你本人做，AI 完成不了）
- [x] **revoke 已洩露的 Cesium Ion token**，到 https://cesium.com/ion/tokens 重新生成
- [x] 把新 token 填入 `.env`（格式：`VITE_CESIUM_ION_TOKEN=eyJ...`）
- [ ] 在 GitHub 註冊 gemacau 組織（github.com/organizations/new）
- [ ] 建立 gemacau/gemacau repo，貼入 README.md
- [ ] 在 Cloudflare 設定 gemacau.com 的 DNS（指向 Cloudflare Pages）

## 🔄 本週要做（6/30 - 7/6）
- [ ] **commit + push 到 GitHub**（你建立 repo 後）
- [ ] 在 Cloudflare Pages 部署 demo（連 GitHub repo 即可自動部署）

## 📅 7 月 1-10 日
- [ ] 到 FDCT 產學研配對平台（grants-pri.fdct.gov.mo）註冊電子服務帳戶
- [ ] 準備文件：商業登記證明書（最近 3 個月）、法人代表身份證
- [ ] 在平台上發佈技術需求

## 📅 7 月中旬
- [ ] 發郵件聯繫澳大 SKL-IoTSC（iotsc.enquiry@um.edu.mo）
- [ ] 同時聯繫澳科大智慧城市研究院（8897 2126）

## 📅 8 月
- [ ] 與教授會面，討論合作細節
- [ ] 簽署合作協議書或意向書
- [ ] 明確分工和知識產權歸屬

## 📅 9 月
- [ ] 準備 FDCT 申請卷宗（8 項文件）
- [ ] 撰寫項目計劃書（參考 gemacau_business_plan.md）
- [ ] 收集最近 3 個月稅務/社保證明

## 📅 10 月 1-10 日
- [ ] 提交 FDCT 配對類資助申請

## 📅 10-12 月
- [ ] 等待審批
- [ ] 繼續開發（Phase 4：UI 優化、23 統計分區邊界手繪、數據精度提升）
- [ ] 完善功能

## 📅 2027 年初
- [ ] 審批結果出爐
- [ ] 如獲批：簽署資助同意書，正式啟動 12 個月項目

---

## 📦 交付物清單

已生成的文件：

1. **gemacau_business_plan.md** — 完整商業計劃及項目實施指南
   - 商業模式、FDCT 評審標準對照、預算明細、12 個月計劃、風險分析、聯絡資訊

2. **gemacau_README.md** — GitHub README
   - 項目介紹、技術棧、快速開始、項目結構、數據來源、授權

3. **gemacau_opencode_prompt.md** — opencode 啟動 prompt
   - 完整的項目定義、4 個 Phase 的里程碑、技術要點、第一條指令

4. **gemacau_startup_checklist.md** — 本文件，啟動清單

5. **AGENTS.md** — OpenCode 工作指引
   - 技術決策、Cesium 注意事項、數據誠實聲明、約定

已實現的程式碼：

- **Phase 1**：CesiumJS Viewer、地形、OSM Buildings、相機、工具列
- **Phase 2**：建築密度熱力圖、容積率估算（200m 網格）、人口密度（7 堂區）
- **Phase 3**：日照分析（ShadowMap + 時間軸）、場景切換（現狀 vs 方案 A/B）、螢幕截圖
