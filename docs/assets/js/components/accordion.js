// Accordion（LG流・最小核）
// 契約：root = [data-lg-accordion]
//       トリガ = [data-lg-acc-trigger][aria-controls]（button推奨）
//       パネル = [role="region"][id=...][hidden]（aria-labelledbyで見出しと紐付け）
//
// 既定：allowMultiple=false（単一開モード）。JSONで data-lg-options に渡せる。
// 操作：クリック／Enter／Spaceでトグル。

export class Accordion {
    /**
     * @param {HTMLElement} root  data-lg-accordion を持つラッパ
     * @param {Object} options    { allowMultiple?: boolean }
     */
    constructor(root, { allowMultiple = false } = {}) {
        this.root = root;
        this.allowMultiple = allowMultiple;
        this.triggers = [];
        this.panels = [];
        this.onTriggerClick = this.onTriggerClick.bind(this);
        this.onTriggerKey = this.onTriggerKey.bind(this);
    }

    init() {
        this.triggers = Array.from(this.root.querySelectorAll('[data-lg-acc-trigger][aria-controls]'));
        this.panels = this.triggers
            .map(btn => document.getElementById(btn.getAttribute('aria-controls')))
            .filter(Boolean);

        // 初期状態の正規化
        this.triggers.forEach((btn, i) => {
            const panel = this.panels[i];
            const expanded = btn.getAttribute('aria-expanded') === 'true';
            btn.setAttribute('aria-expanded', String(expanded));
            if (panel) {
                if (expanded) panel.removeAttribute('hidden');
                else panel.setAttribute('hidden', '');
            }
            btn.addEventListener('click', this.onTriggerClick);
            btn.addEventListener('keydown', this.onTriggerKey);
        });
    }

    destroy() {
        this.triggers.forEach(btn => {
            btn.removeEventListener('click', this.onTriggerClick);
            btn.removeEventListener('keydown', this.onTriggerKey);
        });
    }

    onTriggerClick(e) {
        e.preventDefault();
        this.toggleByTrigger(e.currentTarget);
    }

    onTriggerKey(e) {
        const code = e.code || e.key;
        if (code === 'Enter' || code === 'Space' || code === ' ') {
            e.preventDefault();
            this.toggleByTrigger(e.currentTarget);
        }
    }

    toggleByTrigger(btn) {
        const id = btn.getAttribute('aria-controls');
        if (!id) return;
        const panel = document.getElementById(id);
        const willOpen = btn.getAttribute('aria-expanded') !== 'true';

        if (willOpen && !this.allowMultiple) {
            // 単一開：他を閉じる
            this.triggers.forEach((b) => {
                if (b === btn) return;
                this._setExpanded(b, false);
            });
        }
        this._setExpanded(btn, willOpen);

        // 通知（連携用）
        btn.dispatchEvent(new CustomEvent('lg:accordion:toggle', {
            bubbles: true,
            detail: { id, expanded: willOpen }
        }));
    }

    _setExpanded(btn, expanded) {
        const id = btn.getAttribute('aria-controls');
        const panel = id ? document.getElementById(id) : null;
        btn.setAttribute('aria-expanded', String(expanded));
        if (panel) {
            if (expanded) panel.removeAttribute('hidden');
            else panel.setAttribute('hidden', '');
        }
    }

    // 公開API
    openById(id) { const btn = this.triggers.find(b => b.getAttribute('aria-controls') === id); if (btn) this._setExpanded(btn, true); }
    closeById(id) { const btn = this.triggers.find(b => b.getAttribute('aria-controls') === id); if (btn) this._setExpanded(btn, false); }
}
