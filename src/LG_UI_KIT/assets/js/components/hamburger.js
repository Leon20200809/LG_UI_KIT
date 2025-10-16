// ハンバーガー（最小核）
// 目的：ボタンの aria-expanded と、対象ナビの data-state( open / closed ) を同期させる。
// 方針：クリック/Enter/Spaceで toggle、外クリック/ESCで close。依存ゼロ・疎結合。

export class Hamburger {
    /**
     * @param {HTMLButtonElement} button トグルボタン（data-lg-hamburger）
     * @param {Object} options 追加オプション（必要最小）
     *  - target: string | null  明示ターゲット（CSSセレクタ）。未指定なら aria-controls 参照
     *  - closeOnEsc: boolean    ESCで閉じる（標準true）
     *  - closeOnOutside: boolean 外側クリックで閉じる（標準true）
     */
    constructor(button, {
        target = null,
        closeOnEsc = true,
        closeOnOutside = true
    } = {}) {
        this.button = button;
        this.nav = null;           // 対象nav（data-lg-nav）
        this.opts = { target, closeOnEsc, closeOnOutside };

        // バインド（removeEventListener用に参照を保持）
        this.onClick = this.onClick.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onDocClick = this.onDocClick.bind(this);
        this.onDocKey = this.onDocKey.bind(this);
    }

    // 初期化：契約を確認し、イベントを立てる
    init() {
        // 対象navの特定：優先順位 targetオプション > aria-controls
        const id = this.opts.target ?? this.button.getAttribute('aria-controls');
        if (!id) return console.warn('[Hamburger] aria-controls も target も未指定', this.button);

        const nav = document.getElementById(id);
        if (!nav || !nav.matches('[data-lg-nav]')) {
            return console.warn('[Hamburger] 対象が見つからないか data-lg-nav ではない', id);
        }
        this.nav = nav;

        // 初期状態の正規化（不整合を避ける）
        this._setExpanded(false);

        // 監視開始
        this.button.addEventListener('click', this.onClick);
        this.button.addEventListener('keydown', this.onKeyDown);
        if (this.opts.closeOnOutside) document.addEventListener('click', this.onDocClick);
        if (this.opts.closeOnEsc) document.addEventListener('keydown', this.onDocKey);
    }

    // 破棄：イベントを外す（SPA/PJAX対応のため）
    destroy() {
        this.button.removeEventListener('click', this.onClick);
        this.button.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('click', this.onDocClick);
        document.removeEventListener('keydown', this.onDocKey);
    }

    // API：外部から開閉できる
    open() { this._setExpanded(true); this._emit('lg:nav:open'); }
    close() { this._setExpanded(false); this._emit('lg:nav:close'); }
    toggle() { this.isOpen() ? this.close() : this.open(); }

    isOpen() {
        return this.button.getAttribute('aria-expanded') === 'true';
    }

    // クリックでトグル
    onClick(e) {
        e.preventDefault();
        this.toggle();
    }

    // ボタン上で Enter/Space を押したら発火（キーボード操作）
    onKeyDown(e) {
        const code = e.code || e.key;
        if (code === 'Enter' || code === 'Space' || code === ' ') {
            e.preventDefault();
            this.toggle();
        }
    }

    // ドキュメント外クリックで閉じる（ボタンとnavの外側をクリックした場合）
    onDocClick(e) {
        if (!this.isOpen()) return;
        const t = e.target;
        if (t === this.button || this.button.contains(t)) return;
        if (this.nav && (t === this.nav || this.nav.contains(t))) return;
        this.close();
    }

    // ESCで閉じる
    onDocKey(e) {
        if (!this.isOpen()) return;
        if ((e.code || e.key) === 'Escape') this.close();
    }

    // 内部：状態同期（A11yと契約属性を一箇所で制御）
    _setExpanded(expanded) {
        this.button.setAttribute('aria-expanded', String(expanded));
        if (this.nav) this.nav.setAttribute('data-state', expanded ? 'open' : 'closed');
    }

    // 内部：CustomEvent発火（疎結合連携用）
    _emit(name) {
        this.button.dispatchEvent(new CustomEvent(name, {
            bubbles: true,
            detail: { source: this.button, target: this.nav }
        }));
    }
}
