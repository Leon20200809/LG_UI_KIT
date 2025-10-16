
# ⚔️ LG Standard UI Kit
**Vanilla JS + Layered CSS Modular Starter**

LG流（LazyGenius流）UIテンプレート。  
アクセシビリティ（A11y）、データ属性駆動、そして責務分離を徹底した「怠惰のための設計思想」。

---

## 📦 ディレクトリ構成（更新版）

```
/assets/
 ├─ /css/
 │   ├─ style.css        ← 司令官（すべてのCSSを @import 管理）
 │   ├─ tokens.css       ← 定数倉庫（カラー、フォント、角丸、影）
 │   ├─ base.css         ← 初期整形（タグリセット最小）
 │   ├─ components.css   ← パーツ群（ハンバーガー/アコーディオン/タブ）
 │   ├─ utilities.css    ← 汎用クラス
 │   ├─ responsive.css   ← レスポンシブ（PC↔モバイル切替ファイルに差替可）
 │   └─ page.css         ← ページ固有の調整（最終レイヤー）
 └─ /js/
     ├─ init.js          ← 司令官：data属性を走査し各コンポーネントを初期化
     └─ /components/
         ├─ hamburger.js
         ├─ accordion.js
         └─ tabs.js
```

> 以前 `style.css` と `css/` が同階層にあった構成を、**`/assets/css/style.css` に集約**しました。  
> これにより `@import "./base.css"` のように相対パスがシンプルになります。

---

## 🧩 CSSの読み込み（HTML）

```html
<link rel="stylesheet" href="/assets/css/style.css">
```

`style.css` 内の @layer / @import により、以下の順序で読み込まれます：  
`tokens → base → components → utilities → responsive → page`

---

## ⚙️ JSの読み込み（HTML）

```html
<script type="module" defer src="/assets/js/init.js"></script>
```
`init.js` が `[data-lg-*]` を検知して自動初期化。  
デバッグは `window.LG` に公開されるインスタンス配列から行えます。

---

## 🧭 コンポーネント一覧
| コンポーネント | 役割 | 主な契約（HTML） |
|---|---|---|
| ハンバーガー | ナビ開閉（外側クリック/ESC対応） | `data-lg-hamburger` / `data-lg-nav` + `aria-controls` |
| アコーディオン | 折り畳み（単一開が既定、複数開も可） | `data-lg-accordion` / `data-lg-acc-trigger` + `aria-controls` |
| タブ | キーボード完全対応（auto/manual） | `data-lg-tabs` / `role="tablist|tab|tabpanel"` |

---

## 🔍 data属性ドリル（なぜ動くのか）
- HTMLが **「この要素を動かしたい」** と data属性で宣言
- `init.js` がその宣言を走査して該当クラスを `new` し `.init()`
- 以後は A11y属性（`aria-expanded`/`hidden` 等）を同期して動作

例：
```html
<button data-lg-hamburger aria-controls="primary-nav" aria-expanded="false">MENU</button>
<nav id="primary-nav" data-lg-nav data-state="closed"></nav>
```
```js
// init.js 内部（概念）
document.querySelectorAll('[data-lg-hamburger]')
  .forEach(el => new Hamburger(el).init());
```

---

## 🛠 開発の流れ（DevTools活用）
1. Elementsで属性の変化（`aria-expanded`/`data-state`/`hidden`）を観察  
2. Sourcesで `onClick`/`toggle`/`select` にブレークしてコールスタックを確認  
3. Consoleで `LG.components` を操作してAPIを体感

---

## 🔄 レスポンシブ切替（PC↔モバイル）
- 既定は `responsive.css` をPCファースト運用（`max-width`中心）に調整可能。  
- モバイルファースト版を使用する場合は、`style.css` の @import を `responsive.mobile.css` に差し替えるだけ（任意）。

---

## 🧪 動作確認の最短手順
1. `index.html` をルートに置き、上記の `<link>` と `<script>` を記述  
2. Live Server等で起動  
3. Consoleで `LG.components` に各インスタンスが入っていることを確認

---

## ✍️ 作者
**Leon.C / LazyGenius.dev**  
> 怠惰に仕組み化し、短気で高速化し、傲慢で品質を守る — LG流
