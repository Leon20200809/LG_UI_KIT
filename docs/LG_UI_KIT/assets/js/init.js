// 司令官（init）：ページ内の data-lg-* を走査し、対応コンポーネントを初期化する。
// 拡張：accordion.js / tabs.js を後から import 追加すれば即展開可能。

import { Hamburger } from './components/hamburger.js';
import { Accordion } from './components/accordion.js';
import { Tabs } from './components/tabs.js';

// data-lg-options に埋めた JSON を安全に読む（存在しなければ {}）
function parseOptions(el) {
    const raw = el.getAttribute('data-lg-options');
    if (!raw) return {};
    try { return JSON.parse(raw); }
    catch { console.warn('[init] data-lg-options JSONが不正', el); return {}; }
}

function initHamburgers(root = document) {
    const buttons = root.querySelectorAll('[data-lg-hamburger]');
    const instances = [];
    buttons.forEach(btn => {
        const opts = parseOptions(btn);
        const hb = new Hamburger(btn, opts);
        hb.init();
        instances.push(hb);
    });
    return instances;
}

function initAccordions(root = document) {
    const roots = root.querySelectorAll('[data-lg-accordion]');
    return Array.from(roots, el => { const acc = new Accordion(el, parseOptions(el)); acc.init(); return acc; });
}

function initTabs(root = document) {
    const roots = root.querySelectorAll('[data-lg-tabs]');
    return Array.from(roots, el => { const tabs = new Tabs(el, parseOptions(el)); tabs.init(); return tabs; });
}

// 将来の拡張用に全インスタンスを保持（必要に応じて destroy 可能）
const LG = {
    components: {
        hamburgers: [],
        accordions: [],
        tabs: [],
    },
    initAll(root = document) {
        this.components.hamburgers = initHamburgers(root);
        this.components.accordions = initAccordions(root);
        this.components.tabs = initTabs(root);
        // ここに init を追加していく
    },
    destroyAll() {
        ['hamburgers', 'accordions', 'tabs'].forEach(k => {
            this.components[k].forEach(i => i.destroy && i.destroy());
            this.components[k] = [];
        });
    }
};

// DOM準備後に展開
document.addEventListener('DOMContentLoaded', () => {
    LG.initAll();
    // デバッグ用：windowに出しておけばコンソールで操作できる
    window.LG = LG;
});
