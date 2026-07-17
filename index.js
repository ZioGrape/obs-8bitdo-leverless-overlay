(function () {
  "use strict";

  // ---------------------------------------------------------------------
  // Layout model — one entry per physical element on the 8BitDo Arcade
  // Controller (Xbox edition). Coordinates are centers, in px, measured
  // directly off references/8BitDo-Arcade-Controller-Xbox-Series-X.jpg
  // (1024x684) via automated green-ring centroid detection + gridded
  // crops, against a fixed 1024x684 reference canvas (#stage), which is
  // uniformly scaled to fit the viewport.
  // ---------------------------------------------------------------------
  var STAGE_W = 1024, STAGE_H = 684;

  var BUTTON_DEFS = [
    // top strip
    { id: "knob_vol",  kind: "knob",   label: "",   sub: "VOL", x: 47.5,  y: 55,  w: 53,  h: 53 },
    { id: "knob_2",    kind: "knob",   label: "",               x: 124.5, y: 55,  w: 53,  h: 53 },
    { id: "round_1",   kind: "fn",     label: "",  icon: "star", x: 201.5, y: 55,  w: 53,  h: 53 },
    { id: "btn_xbox",  kind: "xbox",   label: "✕",         x: 278.5, y: 55,  w: 53,  h: 53, gamepad: 16 },
    { id: "round_2",   kind: "fn",     label: "",  icon: "heart", x: 355.5, y: 55,  w: 53,  h: 53 },
    { id: "fn_star",   kind: "fn",     shape: "circle", label: "✳", x: 729, y: 55, w: 44, h: 44 },
    { id: "fn_capture",kind: "fn",     shape: "pill",   label: "⧉", x: 797, y: 55, w: 72, h: 40 },
    { id: "fn_share",  kind: "fn",     shape: "pill",   label: "⬆", x: 879, y: 55, w: 72, h: 40 },
    { id: "fn_menu",   kind: "fn",     shape: "pill",   label: "", icon: "menu", x: 961, y: 55, w: 72, h: 40 },

    // hitbox-style direction cluster (left/down/right — fingers)
    { id: "dir_left",  kind: "button", shape: "circle", label: "←", arrow: true, icon: "M6 12H18M6 12L11 7M6 12L11 17", x: 237, y: 244, w: 94, h: 94, gamepad: 14 },
    { id: "dir_down",  kind: "button", shape: "circle", label: "↓", arrow: true, icon: "M12 6V18M12 18L7 13M12 18L17 13", x: 351, y: 244, w: 94, h: 94, gamepad: 13 },
    { id: "dir_right", kind: "button", shape: "circle", label: "→", arrow: true, icon: "M6 12H18M18 12L13 7M18 12L13 17", x: 449, y: 303, w: 94, h: 94, gamepad: 15 },

    // kidney-shaped auxiliary paddles — unlabeled on the physical case.
    // Traced off images/extrabutton.png (a clean isolated,
    // background-removed photo of the real button), then the raw
    // polyline points were re-fit as a smooth closed Catmull-Rom spline
    // (converted to cubic beziers) instead of straight segments, so the
    // outline has no faceted/angular spots.
    { id: "paddle_p1",  kind: "button", shape: "blob", label: "", x: 372, y: 154, w: 116, h: 77, rotate: -9.5,
      viewBox: "0 0 131 87",
      path: "M3.0,20.0 C0.7,23.8 0.5,28.2 0.0,32.0 C-0.5,35.8 -0.3,40.2 0.0,43.0 C0.3,45.8 0.8,46.7 2.0,49.0 C3.2,51.3 4.2,54.3 7.0,57.0 C9.8,59.7 15.5,63.3 19.0,65.0 C22.5,66.7 22.2,66.5 28.0,67.0 C33.8,67.5 48.0,67.3 54.0,68.0 C60.0,68.7 59.2,68.7 64.0,71.0 C68.8,73.3 76.7,79.7 83.0,82.0 C89.3,84.3 97.2,84.8 102.0,85.0 C106.8,85.2 108.7,85.2 112.0,83.0 C115.3,80.8 119.7,75.5 122.0,72.0 C124.3,68.5 125.0,67.0 126.0,62.0 C127.0,57.0 130.2,48.3 128.0,42.0 C125.8,35.7 118.0,29.0 113.0,24.0 C108.0,19.0 104.0,15.5 98.0,12.0 C92.0,8.5 83.0,5.0 77.0,3.0 C71.0,1.0 69.7,0.2 62.0,0.0 C54.3,-0.2 39.0,0.5 31.0,2.0 C23.0,3.5 18.7,6.0 14.0,9.0 C9.3,12.0 5.3,16.2 3.0,20.0 Z" },
    { id: "paddle_lsb", kind: "button", shape: "blob", label: "", x: 539.3, y: 157.9, w: 117, h: 78, rotate: -17, gamepad: 10,
      viewBox: "0 0 131 87",
      path: "M3.0,20.0 C0.7,23.8 0.5,28.2 0.0,32.0 C-0.5,35.8 -0.3,40.2 0.0,43.0 C0.3,45.8 0.8,46.7 2.0,49.0 C3.2,51.3 4.2,54.3 7.0,57.0 C9.8,59.7 15.5,63.3 19.0,65.0 C22.5,66.7 22.2,66.5 28.0,67.0 C33.8,67.5 48.0,67.3 54.0,68.0 C60.0,68.7 59.2,68.7 64.0,71.0 C68.8,73.3 76.7,79.7 83.0,82.0 C89.3,84.3 97.2,84.8 102.0,85.0 C106.8,85.2 108.7,85.2 112.0,83.0 C115.3,80.8 119.7,75.5 122.0,72.0 C124.3,68.5 125.0,67.0 126.0,62.0 C127.0,57.0 130.2,48.3 128.0,42.0 C125.8,35.7 118.0,29.0 113.0,24.0 C108.0,19.0 104.0,15.5 98.0,12.0 C92.0,8.5 83.0,5.0 77.0,3.0 C71.0,1.0 69.7,0.2 62.0,0.0 C54.3,-0.2 39.0,0.5 31.0,2.0 C23.0,3.5 18.7,6.0 14.0,9.0 C9.3,12.0 5.3,16.2 3.0,20.0 Z" },
    { id: "paddle_p2",  kind: "button", shape: "blob", label: "", x: 410.3, y: 458.6, w: 106, h: 71, rotate: -97.5,
      viewBox: "0 0 131 87",
      path: "M3.0,20.0 C0.7,23.8 0.5,28.2 0.0,32.0 C-0.5,35.8 -0.3,40.2 0.0,43.0 C0.3,45.8 0.8,46.7 2.0,49.0 C3.2,51.3 4.2,54.3 7.0,57.0 C9.8,59.7 15.5,63.3 19.0,65.0 C22.5,66.7 22.2,66.5 28.0,67.0 C33.8,67.5 48.0,67.3 54.0,68.0 C60.0,68.7 59.2,68.7 64.0,71.0 C68.8,73.3 76.7,79.7 83.0,82.0 C89.3,84.3 97.2,84.8 102.0,85.0 C106.8,85.2 108.7,85.2 112.0,83.0 C115.3,80.8 119.7,75.5 122.0,72.0 C124.3,68.5 125.0,67.0 126.0,62.0 C127.0,57.0 130.2,48.3 128.0,42.0 C125.8,35.7 118.0,29.0 113.0,24.0 C108.0,19.0 104.0,15.5 98.0,12.0 C92.0,8.5 83.0,5.0 77.0,3.0 C71.0,1.0 69.7,0.2 62.0,0.0 C54.3,-0.2 39.0,0.5 31.0,2.0 C23.0,3.5 18.7,6.0 14.0,9.0 C9.3,12.0 5.3,16.2 3.0,20.0 Z" },
    { id: "paddle_rsb", kind: "button", shape: "blob", label: "", x: 647.7, y: 406.7, w: 112, h: 75, rotate: 1.1, flip: true, gamepad: 11,
      viewBox: "0 0 131 87",
      path: "M3.0,20.0 C0.7,23.8 0.5,28.2 0.0,32.0 C-0.5,35.8 -0.3,40.2 0.0,43.0 C0.3,45.8 0.8,46.7 2.0,49.0 C3.2,51.3 4.2,54.3 7.0,57.0 C9.8,59.7 15.5,63.3 19.0,65.0 C22.5,66.7 22.2,66.5 28.0,67.0 C33.8,67.5 48.0,67.3 54.0,68.0 C60.0,68.7 59.2,68.7 64.0,71.0 C68.8,73.3 76.7,79.7 83.0,82.0 C89.3,84.3 97.2,84.8 102.0,85.0 C106.8,85.2 108.7,85.2 112.0,83.0 C115.3,80.8 119.7,75.5 122.0,72.0 C124.3,68.5 125.0,67.0 126.0,62.0 C127.0,57.0 130.2,48.3 128.0,42.0 C125.8,35.7 118.0,29.0 113.0,24.0 C108.0,19.0 104.0,15.5 98.0,12.0 C92.0,8.5 83.0,5.0 77.0,3.0 C71.0,1.0 69.7,0.2 62.0,0.0 C54.3,-0.2 39.0,0.5 31.0,2.0 C23.0,3.5 18.7,6.0 14.0,9.0 C9.3,12.0 5.3,16.2 3.0,20.0 Z" },

    // main 8-button grid
    { id: "btn_Y",  kind: "button", shape: "circle", label: "Y",  color: "#e8c34a", x: 651, y: 192, w: 96, h: 96, gamepad: 3 },
    { id: "btn_RB", kind: "button", shape: "circle", label: "RB", x: 766, y: 192, w: 96, h: 96, gamepad: 5 },
    { id: "btn_LB", kind: "button", shape: "circle", label: "LB", x: 875, y: 196, w: 96, h: 96, gamepad: 4 },
    { id: "btn_X",  kind: "button", shape: "circle", label: "X",  color: "#4fa8e8", x: 553, y: 252, w: 94, h: 94, gamepad: 2 },
    { id: "btn_A",  kind: "button", shape: "circle", label: "A",  color: "#4f9f2a", x: 546, y: 367, w: 94, h: 94, gamepad: 0 },
    { id: "btn_B",  kind: "button", shape: "circle", label: "B",  color: "#e2564a", x: 654, y: 307, w: 96, h: 96, gamepad: 1 },
    { id: "btn_RT", kind: "button", shape: "circle", label: "RT", x: 766, y: 310, w: 94, h: 94, gamepad: 7 },
    { id: "btn_LT", kind: "button", shape: "circle", label: "LT", x: 876, y: 311, w: 96, h: 96, gamepad: 6 },
    // biggest cap on the case — thumb-operated "up", not shared with any
    // face button; user's own gamepad test confirmed index 12 fires here.
    { id: "dir_up", kind: "button", shape: "circle", label: "↑", arrow: true, icon: "M12 6V18M12 6L7 11M12 6L17 11", x: 507, y: 493, w: 111, h: 111, gamepad: 12 }
  ];

  // Bumped to v2: btn_A/btn_B/dir_up were reassigned to different
  // physical positions and btn_extra was removed, so any v1 config
  // cached in a browser's localStorage would carry stale gamepad
  // bindings under those same ids (e.g. "A" still firing on the old
  // "up" index). Versioning the key forces a clean rebuild from the
  // current BUTTON_DEFS defaults instead of silently keeping the stale
  // per-id bindings.
  var STORAGE_KEY = "arcadeOverlayConfig.v2";

  // ---------------------------------------------------------------------
  // i18n — control panel only (editor UI text). Persisted separately from
  // the layout config so switching language never touches button bindings.
  // ---------------------------------------------------------------------
  var LANG_KEY = "arcadeOverlayLang";
  var I18N = {
    ru: {
      toolbarHandleLabel: "☰ Панель",
      toolbarHandleTitle: "Показать/скрыть панель редактора",
      editModeLabel: "Режим редактирования: ",
      editModeOn: "ВКЛ",
      editModeOff: "ВЫКЛ",
      gpDisconnected: "Геймпад: не подключен",
      gpConnectedPrefix: "Геймпад: ",
      presetDark: "Пресет: Тёмная",
      presetDarkTitle: "Тёмная тема по умолчанию",
      presetStandard: "Пресет: Стандарт",
      presetStandardTitle: "Серый корпус, красные кнопки (стандартная расцветка 8BitDo Arcade Controller)",
      presetPurple: "Пресет: Purple",
      presetPurpleTitle: "Прозрачно-фиолетовый корпус (Transparent Purple Signature Edition)",
      resetStyles: "Сбросить стили",
      exportCfg: "Экспорт конфига",
      importCfg: "Импорт конфига",
      bgToggleLabel: "непрозрачный фон (превью)",
      overlayHint: "Overlay-URL для OBS (Browser Source, фон прозрачный): ",
      labelName: "Название",
      labelBinding: "Привязка входа",
      bindAssign: "Назначить…",
      bindClear: "Очистить",
      stateIdle: "Состояние: покой",
      stateActive: "Состояние: нажато",
      colorFill: "Заливка",
      colorBorder: "Обводка",
      colorBorderGlow: "Обводка/свечение",
      showLabel: "Показывать подпись",
      pressKeyOrButton: "Нажмите клавишу или кнопку геймпада…",
      bindGamepadButton: "Геймпад: кнопка ",
      bindKey: "Клавиша: ",
      confirmResetStyles: "Сбросить цвета всех кнопок к значениям по умолчанию? Привязки входов сохранятся.",
      importError: "Не удалось прочитать файл конфигурации: ",
      dash: "—"
    },
    en: {
      toolbarHandleLabel: "☰ Panel",
      toolbarHandleTitle: "Show/hide the editor panel",
      editModeLabel: "Edit mode: ",
      editModeOn: "ON",
      editModeOff: "OFF",
      gpDisconnected: "Gamepad: not connected",
      gpConnectedPrefix: "Gamepad: ",
      presetDark: "Preset: Dark",
      presetDarkTitle: "Default dark theme",
      presetStandard: "Preset: Standard",
      presetStandardTitle: "Grey case, red buttons (stock 8BitDo Arcade Controller colorway)",
      presetPurple: "Preset: Purple",
      presetPurpleTitle: "Transparent Purple Signature Edition",
      resetStyles: "Reset styles",
      exportCfg: "Export config",
      importCfg: "Import config",
      bgToggleLabel: "opaque background (preview)",
      overlayHint: "Overlay URL for OBS (Browser Source, transparent background): ",
      labelName: "Name",
      labelBinding: "Input binding",
      bindAssign: "Assign…",
      bindClear: "Clear",
      stateIdle: "State: idle",
      stateActive: "State: pressed",
      colorFill: "Fill",
      colorBorder: "Border",
      colorBorderGlow: "Border/glow",
      showLabel: "Show label",
      pressKeyOrButton: "Press a key or gamepad button…",
      bindGamepadButton: "Gamepad: button ",
      bindKey: "Key: ",
      confirmResetStyles: "Reset all button colors to defaults? Input bindings will be kept.",
      importError: "Failed to read config file: ",
      dash: "—"
    }
  };

  var lang = (function () {
    var saved = null;
    try { saved = localStorage.getItem(LANG_KEY); } catch (e) { saved = null; }
    if (saved === "ru" || saved === "en") return saved;
    return (navigator.language || "").toLowerCase().indexOf("ru") === 0 ? "ru" : "en";
  })();

  function t(key) {
    var dict = I18N[lang] || I18N.ru;
    return dict[key] !== undefined ? dict[key] : I18N.ru[key];
  }

  function defaultStyleFor(def) {
    return {
      idleFill: "#0c0c0c",
      idleBorder: "#3a3b3e",
      activeFill: "#0f1a12",
      activeBorder: "#1cca27",
      showLabel: true
    };
  }

  function loadConfig() {
    var raw = null;
    try { raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch (e) { raw = null; }
    var cfg = raw && typeof raw === "object" ? raw : {};
    cfg.bindings = cfg.bindings || {};
    cfg.styles = cfg.styles || {};
    cfg.labels = cfg.labels || {};
    cfg.theme = typeof cfg.theme === "string" ? cfg.theme : "";

    BUTTON_DEFS.forEach(function (def) {
      if (!cfg.bindings[def.id]) {
        cfg.bindings[def.id] = {
          gamepad: typeof def.gamepad === "number" ? def.gamepad : null,
          key: null
        };
      }
      if (!cfg.styles[def.id]) cfg.styles[def.id] = defaultStyleFor(def);
      if (typeof cfg.labels[def.id] !== "string") cfg.labels[def.id] = def.label;
    });
    return cfg;
  }

  function saveConfig() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }

  var config = loadConfig();
  var elements = {}; // id -> { root, labelEl }
  var editMode = true;
  var overlayForced = /[?&]overlay=1/.test(location.search);
  var selectedId = null;
  var listening = null; // id currently capturing a new binding
  var heldKeys = {}; // keyboard code -> true while held

  // Xbox hub mark — the 4 sphere-quadrant paths from
  // images/xbox-svgrepo-com (1).svg (viewBox 0 0 24 24), recolored to
  // currentColor so it follows the button's theme.
  var XBOX_MARK_PATHS = [
    "m24 12c0-.001 0-.001 0-.002 0-3.618-1.606-6.861-4.144-9.054l-.015-.013c-1.91 1.023-3.548 2.261-4.967 3.713l-.004.004c.044.046.087.085.131.132 3.719 4.012 7.106 9.73 6.546 12.471 1.53-1.985 2.452-4.508 2.452-7.246 0-.002 0-.004 0-.006z",
    "m12.591 3.955c1.68-1.104 3.699-1.833 5.872-2.022l.048-.003c-1.837-1.21-4.09-1.929-6.511-1.929-2.171 0-4.207.579-5.962 1.591l.058-.031c.658.567 2.837.781 5.484 2.4.143.089.316.142.502.142.189 0 .365-.055.513-.149l-.004.002z",
    "m9.166 6.778c.046-.049.093-.09.138-.138-1.17-1.134-2.446-2.174-3.806-3.1l-.099-.064c-.302-.221-.681-.354-1.091-.354-.146 0-.288.017-.425.049l.013-.002c-2.398 2.198-3.896 5.344-3.896 8.84 0 2.909 1.037 5.576 2.762 7.651l-.016-.02c-1.031-2.547 2.477-8.672 6.419-12.862z",
    "m12.084 9.198c-3.962 3.503-9.477 8.73-8.632 11.218 2.174 2.213 5.198 3.584 8.542 3.584 3.493 0 6.637-1.496 8.826-3.883l.008-.009c.486-2.618-4.755-7.337-8.744-10.91z"
  ];
  function buildXboxMark() {
    var svgNS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.style.width = "calc(100% - 10px)";
    svg.style.height = "calc(100% - 10px)";
    XBOX_MARK_PATHS.forEach(function (d) {
      var p = document.createElementNS(svgNS, "path");
      p.setAttribute("d", d);
      p.setAttribute("fill", "currentColor");
      svg.appendChild(p);
    });
    return svg;
  }

  // same checkerboard-dithered pixel heart as the corner logo, reused
  // for the fn button that should show a heart mark
  var HEART_MARK_PATH =
    "M2,0 L3,0 L3,1 L2,1 Z M4,0 L5,0 L5,1 L4,1 Z M1,1 L2,1 L2,2 L1,2 Z M3,1 L4,1 L4,2 L3,2 Z M5,1 L6,1 L6,2 L5,2 Z " +
    "M0,2 L1,2 L1,3 L0,3 Z M2,2 L3,2 L3,3 L2,3 Z M4,2 L5,2 L5,3 L4,3 Z M6,2 L7,2 L7,3 L6,3 Z " +
    "M1,3 L2,3 L2,4 L1,4 Z M3,3 L4,3 L4,4 L3,4 Z M5,3 L6,3 L6,4 L5,4 Z M2,4 L3,4 L3,5 L2,5 Z M4,4 L5,4 L5,5 L4,5 Z M3,5 L4,5 L4,6 L3,6 Z";
  function buildHeartMark() {
    var svgNS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 7 6");
    svg.setAttribute("shape-rendering", "crispEdges");
    svg.style.width = "55%";
    svg.style.height = "55%";
    var p = document.createElementNS(svgNS, "path");
    p.setAttribute("d", HEART_MARK_PATH);
    p.setAttribute("fill", "currentColor");
    svg.appendChild(p);
    return svg;
  }

  // hamburger-menu mark: 3 long, thick, evenly-centered bars (an actual
  // vector shape draws and centers far more reliably than the unicode
  // "≡" glyph, which renders inconsistently and off-center)
  function buildMenuMark() {
    var svgNS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.style.width = "62%";
    svg.style.height = "62%";
    [6, 12, 18].forEach(function (yPos) {
      var line = document.createElementNS(svgNS, "line");
      line.setAttribute("x1", "3");
      line.setAttribute("y1", yPos);
      line.setAttribute("x2", "21");
      line.setAttribute("y2", yPos);
      line.setAttribute("stroke", "currentColor");
      line.setAttribute("stroke-width", "2.6");
      line.setAttribute("stroke-linecap", "round");
      svg.appendChild(line);
    });
    return svg;
  }

  // 5-point star -- swapped in for the "★" glyph, which fonts render
  // with inconsistent internal padding and never sits truly centered
  var STAR_MARK_PATH = "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";
  function buildStarMark() {
    var svgNS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.style.width = "62%";
    svg.style.height = "62%";
    var p = document.createElementNS(svgNS, "path");
    p.setAttribute("d", STAR_MARK_PATH);
    p.setAttribute("fill", "currentColor");
    svg.appendChild(p);
    return svg;
  }

  // wifi/signal mark — the Standard and Purple Signature editions use this
  // (plus a star, swapped with the Xbox hub) on the top-strip trio instead
  // of the Xbox-edition's star/Xbox-mark/heart, per their reference photos.
  function buildWifiMark() {
    var svgNS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.style.width = "62%";
    svg.style.height = "62%";
    [
      "M2 8.5C7 3.5 17 3.5 22 8.5",
      "M5.5 12.5C9 9 15 9 18.5 12.5",
      "M9 16.5C10.7 14.8 13.3 14.8 15 16.5"
    ].forEach(function (d) {
      var p = document.createElementNS(svgNS, "path");
      p.setAttribute("d", d);
      p.setAttribute("stroke", "currentColor");
      p.setAttribute("stroke-width", "2");
      p.setAttribute("stroke-linecap", "round");
      svg.appendChild(p);
    });
    var dot = document.createElementNS(svgNS, "circle");
    dot.setAttribute("cx", "12");
    dot.setAttribute("cy", "20");
    dot.setAttribute("r", "1.4");
    dot.setAttribute("fill", "currentColor");
    svg.appendChild(dot);
    return svg;
  }

  // ---------------------------------------------------------------------
  // Build DOM
  // ---------------------------------------------------------------------
  function buildStage() {
    var body = document.querySelector(".controller-body");

    BUTTON_DEFS.forEach(function (def) {
      var el = document.createElement("div");
      el.className = "pad-el pad-btn";
      el.dataset.id = def.id;
      el.style.left = def.x + "px";
      el.style.top = def.y + "px";
      el.style.width = def.w + "px";
      el.style.height = def.h + "px";

      if (def.kind === "knob") {
        el.className = "pad-el pad-knob";
        if (def.sub) {
          var sub = document.createElement("span");
          sub.className = "knob-label";
          sub.textContent = def.sub;
          el.appendChild(sub);
        }
      } else if (def.kind === "xbox") {
        el.className += " pad-xbox";
        el.appendChild(buildXboxMark());
      } else if (def.kind === "fn") {
        el.className += " pad-fn shape-" + (def.shape || "circle");
        if (def.icon === "heart") el.appendChild(buildHeartMark());
        else if (def.icon === "menu") el.appendChild(buildMenuMark());
        else if (def.icon === "star") el.appendChild(buildStarMark());
        else el.textContent = def.label;
      } else {
        // gameplay button
        el.className += " shape-" + (def.shape || "circle");
        var transformParts = ["translate(-50%,-50%)"];
        if (def.flip) transformParts.push("scaleX(-1)");
        if (def.rotate) transformParts.push("rotate(" + def.rotate + "deg)");
        el.style.transform = transformParts.join(" ");
        if (def.shape === "blob") {
          var svgNS = "http://www.w3.org/2000/svg";
          var svg = document.createElementNS(svgNS, "svg");
          svg.setAttribute("viewBox", def.viewBox);
          svg.setAttribute("preserveAspectRatio", "none");
          var path = document.createElementNS(svgNS, "path");
          path.setAttribute("d", def.path);
          svg.appendChild(path);
          el.appendChild(svg);
        }
        var lbl = document.createElement("span");
        lbl.className = "lbl" + (def.arrow ? " lbl--arrow" : "");
        if (def.icon) {
          var iconSvgNS = "http://www.w3.org/2000/svg";
          var iconSvg = document.createElementNS(iconSvgNS, "svg");
          iconSvg.setAttribute("viewBox", "0 0 24 24");
          iconSvg.setAttribute("fill", "none");
          var iconPath = document.createElementNS(iconSvgNS, "path");
          iconPath.setAttribute("d", def.icon);
          iconPath.setAttribute("stroke", "currentColor");
          iconPath.setAttribute("stroke-width", "2");
          iconPath.setAttribute("stroke-linecap", "round");
          iconPath.setAttribute("stroke-linejoin", "round");
          iconSvg.appendChild(iconPath);
          lbl.appendChild(iconSvg);
        } else {
          lbl.textContent = config.labels[def.id];
        }
        if (def.color) lbl.style.color = def.color;
        el.appendChild(lbl);
        elements[def.id] = elements[def.id] || {};
        elements[def.id].labelEl = lbl;
      }

      if (def.kind === "button" || def.kind === "xbox" || def.kind === "fn") {
        el.addEventListener("click", function () { onElementClick(def.id); });
      }

      body.appendChild(el);
      elements[def.id] = elements[def.id] || {};
      elements[def.id].root = el;
      elements[def.id].def = def;
    });

    applyAllStyles();
  }

  function applyAllStyles() {
    BUTTON_DEFS.forEach(function (def) { applyStyle(def.id); });
  }

  var TOP_STRIP_LABELS = [
    { id: "fn_star", label: "L3" },
    { id: "fn_capture", label: "R3" },
    { id: "fn_share", label: "SELECT" },
    { id: "fn_menu", label: "START" }
  ];

  var COLORED_LABEL_IDS = ["btn_Y", "btn_X", "btn_A", "btn_B"];

  // Standard/Purple show wifi-mark + star on the top-strip trio instead of
  // the Xbox edition's star + Xbox-mark (round_2's heart is shared by all
  // editions, so it's left alone). Re-run whenever the case theme changes.
  function refreshTopIcons() {
    var useAlt = document.body.dataset.theme === "standard" || document.body.dataset.theme === "purple";
    var round1El = elements["round_1"].root;
    round1El.innerHTML = "";
    round1El.appendChild(useAlt ? buildWifiMark() : buildStarMark());
    var xboxEl = elements["btn_xbox"].root;
    xboxEl.innerHTML = "";
    xboxEl.appendChild(useAlt ? buildStarMark() : buildXboxMark());

    // The Xbox edition's L3/R3/SELECT/START-equivalent row is 1 round +
    // 3 pill (fn_star round, the rest pill). Standard/Purple's is 2 round
    // + 2 pill (L3/R3 round, SELECT/START pill) — fn_capture is the one
    // that needs to switch shape; fn_star/fn_share/fn_menu already match.
    var captureEl = elements["fn_capture"].root;
    var captureDef = elements["fn_capture"].def;
    if (useAlt) {
      captureEl.style.width = elements["fn_star"].def.w + "px";
      captureEl.style.height = elements["fn_star"].def.h + "px";
      captureEl.classList.remove("shape-pill");
      captureEl.classList.add("shape-circle");
    } else {
      captureEl.style.width = captureDef.w + "px";
      captureEl.style.height = captureDef.h + "px";
      captureEl.classList.remove("shape-circle");
      captureEl.classList.add("shape-pill");
    }

    // Standard/Purple print "L3"/"R3"/"SELECT"/"START" directly on these
    // caps instead of the Xbox edition's icon glyphs (✳/⧉/⬆/hamburger).
    TOP_STRIP_LABELS.forEach(function (row) {
      var el = elements[row.id].root;
      var def = elements[row.id].def;
      el.innerHTML = "";
      if (useAlt) {
        el.textContent = row.label;
        el.style.fontSize = "11px";
        el.style.fontWeight = "700";
      } else {
        el.style.fontSize = "";
        el.style.fontWeight = "";
        if (def.icon === "menu") el.appendChild(buildMenuMark());
        else el.textContent = def.label;
      }
    });

    // Y/X/A/B's per-button label tint (yellow/blue/green/red, matching the
    // Xbox controller's own face-button colors) fights the Standard/Purple
    // fill colors — B in particular is nearly unreadable as red-on-red.
    // Neither reference photo color-codes these letters at all, so drop
    // back to the default light label color for both alt themes.
    COLORED_LABEL_IDS.forEach(function (id) {
      var e = elements[id];
      if (!e.labelEl) return;
      e.labelEl.style.color = useAlt ? "" : e.def.color;
    });
  }

  function applyStyle(id) {
    var e = elements[id];
    if (!e) return;
    var s = config.styles[id] || defaultStyleFor();
    e.root.style.setProperty("--idle-fill", s.idleFill);
    e.root.style.setProperty("--idle-border", s.idleBorder);
    e.root.style.setProperty("--active-fill", s.activeFill);
    e.root.style.setProperty("--active-border", s.activeBorder);
    if (e.labelEl) {
      if (!e.def || !e.def.icon) e.labelEl.textContent = config.labels[id];
      e.root.classList.toggle("no-label", !s.showLabel);
    }
  }

  // ---------------------------------------------------------------------
  // Edit-mode selection / inspector
  // ---------------------------------------------------------------------
  var inspector = document.getElementById("inspector");
  var inspTitle = document.getElementById("inspTitle");
  var inspLabel = document.getElementById("inspLabel");
  var inspBindingValue = document.getElementById("inspBindingValue");
  var inspBind = document.getElementById("inspBind");
  var inspClear = document.getElementById("inspClear");
  var inspIdleFill = document.getElementById("inspIdleFill");
  var inspIdleBorder = document.getElementById("inspIdleBorder");
  var inspActiveFill = document.getElementById("inspActiveFill");
  var inspActiveBorder = document.getElementById("inspActiveBorder");
  var inspShowLabel = document.getElementById("inspShowLabel");
  var inspClose = document.getElementById("inspClose");

  function onElementClick(id) {
    if (!editMode) return;
    selectedId = id;
    listening = null;
    Object.keys(elements).forEach(function (k) {
      elements[k].root.classList.toggle("is-selected", k === id);
    });
    refreshInspector();
    inspector.classList.remove("inspector--hidden");
  }

  function bindingLabel(b) {
    if (!b) return t("dash");
    var parts = [];
    if (typeof b.gamepad === "number") parts.push(t("bindGamepadButton") + b.gamepad);
    if (b.key) parts.push(t("bindKey") + b.key);
    return parts.length ? parts.join(" · ") : t("dash");
  }

  function refreshInspector() {
    if (!selectedId) return;
    var def = elements[selectedId].def;
    var s = config.styles[selectedId];
    var b = config.bindings[selectedId];

    inspTitle.textContent = def.label || def.id;
    inspLabel.value = config.labels[selectedId];
    inspLabel.disabled = def.kind === "knob";
    inspBindingValue.textContent = bindingLabel(b);
    inspBindingValue.classList.remove("listening");
    inspIdleFill.value = s.idleFill;
    inspIdleBorder.value = s.idleBorder;
    inspActiveFill.value = s.activeFill;
    inspActiveBorder.value = s.activeBorder;
    inspShowLabel.checked = s.showLabel;
  }

  inspClose.addEventListener("click", function () {
    selectedId = null;
    listening = null;
    Object.keys(elements).forEach(function (k) { elements[k].root.classList.remove("is-selected"); });
    inspector.classList.add("inspector--hidden");
  });

  inspLabel.addEventListener("input", function () {
    if (!selectedId) return;
    config.labels[selectedId] = inspLabel.value;
    applyStyle(selectedId);
    saveConfig();
  });

  function wireColor(input, key) {
    input.addEventListener("input", function () {
      if (!selectedId) return;
      config.styles[selectedId][key] = input.value;
      applyStyle(selectedId);
      saveConfig();
    });
  }
  wireColor(inspIdleFill, "idleFill");
  wireColor(inspIdleBorder, "idleBorder");
  wireColor(inspActiveFill, "activeFill");
  wireColor(inspActiveBorder, "activeBorder");

  inspShowLabel.addEventListener("change", function () {
    if (!selectedId) return;
    config.styles[selectedId].showLabel = inspShowLabel.checked;
    applyStyle(selectedId);
    saveConfig();
  });

  inspBind.addEventListener("click", function () {
    if (!selectedId) return;
    listening = selectedId;
    inspBindingValue.textContent = t("pressKeyOrButton");
    inspBindingValue.classList.add("listening");
  });

  inspClear.addEventListener("click", function () {
    if (!selectedId) return;
    config.bindings[selectedId] = { gamepad: null, key: null };
    saveConfig();
    refreshInspector();
  });

  function completeBinding(id, binding) {
    config.bindings[id] = binding;
    saveConfig();
    listening = null;
    if (selectedId === id) refreshInspector();
  }

  // ---------------------------------------------------------------------
  // Keyboard tracking
  // ---------------------------------------------------------------------
  window.addEventListener("keydown", function (e) {
    heldKeys[e.code] = true;
    if (listening) {
      e.preventDefault();
      completeBinding(listening, { gamepad: null, key: e.code });
    }
  });
  window.addEventListener("keyup", function (e) {
    heldKeys[e.code] = false;
  });

  // ---------------------------------------------------------------------
  // Gamepad tracking
  // ---------------------------------------------------------------------
  var gpConnected = {};

  window.addEventListener("gamepadconnected", function (e) {
    gpConnected[e.gamepad.index] = e.gamepad.id;
    updateGpStatus();
  });
  window.addEventListener("gamepaddisconnected", function (e) {
    delete gpConnected[e.gamepad.index];
    updateGpStatus();
  });

  var gpStatusEl = document.getElementById("gpStatus");
  function updateGpStatus() {
    var ids = Object.keys(gpConnected);
    if (ids.length === 0) {
      gpStatusEl.textContent = t("gpDisconnected");
      gpStatusEl.className = "gp-status gp-status--off";
    } else {
      gpStatusEl.textContent = t("gpConnectedPrefix") + gpConnected[ids[0]];
      gpStatusEl.className = "gp-status gp-status--on";
    }
  }

  function isActive(def) {
    var b = config.bindings[def.id];
    if (!b) return false;
    if (b.key && heldKeys[b.key]) return true;
    if (typeof b.gamepad === "number") {
      var pads = navigator.getGamepads ? navigator.getGamepads() : [];
      for (var i = 0; i < pads.length; i++) {
        var gp = pads[i];
        if (!gp) continue;
        var btn = gp.buttons[b.gamepad];
        if (btn && btn.pressed) return true;
      }
    }
    return false;
  }

  function findAnyGamepadPress() {
    var pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (var i = 0; i < pads.length; i++) {
      var gp = pads[i];
      if (!gp) continue;
      for (var bi = 0; bi < gp.buttons.length; bi++) {
        if (gp.buttons[bi].pressed) return bi;
      }
    }
    return null;
  }

  function tick() {
    if (listening) {
      var bi = findAnyGamepadPress();
      if (bi !== null) completeBinding(listening, { gamepad: bi, key: null });
    } else {
      BUTTON_DEFS.forEach(function (def) {
        var el = elements[def.id].root;
        el.classList.toggle("is-active", isActive(def));
      });
    }
    requestAnimationFrame(tick);
  }

  // ---------------------------------------------------------------------
  // Stage scaling — keeps the reference canvas perfectly proportioned
  // ---------------------------------------------------------------------
  var stageWrap = document.getElementById("stageWrap");
  var stage = document.getElementById("stage");
  function rescale() {
    var availW = stageWrap.clientWidth - 20;
    var availH = window.innerHeight - stageWrap.getBoundingClientRect().top - 20;
    // Previously floored availH at 100px, which meant a short/narrow
    // window (toolbar wrapped to several rows, eating most of the
    // viewport height) could compute a scale bigger than what actually
    // fit, clipping the bottom of the panel. Let it shrink to whatever
    // height is really available instead.
    var scale = Math.min(1, availW / STAGE_W, availH / STAGE_H);
    if (!isFinite(scale) || scale <= 0) scale = 0.1;
    stage.style.transform = "scale(" + scale + ")";
    stageWrap.style.height = (STAGE_H * scale + 20) + "px";
  }
  window.addEventListener("resize", rescale);
  window.addEventListener("load", rescale);

  // ---------------------------------------------------------------------
  // Toolbar
  // ---------------------------------------------------------------------
  var editToggle = document.getElementById("editToggle");
  var bgToggle = document.getElementById("bgToggle");
  var resetStyles = document.getElementById("resetStyles");
  var presetDark = document.getElementById("presetDark");
  var presetStandard = document.getElementById("presetStandard");
  var presetPurple = document.getElementById("presetPurple");
  var exportCfg = document.getElementById("exportCfg");
  var importCfg = document.getElementById("importCfg");
  var importFile = document.getElementById("importFile");
  var langRu = document.getElementById("langRu");
  var langEn = document.getElementById("langEn");

  function applyI18n() {
    document.documentElement.lang = lang;
    Array.prototype.forEach.call(document.querySelectorAll("[data-i18n]"), function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-i18n-title]"), function (el) {
      el.title = t(el.getAttribute("data-i18n-title"));
    });
    langRu.classList.toggle("tb-btn--primary", lang === "ru");
    langEn.classList.toggle("tb-btn--primary", lang === "en");
    updateGpStatus();
    editToggle.textContent = t("editModeLabel") + (editMode ? t("editModeOn") : t("editModeOff"));
    if (listening) inspBindingValue.textContent = t("pressKeyOrButton");
    else if (selectedId) refreshInspector();
  }

  function setLang(next) {
    if (next === lang) return;
    lang = next;
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
    applyI18n();
  }

  langRu.addEventListener("click", function () { setLang("ru"); });
  langEn.addEventListener("click", function () { setLang("en"); });

  function setEditMode(on) {
    editMode = on;
    document.body.classList.toggle("edit-mode", on);
    editToggle.textContent = t("editModeLabel") + (on ? t("editModeOn") : t("editModeOff"));
    if (!on) {
      selectedId = null;
      listening = null;
      inspector.classList.add("inspector--hidden");
      Object.keys(elements).forEach(function (k) { elements[k].root.classList.remove("is-selected"); });
    }
  }

  editToggle.addEventListener("click", function () { setEditMode(!editMode); });

  // Toolbar panel itself is collapsed by default; a small always-visible
  // handle brings it back so the editor controls don't eat into the
  // stage's available height until you actually want them.
  var toolbar = document.getElementById("toolbar");
  var toolbarHandle = document.getElementById("toolbarHandle");
  toolbar.classList.add("toolbar-hidden");
  toolbarHandle.addEventListener("click", function () {
    toolbar.classList.toggle("toolbar-hidden");
    rescale();
  });

  bgToggle.addEventListener("change", function () {
    document.body.classList.toggle("opaque-preview", bgToggle.checked);
  });

  function setCaseTheme(theme) {
    config.theme = theme;
    document.body.dataset.theme = theme;
    refreshTopIcons();
  }

  resetStyles.addEventListener("click", function () {
    if (!confirm(t("confirmResetStyles"))) return;
    BUTTON_DEFS.forEach(function (def) { config.styles[def.id] = defaultStyleFor(def); });
    setCaseTheme("");
    saveConfig();
    applyAllStyles();
    if (selectedId) refreshInspector();
  });

  presetDark.addEventListener("click", function () {
    // idleBorder must be reset here too, not just idleFill/active* — it
    // was previously left untouched, so switching from Standard/Purple
    // (which set per-button idleBorder, e.g. light rings on paddles) back
    // to Dark left those mismatched borders stuck instead of restoring
    // the uniform default ring.
    BUTTON_DEFS.forEach(function (def) {
      var s = config.styles[def.id];
      s.idleFill = "#0c0c0c";
      s.idleBorder = "#3a3b3e";
      s.activeFill = "#0f1a12";
      s.activeBorder = "#1cca27";
    });
    setCaseTheme("");
    saveConfig();
    applyAllStyles();
    if (selectedId) refreshInspector();
  });

  // Colors sampled directly off references/8BitDo-Arcade-Controller-Nintendo-Switch.jpg
  // (grey case, red main-grid buttons, black direction cluster/knobs, unfilled
  // outline paddles, and the top-strip trio of round mode buttons which are
  // NOT case-colored like everything else — green/yellow/blue, matching
  // round_1/btn_xbox/round_2 in our layout — plus off-white L3/R3/SELECT/
  // START, matching fn_star/fn_capture/fn_share/fn_menu) and
  // references/80FG__02.webp + slide4-l.jpg (Transparent Purple Signature
  // Edition — translucent purple case, EVERY button incl. those same
  // top-strip ones uniformly purple-tinted, no per-button color coding).
  presetStandard.addEventListener("click", function () {
    BUTTON_DEFS.forEach(function (def) {
      if (def.kind !== "button" && def.kind !== "fn" && def.kind !== "xbox") return;
      var s = config.styles[def.id];
      if (def.id === "round_1") {
        s.idleFill = "#7df039";
        s.idleBorder = "#2f7a1a";
      } else if (def.id === "btn_xbox") {
        s.idleFill = "#fcf044"; // cap fill CSS-overridden below (pad-xbox ignores --idle-fill)
        s.idleBorder = "#b89b1a";
      } else if (def.id === "round_2") {
        s.idleFill = "#148af2";
        s.idleBorder = "#0f5aa8";
      } else if (def.id === "fn_star" || def.id === "fn_capture" || def.id === "fn_share" || def.id === "fn_menu") {
        // #cbc7c3 (near-identical to the fill) made the edge disappear
        // entirely at real button size — reuse the case's own border tone
        // so the shape stays legible without going back to a hard ring.
        s.idleFill = "#d9d6d3";
        s.idleBorder = "#8f8b87";
      } else if (def.id.indexOf("dir_") === 0) {
        s.idleFill = "#232323";
        s.idleBorder = "#3a3b3e";
      } else if (def.id.indexOf("paddle_") === 0) {
        // The reference photo's paddle outline is dark, close to the
        // panel tone, with just a faint bevel glint on one edge — not
        // the near-white ring #c9cbd0 was (guessed, not sampled).
        s.idleFill = "#232323";
        s.idleBorder = "#4a4a4a";
      } else {
        s.idleFill = "#a83a34";
        s.idleBorder = "#181818";
      }
      s.activeFill = "#3a1210";
      s.activeBorder = "#ff4136";
    });
    setCaseTheme("standard");
    saveConfig();
    applyAllStyles();
    if (selectedId) refreshInspector();
  });

  presetPurple.addEventListener("click", function () {
    BUTTON_DEFS.forEach(function (def) {
      if (def.kind !== "button" && def.kind !== "fn" && def.kind !== "xbox") return;
      var s = config.styles[def.id];
      if (def.kind === "button") {
        // the gameplay buttons (face grid, d-pad, paddles) are translucent
        // plastic on the real Signature Edition — let the dark panel show
        // through instead of a flat opaque fill. round_1/btn_xbox/round_2
        // (kind fn/xbox) stay solid, matching their reference photo look.
        // First pass (0.55 alpha over near-black) blended down to a muted
        // rgb(55,46,72) — much darker than the photo's actual buttons,
        // which stay bright/vivid even where light passes through; raised
        // both the base tone and the alpha to land closer to that.
        s.idleFill = "rgba(130, 102, 178, 0.72)";
        s.idleBorder = "#2f1d45";
        s.activeFill = "rgba(175, 138, 224, 0.82)";
        s.activeBorder = "#c9a6ff";
      } else {
        s.idleFill = "#5c4b7b";
        s.idleBorder = "#2f1d45";
        s.activeFill = "#3a2a5c";
        s.activeBorder = "#c9a6ff";
      }
    });
    setCaseTheme("purple");
    saveConfig();
    applyAllStyles();
    if (selectedId) refreshInspector();
  });

  exportCfg.addEventListener("click", function () {
    var blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "arcade-overlay-config.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  importCfg.addEventListener("click", function () { importFile.click(); });
  importFile.addEventListener("change", function () {
    var file = importFile.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var parsed = JSON.parse(reader.result);
        config = loadConfig(); // ensure defaults present
        if (parsed.bindings) Object.assign(config.bindings, parsed.bindings);
        if (parsed.styles) Object.assign(config.styles, parsed.styles);
        if (parsed.labels) Object.assign(config.labels, parsed.labels);
        setCaseTheme(typeof parsed.theme === "string" ? parsed.theme : "");
        saveConfig();
        applyAllStyles();
        if (selectedId) refreshInspector();
      } catch (err) {
        alert(t("importError") + err.message);
      }
    };
    reader.readAsText(file);
    importFile.value = "";
  });

  document.getElementById("overlayUrl").textContent =
    location.href.split("?")[0].split("/").pop() + "?overlay=1";

  // ---------------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------------
  buildStage();
  setCaseTheme(config.theme || "");
  updateGpStatus();
  rescale();
  requestAnimationFrame(tick);

  if (overlayForced) {
    document.body.classList.add("overlay-mode");
    setEditMode(false);
  } else {
    setEditMode(true);
  }
  applyI18n();
})();
