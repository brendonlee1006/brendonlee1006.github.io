# 神諭之間

以暖白、柔紫與金色呈現的神諭卡網站，搭配 24 張「晴光花園」明亮彩繪牌面。提供單牌與三牌解讀、可追溯的文獻知識庫，以及保存在使用者瀏覽器的私人手札。

[開啟網站](https://brendonlee1006.github.io/oracle-room.html) · [三牌關係資料庫](https://brendonlee1006.github.io/oracle-relations.html)

## 三套牌面展示

- [晴光花園](https://brendonlee1006.github.io/oracle-art-gallery.html)：24 張明亮自然彩繪牌面，主網站目前使用的版本。
- [墨紫月夜](https://brendonlee1006.github.io/oracle-art-moonlight.html)：24 張月光彩繪，完整保留於展示區。
- [初版典藏](https://brendonlee1006.github.io/oracle-art-archive.html)：24 張原始月光線畫，完整保留於展示區。

新版彩繪圖像由 AI 生圖製作，牌名與細框由網站疊加。三版保留相同的牌卡 ID 與原創牌義；底色是視覺設計，沒有設定為占卜判讀規則。牌面、圖像分區、版本與檔案 SHA-256 可由 [牌面資料清單](https://brendonlee1006.github.io/oracle-art-manifest.json) 查閱。

## 原創解讀資料

- 24 張深度牌義：圖像依據、資源、盲點及現況／阻礙／建議作用。
- 120 組提問主題應用：方向、工作、關係、選擇、自我照顧。
- 552 組有方向的兩牌關係，呼應、張力與轉向均逐條撰寫。
- 12,144 組不重複三牌排列，逐組寫入 JSON 紀錄；由原創牌義、有向牌間關係與牌位規則整合，不宣稱每組都是獨立手寫稿、占驗或文獻。

網站結果在同一頁切換總覽、牌義、關係與行動，心得持續保留。洗牌完成後自動進入新牌背所在頁面。標準桌面與手機以固定畫面閱讀，手機可在原頁切換三張牌；極小視窗及很長的內容保留明示捲動備案。

## 公開資料與 AI

[AI 資料入口](https://brendonlee1006.github.io/llms.txt) 列出可直接讀取、無須登入的資料與來源狀態：

- [文獻資料清單](https://brendonlee1006.github.io/oracle-data-manifest.json)：134 篇知識文章及 17,393 筆來源紀錄。39 筆已核對指定頁面、55 筆已整理書目、17,299 筆待核候選；既有資料另記錄 10,000 輪完成搜尋。來源狀態不代表已讀完整書籍或預測效力獲驗證。
- [原創解讀資料清單](https://brendonlee1006.github.io/oracle-reading-manifest.json)：24 張牌義、552 組有向關係、全部 12,144 組三牌排列與各檔案 SHA-256。
- [牌面資料清單](https://brendonlee1006.github.io/oracle-art-manifest.json)：明亮、月夜、初版的版本說明與新版彩繪檔案、尺寸、分區及 SHA-256。

取用資料時，以清單內的 `url` 定位公開檔案，依 `sha256` 核對原始回應位元組，再讀取 JSON。清單中的 `path` 可能是歷史專案路徑；公開取用應使用 `url`。文獻知識、本牌組的原創解讀與牌面美術各自標示依據。

[robots.txt](https://brendonlee1006.github.io/robots.txt) 與 [sitemap.xml](https://brendonlee1006.github.io/sitemap.xml) 提供搜尋引擎公開頁面入口；列入索引檔不表示搜尋引擎已收錄。

## 私人手札

提問、心得與自選角度保留在使用者的瀏覽器，不包含於上述公開資料。原有 version 1 手札可繼續匯入；新角度是相容的選用欄位。更換網站、瀏覽器或裝置前請先匯出備份。

## 部署

根目錄 `.nojekyll` 保留原始靜態檔，`index.html` 導向 `oracle-room.html`。GitHub Pages 從 main / (root) 部署。公開驗收入口 `oracle-audit.html` 只在明示 mode、run=1 與符合發布 seal 時執行；一般訪客不執行測試。
