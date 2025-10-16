// Tabs（LG流・最小核）
// 契約：root = [data-lg-tabs]
//       タブリスト = [role="tablist"]; タブ = [role="tab"][aria-controls][id]
//       パネル = [role="tabpanel"][id=...][aria-labelledby][hidden]
// 既定：activation='auto'（フォーカス移動で即切替）。'manual'ならEnter/Spaceで確定。
// キー：ArrowLeft/Right, Home, End

export class Tabs {
    /**
     * @param {HTMLElement} root data-lg-tabs を持つラッパ
     * @param {Object} options   { activation?: 'auto'|'manual' }
     */
    constructor(root, { activation = 'auto' } = {}) {
        this.root = root;
        this.activation = activation;
        this.tablist = null;
        this.tabs = [];
        this.panels = [];
        this.onTabClick = this.onTabClick.bind(this);
        this.onTabKey = this.onTabKey.bind(this);
    }

    init() {
        this.tablist = this.root.querySelector('[role="tablist"]');
        this.tabs = Array.from(this.root.querySelectorAll('[role="tab"]'));
        this.panels = this.tabs
            .map(tab => document.getElementById(tab.getAttribute('aria-controls')))
            .filter(Boolean);

        // 初期整合：1つは選択されている前提（HTML側で1つtrue想定）
        const current = Math.max(0, this.tabs.findIndex(t => t.getAttribute('aria-selected') === 'true'));
        this.tabs.forEach((t, i) => {
            const selected = i === current;
            t.setAttribute('tabindex', selected ? '0' : '-1');
            t.setAttribute('aria-selected', String(selected));
            const p = this.panels[i];
            if (p) selected ? p.removeAttribute('hidden') : p.setAttribute('hidden', '');
            t.addEventListener('click', this.onTabClick);
            t.addEventListener('keydown', this.onTabKey);
        });
    }

    destroy() {
        this.tabs.forEach(t => {
            t.removeEventListener('click', this.onTabClick);
            t.removeEventListener('keydown', this.onTabKey);
        });
    }

    onTabClick(e) {
        e.preventDefault();
        const i = this.tabs.indexOf(e.currentTarget);
        if (i >= 0) this.select(i, { focus: true });
    }

    onTabKey(e) {
        const i = this.tabs.indexOf(e.currentTarget);
        const code = e.code || e.key;
        const horizontal = ['ArrowLeft', 'ArrowRight', 'Left', 'Right'];
        const isHomeEnd = code === 'Home' || code === 'End';
        const isEnterSpace = code === 'Enter' || code === 'Space' || code === ' ';

        if (horizontal.includes(code)) {
            e.preventDefault();
            const dir = (code === 'ArrowRight' || code === 'Right') ? 1 : -1;
            const next = (i + dir + this.tabs.length) % this.tabs.length;
            this.tabs[next].focus();
            if (this.activation === 'auto') this.select(next);
        } else if (isHomeEnd) {
            e.preventDefault();
            const next = code === 'Home' ? 0 : this.tabs.length - 1;
            this.tabs[next].focus();
            if (this.activation === 'auto') this.select(next);
        } else if (this.activation === 'manual' && isEnterSpace) {
            e.preventDefault();
            this.select(i, { focus: true });
        }
    }

    select(index, { focus = false } = {}) {
        this.tabs.forEach((t, i) => {
            const selected = i === index;
            t.setAttribute('aria-selected', String(selected));
            t.setAttribute('tabindex', selected ? '0' : '-1');
            if (focus && selected) t.focus();
            const p = this.panels[i];
            if (p) selected ? p.removeAttribute('hidden') : p.setAttribute('hidden', '');
        });
        // 通知（連携用）
        const from = this.tabs.findIndex(t => t.getAttribute('aria-selected') === 'true'); // 直前値は不要なら省略可
        this.root.dispatchEvent(new CustomEvent('lg:tabs:change', {
            bubbles: true,
            detail: { to: index, from }
        }));
    }

    next() { const cur = this.currentIndex(); this.select((cur + 1) % this.tabs.length, { focus: true }); }
    prev() { const cur = this.currentIndex(); this.select((cur - 1 + this.tabs.length) % this.tabs.length, { focus: true }); }
    currentIndex() { return Math.max(0, this.tabs.findIndex(t => t.getAttribute('tabindex') === '0')); }
}
