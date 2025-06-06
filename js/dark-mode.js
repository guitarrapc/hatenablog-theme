/**
 * ダークモード切り替え機能
 * メインボタンをクリックして展開するドロップダウンメニューを提供
 */
(function () {
  // 既存のdarkModeJsが存在する場合は処理をスキップ
  if (window.darkModeJs) {
    console.log('Dark mode JS already initialized');
    return;
  }

  // ダークモードを有効化する属性を追加
  document.documentElement.setAttribute('data-enable-dark-mode', 'true');

  // テーマの定数
  const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    AUTO: 'auto'
  };

  // SVGアイコンの定義
  const ICONS = {
    SUN: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
    MOON: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`,
    MONITOR: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`,
  };

  // ローカルストレージキー
  const STORAGE_KEY = 'codefocus-theme-preference';

  // 現在のテーマを取得
  function getCurrentTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    if (savedTheme && [THEMES.LIGHT, THEMES.DARK, THEMES.AUTO].includes(savedTheme)) {
      return savedTheme;
    }
    return THEMES.AUTO; // デフォルトはシステム設定に合わせる
  }

  // テーマを適用
  function applyTheme(theme) {
    if (theme === THEMES.AUTO) {
      // システム設定に合わせる場合は、data-theme属性を削除
      document.documentElement.removeAttribute('data-theme');
    } else {
      // 明示的なテーマの場合は、data-theme属性を設定
      document.documentElement.setAttribute('data-theme', theme);
    }

    // ローカルストレージに保存
    localStorage.setItem(STORAGE_KEY, theme);
  }

  // 現在のテーマに対応するアイコンを取得
  function getIconForTheme(theme) {
    switch (theme) {
      case THEMES.LIGHT:
        return ICONS.SUN;
      case THEMES.DARK:
        return ICONS.MOON;
      case THEMES.AUTO:
      default:
        return ICONS.MONITOR;
    }
  }

  // テーマ切り替えボタンのコンテナを作成
  function createThemeSwitcher() {
    // コンテナ要素
    const container = document.createElement('div');
    container.className = 'theme-toggle-container';

    // メインボタン
    const mainButton = document.createElement('button');
    mainButton.className = 'theme-toggle-main';
    mainButton.setAttribute('aria-label', 'テーマ切り替え');
    mainButton.setAttribute('aria-expanded', 'false');

    // 現在のテーマに基づいたアイコンを設定
    const currentIcon = document.createElement('span');
    currentIcon.className = 'current-mode-icon';
    currentIcon.innerHTML = getIconForTheme(getCurrentTheme());
    mainButton.appendChild(currentIcon);

    // ドロップダウン
    const dropdown = document.createElement('div');
    dropdown.className = 'theme-toggle-dropdown';

    // ドロップダウンのオプション
    const options = [
      { theme: THEMES.LIGHT, icon: ICONS.SUN, label: 'ライトモード', tooltip: 'ライトモードに固定' },
      { theme: THEMES.DARK, icon: ICONS.MOON, label: 'ダークモード', tooltip: 'ダークモードに固定' },
      { theme: THEMES.AUTO, icon: ICONS.MONITOR, label: '自動切り替え', tooltip: 'システム設定に合わせる' }
    ];

    // オプションボタンを作成
    options.forEach(option => {
      const button = document.createElement('button');
      button.className = 'theme-toggle-option';
      button.setAttribute('aria-label', option.tooltip);
      button.setAttribute('data-theme', option.theme);
      button.title = option.tooltip;

      const iconSpan = document.createElement('span');
      iconSpan.className = 'theme-icon';
      iconSpan.innerHTML = option.icon;
      button.appendChild(iconSpan);

      const labelSpan = document.createElement('span');
      labelSpan.className = 'theme-label';
      labelSpan.textContent = option.label;
      button.appendChild(labelSpan);

      // 現在のテーマと一致する場合、activeクラスを追加
      if (getCurrentTheme() === option.theme) {
        button.classList.add('active');
      }

      // クリックイベント
      button.addEventListener('click', (e) => {
        e.stopPropagation();

        // テーマを適用
        applyTheme(option.theme);

        // ドロップダウンを閉じる
        toggleDropdown(false);

        // メインボタンのアイコンを更新
        currentIcon.innerHTML = option.icon;

        // アクティブ状態を更新
        dropdown.querySelectorAll('.theme-toggle-option').forEach(btn => {
          btn.classList.remove('active');
        });
        button.classList.add('active');
      });

      dropdown.appendChild(button);
    });

    // メインボタンのクリックイベント
    mainButton.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDropdown();
    });

    // ドロップダウンの表示/非表示を切り替え
    function toggleDropdown(force) {
      const isVisible = typeof force !== 'undefined' ? force : !dropdown.classList.contains('show');
      dropdown.classList.toggle('show', isVisible);
      mainButton.setAttribute('aria-expanded', isVisible ? 'true' : 'false');
    }

    // ドキュメント内のクリックでドロップダウンを閉じる
    document.addEventListener('click', (e) => {
      if (!container.contains(e.target)) {
        toggleDropdown(false);
      }
    });

    // Escキーでドロップダウンを閉じる
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dropdown.classList.contains('show')) {
        toggleDropdown(false);
      }
    });

    // コンポーネントを組み立て
    container.appendChild(mainButton);
    container.appendChild(dropdown);

    return container;
  }

  // 初期化処理
  function initialize() {
    // 現在のテーマを適用
    applyTheme(getCurrentTheme());

    // テーマ切り替えUIを追加
    const switcher = createThemeSwitcher();
    document.body.appendChild(switcher);

    // システムの色設定変更を監視（自動モードの場合に反応するため）
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (getCurrentTheme() === THEMES.AUTO) {
        applyTheme(THEMES.AUTO); // 再適用して変更を反映
      }
    });
  }

  // DOMContentLoaded後に初期化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

  // グローバルオブジェクトに登録
  window.darkModeJs = {
    applyTheme,
    getCurrentTheme,
  };
})();
