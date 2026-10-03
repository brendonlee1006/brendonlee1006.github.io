# 神諭之間

神諭卡知識、24 張原創月光手札、每日一牌、單張與三張抽牌，以及留在瀏覽器的私人手札。

網站入口：https://brendonlee1006.github.io/  
直接入口：https://brendonlee1006.github.io/oracle-room.html

網址需在 GitHub Pages 啟用且部署成功後才能使用。

## 公開內容

- 134 篇知識文章。
- 17,393 筆來源：39 筆已核對指定頁面、55 筆已整理書目、17,299 筆待核搜尋候選。
- 10,000 筆不同的完成搜尋輪次。
- 來源的 `inspection`、`accessScope` 與 `traceability` 記錄實際核對範圍。待核候選未逐一驗證；核對指定頁面不代表已閱讀全書或驗證所有主張。

`oracle-data-manifest.json` 列出完整公開資料與檔案封印；`llms.txt` 提供閱讀工具與 AI 的資料入口。AI 工具可讀取 JSON 與知識資料；模型推論由讀取端提供。

## 私人手札

提問、心得與抽牌紀錄保存在使用者的瀏覽器，公開資料包含文章與來源。更換網域、瀏覽器或裝置時，需先在原網站匯出手札，再於新網站匯入。

## 部署

網站檔案放在儲存庫根目錄。`.nojekyll` 保留原始靜態檔案；`index.html` 會導向 `oracle-room.html`，保留網址的查詢參數與片段。

在 Settings → Pages，選擇 **Deploy from a branch**、**main**、**/(root)**，按 **Save**。待 Pages 部署成功後開啟網站入口。

公開資料與畫面驗證頁為 `oracle-audit.html`；只有明示模式、`run=1` 與符合本次資料封印的 `seal` 才會執行。HTTP、實際瀏覽器操作與無捲動畫面需由完整驗收報告確認。
