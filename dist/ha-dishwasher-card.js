// ha-dishwasher-card.js
// Карточка для посудомойки Siemens
// v1.2.2 — Added salt and rinse aid display + power toggle

import { DISHWASHER_TRANSLATIONS } from './i18n/index.js';

// ─── Background presets ──────────────────────────────────────────────────
const DW_BG_PRESETS = [
  { id: 'default', label: 'Default', c1: '#0a1628', c2: '#1a2d4a' },
  { id: 'night', label: 'Night', c1: '#0d0d1a', c2: '#1a0a3a' },
  { id: 'ocean', label: 'Ocean', c1: '#001020', c2: '#0055aa' },
  { id: 'deep_neon', label: '🔵 Neon', c1: '#020b18', c2: '#00d4ff' },
  { id: 'slate', label: 'Slate', c1: '#101820', c2: '#445566' },
  { id: 'custom', label: '✏ Custom', c1: null, c2: null },
];

// ─── Theme colors ──────────────────────────────────────────────────────
const HA_THEMES = {
  dark: {
    bg_card: '#1a1a2e',
    bg_card_alt: '#16213e',
    text_primary: '#ffffff',
    text_secondary: 'rgba(255,255,255,0.7)',
    text_muted: 'rgba(255,255,255,0.4)',
    border: 'rgba(255,255,255,0.06)',
    card_shadow: '0 12px 48px rgba(0,0,0,0.5)',
    overlay: 'rgba(0,0,0,0.3)',
  },
  light: {
    bg_card: '#f0f4f8',
    bg_card_alt: '#e2e8f0',
    text_primary: '#1a202c',
    text_secondary: 'rgba(0,0,0,0.7)',
    text_muted: 'rgba(0,0,0,0.4)',
    border: 'rgba(0,0,0,0.08)',
    card_shadow: '0 12px 48px rgba(0,0,0,0.15)',
    overlay: 'rgba(255,255,255,0.3)',
  }
};

function getHATheme(themeSetting) {
  if (themeSetting === 'dark') return 'dark';
  if (themeSetting === 'light') return 'light';
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return isDark ? 'dark' : 'light';
}

function dwPresetGradient(preset, c1, c2, alpha, haTheme) {
  const a = (alpha || 85) / 100;
  const p = DW_BG_PRESETS.find(x => x.id === preset) || DW_BG_PRESETS[0];
  let g1 = (preset === 'custom' ? c1 : p.c1) || '#0a1628';
  let g2 = (preset === 'custom' ? c2 : p.c2) || '#1a2d4a';
  
  if (preset === 'default') {
    g1 = haTheme === 'light' ? '#dce4ec' : g1;
    g2 = haTheme === 'light' ? '#c8d6e5' : g2;
  }
  
  return `linear-gradient(145deg, ${g1}${Math.round(a*255).toString(16).padStart(2,'0')} 0%, ${g2}${Math.round(a*255).toString(16).padStart(2,'0')} 100%)`;
}

// ─── DEFAULT CONFIG ──────────────────────────────────────────────────────
const DW_DEFAULT_CONFIG = {
  language: 'ru',
  theme: 'auto',
  title: 'Siemens',
  subtitle: 'Посудомоечная машина',
  owner_name: 'Smart Home',
  background_preset: 'default',
  bg_color1: '#0a1628',
  bg_color2: '#1a2d4a',
  bg_alpha: 85,
  bg_blur: 12,

  // Colors
  color_progress: '#4ade80',
  color_accent: '#00d4ff',
  color_text: '#ffffff',
  color_running: '#4ade80',
  color_idle: '#f59e0b',
  color_error: '#ef4444',

  // Display options
  show_greet: true,
  show_status: true,
  show_progress: true,
  show_phase: true,
  show_end_time: true,
  show_consumption: true,
  show_controls: true,

  // Entities
  power_entity: '',
  door_entity: '',
  program_entity: '',
  default_program_entity: '',
  program_phase_entity: '',
  program_progress_entity: '',
  remaining_time_entity: '',
  end_time_entity: '',
  start_count_entity: '',
  water_forecast_entity: '',
  energy_forecast_entity: '',
  salt_entity: '',
  rinse_aid_entity: '',
  water_pressure_entity: '',
  aquastop_entity: '',
  sound_level_entity: '',
  remote_control_entity: '',
  start_button_entity: '',
  abort_button_entity: '',
  variospeed_entity: '',
  half_load_entity: '',
  silence_entity: '',
  speed_entity: '',
};

// ─── CSS ──────────────────────────────────────────────────────────────────
function getDWCSS(haTheme) {
  const theme = HA_THEMES[haTheme] || HA_THEMES.dark;
  return `
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :host{display:block;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif}
    .card{background:${dwPresetGradient('default')};border-radius:24px;border:1px solid ${theme.border};
      overflow:hidden;position:relative;box-shadow:${theme.card_shadow},inset 0 1px 0 rgba(255,255,255,0.04)}
    .card::before{content:'';position:absolute;inset:0;pointer-events:none;
      background:radial-gradient(ellipse at 70% 30%,rgba(0,150,255,0.04),transparent 60%)}
    .inner{position:relative;z-index:1;padding:18px 18px 14px}

    /* ── Header ── */
    .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;flex-wrap:wrap;gap:6px}
    .header-left{display:flex;flex-direction:column;gap:2px}
    .header-title{font-size:20px;font-weight:700;color:${theme.text_primary};letter-spacing:-0.3px}
    .header-sub{font-size:11px;color:${theme.text_muted};font-weight:400}
    .header-right{display:flex;flex-direction:column;align-items:flex-end;gap:4px}
    .header-greet{font-size:12px;color:${theme.text_secondary}}
    .header-status{display:flex;align-items:center;gap:6px;padding:4px 12px;border-radius:20px;
      background:${haTheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
      border:1px solid ${theme.border};
      font-size:11px;font-weight:600;color:${theme.text_secondary};cursor:pointer;
      transition:all 0.2s}
    .header-status:hover{background:${haTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}}
    .header-status .dot{width:6px;height:6px;border-radius:50%;display:inline-block}
    .dot.green{background:var(--cv-running,#4ade80);animation:pulse 2s ease-in-out infinite}
    .dot.orange{background:var(--cv-idle,#f59e0b);animation:pulse 1.5s ease-in-out infinite}
    .dot.red{background:var(--cv-error,#ef4444);animation:pulse 0.8s ease-in-out infinite}
    .dot.off{background:#6b7280}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}

    /* ── Main Grid ── */
    .main-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px}
    @media(max-width:450px){.main-grid{grid-template-columns:1fr}}

    /* ── Progress Circle ── */
    .progress-wrap{position:relative;display:flex;align-items:center;justify-content:center;padding:4px}
    .progress-circle{width:100%;max-width:140px;aspect-ratio:1;display:block}
    .progress-circle .bg{fill:none;stroke:${haTheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'};stroke-width:10}
    .progress-circle .fg{fill:none;stroke:var(--cv-progress,#4ade80);stroke-width:10;stroke-linecap:round;transition:stroke-dashoffset 0.5s ease,stroke 0.5s ease}
    .progress-center{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;pointer-events:none}
    .progress-center .pct{font-size:28px;font-weight:700;color:${theme.text_primary};line-height:1}
    .progress-center .lbl{font-size:9px;color:${theme.text_muted};text-transform:uppercase;letter-spacing:0.5px}

    /* ── Info Cards ── */
    .info-card{background:${haTheme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'};
      border-radius:12px;padding:10px 12px;border:1px solid ${theme.border}}
    .info-card .label{font-size:9px;text-transform:uppercase;letter-spacing:0.3px;color:${theme.text_muted};margin-bottom:2px}
    .info-card .value{font-size:16px;font-weight:600;color:${theme.text_primary}}
    .info-card .value.small{font-size:13px}
    .info-card .value.warning{color:#f59e0b}
    .info-card .value.danger{color:#ef4444}
    .info-card .sub{font-size:10px;color:${theme.text_muted};margin-top:2px}

    /* ─── Stats Grid ── */
    .stats-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px}
    @media(max-width:450px){.stats-grid{grid-template-columns:1fr}}
    .stats-grid .info-card{text-align:center}
    .stats-grid .info-card .label{text-align:center}
    .stats-grid .info-card .value{text-align:center}

    /* ── Status Bar ── */
    .status-bar{display:flex;justify-content:space-between;align-items:center;
      padding:8px 12px;background:${haTheme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'};
      border-radius:10px;border:1px solid ${theme.border};flex-wrap:wrap;gap:4px;margin-bottom:8px}
    .status-left{display:flex;align-items:center;gap:8px;font-size:11px;color:${theme.text_muted}}
    .status-left .phase{font-weight:600;color:${theme.text_secondary}}
    .status-right{display:flex;gap:12px;font-size:10px;color:${theme.text_muted}}

    /* ── Controls Grid ── */
    .controls-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:4px;margin-bottom:8px}
    @media(max-width:500px){.controls-grid{grid-template-columns:repeat(3,1fr)}}
    .control-btn{background:${haTheme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'};
      border:1px solid ${theme.border};border-radius:8px;padding:6px 4px;cursor:pointer;
      transition:all 0.2s;display:flex;flex-direction:column;align-items:center;
      justify-content:center;gap:2px;font-family:inherit;color:${theme.text_muted};
      font-size:8px;font-weight:600}
    .control-btn:hover{background:${haTheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'};
      border-color:${haTheme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}}
    .control-btn .ico{font-size:18px;line-height:1.2}
    .control-btn.active{border-color:var(--cv-accent,#00d4ff);
      background:${haTheme === 'dark' ? 'rgba(0,212,255,0.06)' : 'rgba(0,212,255,0.08)'}}
    .control-btn.active .ico{color:var(--cv-accent,#00d4ff)}
    .control-btn.on{color:${theme.text_secondary}}
    .control-btn.on .ico{color:#4ade80}

    /* ── Footer ── */
    .footer{display:none}
  `;
}

// ─── MAIN CARD ────────────────────────────────────────────────────────────
class DishwasherCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = { ...DW_DEFAULT_CONFIG };
    this._hass = null;
    this._initialized = false;
    this._interval = null;
    this._haTheme = 'dark';
  }

  static getConfigElement() {
    return document.createElement('dishwasher-card-editor');
  }

  static getStubConfig() {
    return {
      ...DW_DEFAULT_CONFIG,
      power_entity: 'switch.siemens_dishwasher_power',
      door_entity: 'binary_sensor.siemens_dishwasher_door',
      program_entity: 'select.siemens_dishwasher_selected_program',
      default_program_entity: 'select.siemens_dishwasher_default_program',
      program_phase_entity: 'sensor.siemens_dishwasher_program_phase',
      program_progress_entity: 'sensor.siemens_dishwasher_program_progress',
      remaining_time_entity: 'sensor.siemens_dishwasher_remaining_program_time',
      end_time_entity: 'sensor.posuda_time_end',
      start_count_entity: 'sensor.siemens_dishwasher_start_count',
      water_forecast_entity: 'sensor.siemens_dishwasher_water_forecast',
      energy_forecast_entity: 'sensor.siemens_dishwasher_energy_forecast',
      salt_entity: 'sensor.siemens_dishwasher_salt',
      rinse_aid_entity: 'sensor.siemens_dishwasher_rinse_aid',
      water_pressure_entity: 'binary_sensor.siemens_dishwasher_low_water_pressure',
      aquastop_entity: 'binary_sensor.siemens_dishwasher_aquastop_occurred',
      sound_level_entity: 'select.siemens_dishwasher_sound_level_signal',
      remote_control_entity: 'select.siemens_dishwasher_remote_control',
      start_button_entity: 'button.siemens_dishwasher_start',
      abort_button_entity: 'button.siemens_dishwasher_abort',
      variospeed_entity: 'switch.siemens_dishwasher_variospeedplus',
      half_load_entity: 'switch.siemens_dishwasher_half_load',
      silence_entity: 'switch.siemens_dishwasher_silence_on_demand',
      speed_entity: 'switch.siemens_dishwasher_speed_on_demand',
    };
  }

  getCardSize() { return 8; }

  get t() {
    return DISHWASHER_TRANSLATIONS[this._config.language || 'ru'] || DISHWASHER_TRANSLATIONS.ru;
  }

  _getHATheme() {
    return getHATheme(this._config.theme || 'auto');
  }

  setConfig(config) {
    this._config = { ...DW_DEFAULT_CONFIG, ...config };
    this._haTheme = this._getHATheme();
    this._initialized = false;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._haTheme = this._getHATheme();
    if (!this._initialized) {
      this._render();
    } else {
      this._update();
    }
  }

  connectedCallback() {
    this._interval = setInterval(() => this._update(), 30000);
    this._mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this._mediaQuery.addEventListener('change', () => {
      if (this._config.theme === 'auto') {
        this._haTheme = this._getHATheme();
        this._update();
      }
    });
  }

  disconnectedCallback() {
    if (this._interval) { clearInterval(this._interval); this._interval = null; }
    if (this._mediaQuery) {
      this._mediaQuery.removeEventListener('change', () => {});
    }
  }

  // ─── Entity helpers ──────────────────────────────────────────────────
  _state(entityId) {
    if (!entityId || !this._hass?.states) return null;
    return this._hass.states[entityId];
  }

  _getValue(entityId) {
    const s = this._state(entityId);
    if (!s || s.state === 'unavailable' || s.state === 'unknown') return null;
    const v = parseFloat(s.state);
    return isNaN(v) ? null : v;
  }

  _getState(entityId) {
    const s = this._state(entityId);
    return s ? s.state : null;
  }

  _isOn(entityId) {
    const s = this._state(entityId);
    return s ? s.state === 'on' : false;
  }

  _isBinaryOn(entityId) {
    const s = this._state(entityId);
    return s ? s.state === 'on' : false;
  }

  _getSaltRinseLabel(state) {
    if (!state) return '—';
    const t = this.t;
    const lower = state.toLowerCase();
    if (lower === 'full') return t.saltRinse?.full || '✅ Полная';
    if (lower === 'nearly_empty') return t.saltRinse?.nearly || '⚠️ Почти пусто';
    if (lower === 'empty') return t.saltRinse?.empty || '✘ Пусто';
    return state;
  }

  _getSaltRinseClass(state) {
    if (!state) return '';
    const lower = state.toLowerCase();
    if (lower === 'empty') return 'danger';
    if (lower === 'nearly_empty') return 'warning';
    return '';
  }

  _getProgramLabel(program) {
    if (!program) return '—';
    const t = this.t;
    
    if (t.programs && t.programs[program]) {
      return t.programs[program];
    }
    
    const lowerProgram = program.toLowerCase().trim();
    if (t.programs) {
      for (const [key, value] of Object.entries(t.programs)) {
        if (lowerProgram === key.toLowerCase()) {
          return value;
        }
      }
      for (const [key, value] of Object.entries(t.programs)) {
        if (lowerProgram.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerProgram)) {
          return value;
        }
      }
    }
    
    return program;
  }

  _getPhaseLabel(phase) {
    if (!phase) return '—';
    const t = this.t;
    const lowerPhase = phase.toLowerCase().trim();
    
    if (t.phases && t.phases[lowerPhase]) {
      return t.phases[lowerPhase];
    }
    
    const normalized = lowerPhase.replace(/[\s_]/g, '');
    if (t.phases) {
      for (const [key, value] of Object.entries(t.phases)) {
        const keyNormalized = key.toLowerCase().replace(/[\s_]/g, '');
        if (normalized === keyNormalized) {
          return value;
        }
      }
    }
    
    if (t.phases) {
      for (const [key, value] of Object.entries(t.phases)) {
        if (lowerPhase.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerPhase)) {
          return value;
        }
      }
    }
    
    return phase.charAt(0).toUpperCase() + phase.slice(1);
  }

  _formatTime(value) {
    if (!value || value <= 0) return '0 мин';
    
    const entityId = this._config.remaining_time_entity;
    const state = this._state(entityId);
    const unit = state?.attributes?.unit_of_measurement || 'h';
    
    let minutes = 0;
    const unitLower = (unit || '').toLowerCase();
    
    if (['h', 'hours', 'hour', 'час', 'ч'].includes(unitLower)) {
      minutes = Math.round(value * 60);
    } else if (['min', 'minutes', 'minute', 'мин'].includes(unitLower)) {
      minutes = Math.round(value);
    } else if (['s', 'seconds', 'second', 'сек', 'с'].includes(unitLower)) {
      minutes = Math.round(value / 60);
    } else {
      minutes = Math.round(value * 60);
    }
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0 && mins > 0) {
      return `${hours} ч ${mins} мин`;
    } else if (hours > 0) {
      return `${hours} ч`;
    } else {
      return `${mins} мин`;
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────
  _render() {
    if (!this._hass) {
      return;
    }

    const cfg = this._config;
    const t = this.t;
    const haTheme = this._haTheme;
    const themeColors = HA_THEMES[haTheme] || HA_THEMES.dark;

    const progressColor = cfg.color_progress || '#4ade80';
    const accent = cfg.color_accent || '#00d4ff';
    const textColor = cfg.color_text || (haTheme === 'dark' ? '#ffffff' : '#1a202c');
    const runningColor = cfg.color_running || '#4ade80';
    const idleColor = cfg.color_idle || '#f59e0b';
    const errorColor = cfg.color_error || '#ef4444';

    const bgGrad = dwPresetGradient(cfg.background_preset, cfg.bg_color1, cfg.bg_color2, cfg.bg_alpha, haTheme);

    // ─── Read entities ──────────────────────────────────────────────
    const isPowered = this._isOn(cfg.power_entity);
    const isDoorOpen = this._isBinaryOn(cfg.door_entity);
    const program = this._getState(cfg.program_entity);
    const phase = this._getState(cfg.program_phase_entity);
    const progress = this._getValue(cfg.program_progress_entity) || 0;
    const remainingTime = this._getValue(cfg.remaining_time_entity);
    const endTime = this._getState(cfg.end_time_entity);
    const startCount = this._getValue(cfg.start_count_entity);
    const waterForecast = this._getValue(cfg.water_forecast_entity);
    const energyForecast = this._getValue(cfg.energy_forecast_entity);
    const salt = this._getState(cfg.salt_entity);
    const rinseAid = this._getState(cfg.rinse_aid_entity);
    const waterPressure = this._isBinaryOn(cfg.water_pressure_entity);
    const aquastop = this._isBinaryOn(cfg.aquastop_entity);

    // ─── Controls ──────────────────────────────────────────────────
    const isVarioSpeed = this._isOn(cfg.variospeed_entity);
    const isHalfLoad = this._isOn(cfg.half_load_entity);
    const isSilence = this._isOn(cfg.silence_entity);
    const isSpeed = this._isOn(cfg.speed_entity);

    // ─── Status ──────────────────────────────────────────────────────
    let statusText = t.status.idle;
    let statusDot = 'off';
    let statusColor = '#6b7280';
    if (!isPowered) { statusText = t.status.offline; statusDot = 'off'; statusColor = '#6b7280'; }
    else if (isDoorOpen) { statusText = t.status.doorOpen; statusDot = 'orange'; statusColor = idleColor; }
    else if (progress > 0 && progress < 100) { statusText = t.status.running; statusDot = 'green'; statusColor = runningColor; }
    else if (progress >= 100) { statusText = t.status.done; statusDot = 'green'; statusColor = runningColor; }
    else { statusText = t.status.idle; statusDot = 'orange'; statusColor = idleColor; }

    // ─── Progress circle ─────────────────────────────────────────────
    const circumference = 2 * Math.PI * 40;
    const offset = circumference * (1 - Math.min(100, Math.max(0, progress)) / 100);

    // ─── Custom CSS ──────────────────────────────────────────────────
    const customCss = `
      --cv-progress: ${progressColor};
      --cv-accent: ${accent};
      --cv-text: ${textColor};
      --cv-running: ${runningColor};
      --cv-idle: ${idleColor};
      --cv-error: ${errorColor};
      background: ${bgGrad};
      backdrop-filter: blur(${cfg.bg_blur || 12}px);
      -webkit-backdrop-filter: blur(${cfg.bg_blur || 12}px);
    `;

    // ─── Build stats grid (salt, rinse) ──────────────────────────────────
    const saltLabel = this._getSaltRinseLabel(salt);
    const saltClass = this._getSaltRinseClass(salt);
    const rinseLabel = this._getSaltRinseLabel(rinseAid);
    const rinseClass = this._getSaltRinseClass(rinseAid);

    const statsHtml = `
      <div class="stats-grid">
        ${salt !== null ? `
          <div class="info-card">
            <div class="label">🧂 ${t.labels.salt || 'Соль'}</div>
            <div class="value small ${saltClass}">${saltLabel}</div>
          </div>
        ` : ''}
        ${rinseAid !== null ? `
          <div class="info-card">
            <div class="label">✨ ${t.labels.rinseAid || 'Ополаскиватель'}</div>
            <div class="value small ${rinseClass}">${rinseLabel}</div>
          </div>
        ` : ''}
      </div>
    `;

    // ─── Build HTML ──────────────────────────────────────────────────
    const controlsHtml = cfg.show_controls !== false ? `
      <div class="controls-grid">
        <button class="control-btn" id="btn-start" title="${t.edStart}">
          <span class="ico">▶️</span>
          <span>${t.edStart}</span>
        </button>
        <button class="control-btn" id="btn-abort" title="${t.edAbort}">
          <span class="ico">⏹️</span>
          <span>${t.edAbort}</span>
        </button>
        <button class="control-btn${isVarioSpeed ? ' on' : ''}" id="btn-variospeed" title="${t.edVarioSpeed}">
          <span class="ico">⚡</span>
          <span>Vario</span>
        </button>
        <button class="control-btn${isHalfLoad ? ' on' : ''}" id="btn-half-load" title="${t.edHalfLoad}">
          <span class="ico">📦</span>
          <span>1/2</span>
        </button>
        <button class="control-btn${isSilence ? ' on' : ''}" id="btn-silence" title="${t.edSilence}">
          <span class="ico">🔇</span>
          <span>${t.edSilence}</span>
        </button>
        <button class="control-btn${isSpeed ? ' on' : ''}" id="btn-speed" title="${t.edSpeed}">
          <span class="ico">⚡</span>
          <span>${t.edSpeed}</span>
        </button>
      </div>
    ` : '';

    // ─── Info cards ──────────────────────────────────────────────────
    const infoHtml = `
      <div class="main-grid">
        <div class="progress-wrap">
          <svg class="progress-circle" viewBox="0 0 100 100">
            <circle class="bg" cx="50" cy="50" r="40"/>
            <circle class="fg" cx="50" cy="50" r="40"
              stroke-dasharray="${circumference}"
              stroke-dashoffset="${offset}"/>
          </svg>
          <div class="progress-center">
            <div class="pct">${Math.round(progress)}%</div>
            <div class="lbl">${t.labels.progress}</div>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:6px;">
          ${cfg.show_phase !== false && phase ? `
            <div class="info-card">
              <div class="label">${t.labels.phase}</div>
              <div class="value small">${this._getPhaseLabel(phase)}</div>
            </div>
          ` : ''}
          ${cfg.show_end_time !== false && endTime ? `
            <div class="info-card">
              <div class="label">${t.labels.endTime}</div>
              <div class="value small" style="color:${progress > 0 ? runningColor : themeColors.text_muted}">${endTime}</div>
            </div>
          ` : ''}
          <div class="info-card">
            <div class="label">${t.labels.program}</div>
            <div class="value small">${this._getProgramLabel(program)}</div>
          </div>
        </div>
      </div>

      ${statsHtml}

      ${cfg.show_consumption !== false ? `
        <div class="main-grid" style="margin-top:-2px;">
          ${waterForecast !== null ? `
            <div class="info-card">
              <div class="label">💧 ${t.labels.water}</div>
              <div class="value small">${waterForecast.toFixed(0)}%</div>
            </div>
          ` : ''}
          ${energyForecast !== null ? `
            <div class="info-card">
              <div class="label">⚡ ${t.labels.energy}</div>
              <div class="value small">${energyForecast.toFixed(0)}%</div>
            </div>
          ` : ''}
        </div>
      ` : ''}

      ${cfg.show_status !== false ? `
        <div class="status-bar">
          <div class="status-left">
            <span class="dot ${statusDot}"></span>
            <span>${statusText}</span>
            ${isDoorOpen ? `<span style="color:${errorColor};font-weight:600;">🚪</span>` : ''}
            ${waterPressure ? `<span style="color:${errorColor};font-weight:600;">💦</span>` : ''}
            ${aquastop ? `<span style="color:${errorColor};font-weight:600;">🚨 AquaStop</span>` : ''}
          </div>
          <div class="status-right">
            ${remainingTime !== null && progress > 0 ? `<span>⏱️ ${this._formatTime(remainingTime)}</span>` : ''}
            ${startCount !== null ? `<span>🔢 ${Math.round(startCount)}</span>` : ''}
          </div>
        </div>
      ` : ''}

      ${controlsHtml}
    `;

    const html = `
      <style>${getDWCSS(haTheme)}</style>
      <div class="card" style="${customCss}">
        <div class="inner">
          <!-- Header -->
          <div class="header">
            <div class="header-left">
              <div class="header-title">${cfg.title || t.cardTitle}</div>
              <div class="header-sub">${cfg.subtitle || t.cardSub}</div>
            </div>
            <div class="header-right">
              ${cfg.show_greet !== false ? `<div class="header-greet">${t.greet()} ${cfg.owner_name || 'Smart Home'}</div>` : ''}
              ${cfg.show_status !== false ? `
                <div class="header-status" id="btn-power" style="color:${statusColor};">
                  <span class="dot ${statusDot}"></span>
                  ${statusText}
                </div>
              ` : ''}
            </div>
          </div>

          ${infoHtml}
        </div>
      </div>
    `;

    let container = this.shadowRoot.querySelector('#dw-root');
    if (!container) {
      container = document.createElement('div');
      container.id = 'dw-root';
      this.shadowRoot.appendChild(container);
    }
    container.innerHTML = html;

    this._initialized = true;
    this._bindEvents();
  }

  _update() {
    if (!this._initialized || !this._hass) return;
    this._haTheme = this._getHATheme();
    this._render();
  }

  _bindEvents() {
    const sr = this.shadowRoot;
    const cfg = this._config;

    // Power toggle
    const powerBtn = sr?.querySelector('#btn-power');
    if (powerBtn && cfg.power_entity) {
      powerBtn.addEventListener('click', () => {
        if (!this._hass) return;
        const entityId = cfg.power_entity;
        const domain = entityId.split('.')[0];
        const isOn = this._isOn(entityId);
        this._hass.callService(domain, isOn ? 'turn_off' : 'turn_on', { entity_id: entityId });
      });
    }

    const bindBtn = (id, service, entityKey, serviceName) => {
      const btn = sr?.querySelector('#' + id);
      if (btn) {
        btn.addEventListener('click', () => {
          const entityId = cfg[entityKey];
          if (!entityId || !this._hass) return;
          const domain = entityId.split('.')[0];
          this._hass.callService(domain, serviceName || 'toggle', { entity_id: entityId });
          btn.classList.toggle('on');
        });
      }
    };

    bindBtn('btn-start', 'press', 'start_button_entity', 'press');
    bindBtn('btn-abort', 'press', 'abort_button_entity', 'press');
    bindBtn('btn-variospeed', 'toggle', 'variospeed_entity');
    bindBtn('btn-half-load', 'toggle', 'half_load_entity');
    bindBtn('btn-silence', 'toggle', 'silence_entity');
    bindBtn('btn-speed', 'toggle', 'speed_entity');
  }
}

// ─── EDITOR ──────────────────────────────────────────────────────────────
class DishwasherCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = { ...DW_DEFAULT_CONFIG };
    this._hass = null;
    this._open = { lang: true, title: true, entities: true, colors: false, bg: true, display: false };
    this._picker = null;
  }

  setConfig(config) {
    this._config = { ...DW_DEFAULT_CONFIG, ...config };
    this._render();
  }

  set hass(h) {
    this._hass = h;
    this._syncPickers();
  }

  get t() {
    return DISHWASHER_TRANSLATIONS[this._config.language || 'ru'] || DISHWASHER_TRANSLATIONS.ru;
  }

  _fire() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    }));
  }

  _syncPickers() {
    if (!this._hass || !this.shadowRoot) return;
    const apply = () => {
      this.shadowRoot.querySelectorAll('ha-entity-picker').forEach(p => {
        p.hass = this._hass;
        const domain = p.dataset.domain;
        if (domain) p.includeDomains = domain.split(',');
        const key = p.dataset.key;
        const saved = this._config[key] || '';
        if (saved && p.value !== saved) {
          p.value = saved;
          p.setAttribute('value', saved);
        }
      });
    };
    apply();
    requestAnimationFrame(() => requestAnimationFrame(apply));
  }

  _toggleSection(id) {
    this._open[id] = !this._open[id];
    const body = this.shadowRoot.getElementById('body-' + id);
    const arrow = this.shadowRoot.getElementById('arrow-' + id);
    if (body) {
      body.style.display = this._open[id] ? 'block' : 'none';
      if (arrow) arrow.textContent = this._open[id] ? '▾' : '▸';
      if (this._open[id]) this._syncPickers();
    }
  }

  _colorRow(key, label) {
    const value = this._config[key] || '#ffffff';
    const isOpen = this._picker === key;
    const swatches = ['#4ade80', '#f59e0b', '#ef4444', '#3b82f6', '#00d4ff', '#a78bfa', '#ffffff', '#94a3b8'];
    return `
      <div class="ci">
        <div class="ci-hdr" data-cp="${key}">
          <div class="ci-swatch" style="background:${value};"></div>
          <span class="ci-label">${label}</span>
          <code class="ci-code">${value}</code>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" class="ci-chv">
            <path d="${isOpen ? 'M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6z' : 'M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z'}"/>
          </svg>
        </div>
        ${isOpen ? `
          <div class="ci-body">
            <input type="color" data-cp-native="${key}" value="${value}" class="ci-native"/>
            <div class="ci-hex-wrap">
              <span class="ci-hash">#</span>
              <input type="text" data-cp-hex="${key}" value="${value.replace('#','')}" maxlength="6" placeholder="rrggbb" class="ci-hex-inp"/>
            </div>
            <div class="ci-swatches">
              ${swatches.map(c => `<div data-cp-dot="${key}" data-color="${c}" class="ci-dot"
                style="background:${c};outline:${value === c ? '2px solid var(--primary-color)' : '2px solid transparent'};"></div>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  _entityField(key, label, domain) {
    return `
      <div class="row">
        <label>${label}</label>
        <ha-entity-picker data-key="${key}" data-domain="${domain}" allow-custom-entity></ha-entity-picker>
      </div>
    `;
  }

  _toggleSwitch(key, label, desc) {
    const checked = this._config[key] !== false;
    return `
      <div class="disp-row">
        <div class="disp-info">
          <div class="disp-label">${label}</div>
          ${desc ? `<div class="disp-desc">${desc}</div>` : ''}
        </div>
        <label class="tog-wrap">
          <input type="checkbox" class="disp-tog" data-key="${key}" ${checked ? 'checked' : ''}>
          <span class="tog-slider"></span>
        </label>
      </div>
    `;
  }

  _render() {
    const cfg = this._config;
    const t = this.t;
    const lang = cfg.language || 'ru';
    const bgP = cfg.background_preset || 'default';
    const theme = cfg.theme || 'auto';

    // Добавляем недостающие переводы
    if (!t.labels) t.labels = {};
    if (!t.labels.salt) t.labels.salt = 'Соль';
    if (!t.labels.rinseAid) t.labels.rinseAid = 'Ополаскиватель';
    if (!t.edSalt) t.edSalt = 'Соль (enum)';
    if (!t.edRinseAid) t.edRinseAid = 'Ополаскиватель (enum)';

    this.shadowRoot.innerHTML = `
      <style>
        :host { display:block; font-family:var(--primary-font-family,'Inter',sans-serif); }
        .editor { background:var(--card-background-color,#fff); color:var(--primary-text-color); }
        .credit {
          display:flex;align-items:center;gap:8px;padding:12px 16px 8px;
          font-size:12px;color:var(--primary-color);font-weight:500;
          border-bottom:1px solid var(--divider-color);
        }
        .acc-wrap { border-bottom:1px solid var(--divider-color); }
        .acc-head {
          display:flex;align-items:center;gap:10px;padding:14px 16px;cursor:pointer;
          user-select:none;font-size:14px;font-weight:500;color:var(--primary-text-color);
          background:var(--secondary-background-color);
        }
        .acc-head:hover { filter:brightness(.96); }
        .acc-head ha-icon { color:var(--secondary-text-color);--mdi-icon-size:18px; }
        .acc-arrow { margin-left:auto;font-size:14px;color:var(--secondary-text-color); }
        .acc-body { padding:12px 14px;border-top:1px solid var(--divider-color);background:var(--card-background-color,#fff); }
        .row { display:flex;flex-direction:column;margin-bottom:12px; }
        .row:last-child { margin-bottom:0; }
        .row label { font-size:12px;color:var(--secondary-text-color);margin-bottom:4px;font-weight:600; }
        ha-entity-picker { display:block;width:100%; }
        .lang-grid { display:flex;flex-wrap:wrap;gap:6px; }
        .lang-btn {
          display:flex;align-items:center;gap:5px;padding:7px 10px;border-radius:8px;
          border:1.5px solid var(--divider-color);background:var(--secondary-background-color);
          cursor:pointer;font-size:12px;color:var(--primary-text-color);transition:all .2s;
        }
        .lang-btn.on { border-color:var(--primary-color);background:rgba(3,169,244,.12);color:var(--primary-color);font-weight:700; }
        .txt-inp {
          background:var(--input-fill-color,rgba(0,0,0,.04));border:1px solid var(--divider-color);
          border-radius:8px;padding:8px 12px;font-size:13px;color:var(--primary-text-color);
          width:100%;box-sizing:border-box;font-family:inherit;
        }
        .txt-inp:focus { outline:none;border-color:var(--primary-color); }
        .bg-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-bottom:10px; }
        .bgs {
          border-radius:7px;height:38px;cursor:pointer;border:2px solid transparent;
          display:flex;align-items:flex-end;padding:3px 5px;font-size:9px;
          color:rgba(255,255,255,.85);text-shadow:0 1px 3px rgba(0,0,0,.9);
          transition:border-color .15s;white-space:nowrap;overflow:hidden;
        }
        .bgs.on { border-color:var(--primary-color); }
        .sl-row { display:flex;align-items:center;gap:10px;margin-top:8px; }
        .sl-row label { font-size:12px;font-weight:600;color:var(--secondary-text-color);min-width:80px; }
        .sl-row input[type=range] { flex:1;accent-color:var(--primary-color);height:4px;cursor:pointer; }
        .slv { font-size:12px;font-weight:700;color:var(--primary-color);min-width:36px;text-align:right; }
        .ci { border:1px solid var(--divider-color);border-radius:8px;overflow:hidden;margin-bottom:8px; }
        .ci:last-child { margin-bottom:0; }
        .ci-hdr { display:flex;align-items:center;gap:10px;padding:10px 12px;cursor:pointer;background:var(--card-background-color,#fff); }
        .ci-swatch { width:24px;height:24px;border-radius:4px;border:1px solid rgba(0,0,0,.1);flex-shrink:0; }
        .ci-label { font-size:13px;flex:1;color:var(--primary-text-color); }
        .ci-code { font-size:11px;color:var(--secondary-text-color);font-family:monospace;background:var(--secondary-background-color);padding:2px 6px;border-radius:3px; }
        .ci-chv { color:var(--secondary-text-color);flex-shrink:0; }
        .ci-body { padding:12px 14px;background:var(--secondary-background-color);border-top:1px solid var(--divider-color);display:flex;flex-direction:column;gap:10px; }
        .ci-native { width:100%;height:44px;border:1px solid var(--divider-color);border-radius:6px;cursor:pointer;padding:2px;background:transparent; }
        .ci-hex-wrap { display:flex;align-items:center;gap:6px;border:1px solid var(--divider-color);border-radius:4px;padding:6px 10px;background:var(--card-background-color,#fff); }
        .ci-hash { color:var(--secondary-text-color);font-size:12px;font-family:monospace; }
        .ci-hex-inp { border:none;outline:none;width:100%;font-size:14px;color:var(--primary-text-color);font-family:monospace;background:transparent; }
        .ci-swatches { display:flex;gap:6px;flex-wrap:wrap; }
        .ci-dot { width:24px;height:24px;border-radius:50%;cursor:pointer;transition:transform .1s;outline-offset:2px; }
        .ci-dot:hover { transform:scale(1.15); }
        .disp-row { display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--divider-color); }
        .disp-row:last-child { border-bottom:none; }
        .disp-info { flex:1;min-width:0; }
        .disp-label { font-size:13px;font-weight:500;color:var(--primary-text-color); }
        .disp-desc { font-size:11px;color:var(--secondary-text-color);margin-top:2px; }
        .tog-wrap { position:relative;width:40px;height:22px;flex-shrink:0;cursor:pointer; }
        .tog-wrap input { opacity:0;width:0;height:0;position:absolute; }
        .tog-slider { position:absolute;inset:0;border-radius:11px;background:var(--divider-color);transition:background .25s; }
        .tog-slider:before { content:'';position:absolute;width:16px;height:16px;border-radius:50%;left:3px;top:3px;background:#fff;transition:transform .25s;box-shadow:0 1px 3px rgba(0,0,0,.3); }
        .tog-wrap input:checked + .tog-slider { background:var(--primary-color); }
        .tog-wrap input:checked + .tog-slider:before { transform:translateX(18px); }
        .reset-btn {
          width:100%;padding:8px;border-radius:7px;border:1px solid var(--divider-color);
          background:transparent;color:var(--secondary-text-color);font-size:12px;
          cursor:pointer;font-family:inherit;margin-top:10px;
        }
        .reset-btn:hover { background:var(--secondary-background-color); }
        .theme-grid { display:flex;gap:8px;margin-bottom:12px; }
        .theme-btn {
          flex:1;padding:10px;border-radius:10px;border:2px solid var(--divider-color);
          cursor:pointer;text-align:center;font-size:13px;font-weight:500;
          background:var(--secondary-background-color);color:var(--primary-text-color);
          transition:all .2s;font-family:inherit;
        }
        .theme-btn.on { border-color:var(--primary-color);background:rgba(3,169,244,.08);color:var(--primary-color); }
        .theme-btn .sub { font-size:10px;font-weight:400;color:var(--secondary-text-color);display:block;margin-top:2px; }
        .theme-btn.on .sub { color:var(--primary-color);opacity:0.7; }
      </style>

      <div class="editor">
        <div class="credit">🍽️ <strong>Dishwasher Card</strong>
          <span style="color:var(--secondary-text-color);font-weight:400;">v1.2.2 — Salt & Rinse aid + Power toggle</span>
        </div>

        <!-- Language -->
        <div class="acc-wrap">
          <div class="acc-head" id="head-lang">
            <ha-icon icon="mdi:translate"></ha-icon> ${t.edLang}
            <span class="acc-arrow" id="arrow-lang">${this._open.lang ? '▾' : '▸'}</span>
          </div>
          <div class="acc-body" id="body-lang" style="display:${this._open.lang ? 'block' : 'none'}">
            <div class="lang-grid">
              ${Object.entries(DISHWASHER_TRANSLATIONS).map(([code, tr]) => `
                <div class="lang-btn ${lang === code ? 'on' : ''}" data-lang="${code}">
                  <img src="https://flagcdn.com/20x15/${tr.flag}.png" width="20" height="15" alt="${tr.lang}" style="border-radius:2px;flex-shrink:0;display:block;">
                  ${tr.lang}
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Title & Theme -->
        <div class="acc-wrap">
          <div class="acc-head" id="head-title">
            <ha-icon icon="mdi:card-text"></ha-icon> ${t.edTitle}
            <span class="acc-arrow" id="arrow-title">${this._open.title ? '▾' : '▸'}</span>
          </div>
          <div class="acc-body" id="body-title" style="display:${this._open.title ? 'block' : 'none'}">
            <div class="row">
              <label>${t.edTitleLabel}</label>
              <input class="txt-inp" type="text" id="inp-title" value="${cfg.title || ''}" placeholder="${t.cardTitle}"/>
            </div>
            <div class="row">
              <label>${t.edSubtitleLabel}</label>
              <input class="txt-inp" type="text" id="inp-subtitle" value="${cfg.subtitle || ''}" placeholder="${t.cardSub}"/>
            </div>
            <div class="row">
              <label>${t.edOwnerName}</label>
              <input class="txt-inp" type="text" id="inp-owner" value="${cfg.owner_name || ''}" placeholder="Smart Home"/>
            </div>
            <div style="height:1px;background:var(--divider-color);margin:8px 0;"></div>
            
            <label style="font-size:12px;font-weight:600;color:var(--secondary-text-color);margin-bottom:6px;display:block;">${t.edTheme}</label>
            <div class="theme-grid">
              <div class="theme-btn ${theme === 'auto' ? 'on' : ''}" data-theme="auto">
                ${t.edThemeAuto}
                <span class="sub">${t.edThemeDesc}</span>
              </div>
              <div class="theme-btn ${theme === 'dark' ? 'on' : ''}" data-theme="dark">
                ${t.edThemeDark}
                <span class="sub">${t.edThemeDesc}</span>
              </div>
              <div class="theme-btn ${theme === 'light' ? 'on' : ''}" data-theme="light">
                ${t.edThemeLight}
                <span class="sub">${t.edThemeDesc}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Entities -->
        <div class="acc-wrap">
          <div class="acc-head" id="head-entities">
            <ha-icon icon="mdi:database"></ha-icon> ${t.edEntities}
            <span class="acc-arrow" id="arrow-entities">${this._open.entities ? '▾' : '▸'}</span>
          </div>
          <div class="acc-body" id="body-entities" style="display:${this._open.entities ? 'block' : 'none'}">
            <div style="font-size:10px;font-weight:700;color:var(--secondary-text-color);letter-spacing:.5px;margin:8px 0 6px;text-transform:uppercase;">🔘 ${t.edPower}</div>
            ${this._entityField('power_entity', t.edPower, 'switch')}

            <div style="font-size:10px;font-weight:700;color:var(--secondary-text-color);letter-spacing:.5px;margin:12px 0 6px;text-transform:uppercase;">🚪 ${t.edDoor}</div>
            ${this._entityField('door_entity', t.edDoor, 'binary_sensor')}

            <div style="font-size:10px;font-weight:700;color:var(--secondary-text-color);letter-spacing:.5px;margin:12px 0 6px;text-transform:uppercase;">📋 ${t.edProgram}</div>
            ${this._entityField('program_entity', t.edProgram, 'select')}
            ${this._entityField('default_program_entity', t.edDefaultProgram, 'select')}

            <div style="font-size:10px;font-weight:700;color:var(--secondary-text-color);letter-spacing:.5px;margin:12px 0 6px;text-transform:uppercase;">📊 ${t.edProgramPhase}</div>
            ${this._entityField('program_phase_entity', t.edProgramPhase, 'sensor')}
            ${this._entityField('program_progress_entity', t.edProgramProgress, 'sensor')}

            <div style="font-size:10px;font-weight:700;color:var(--secondary-text-color);letter-spacing:.5px;margin:12px 0 6px;text-transform:uppercase;">⏱️ ${t.edRemainingTime}</div>
            ${this._entityField('remaining_time_entity', t.edRemainingTime, 'sensor')}
            ${this._entityField('end_time_entity', t.edEndTime, 'sensor')}

            <div style="font-size:10px;font-weight:700;color:var(--secondary-text-color);letter-spacing:.5px;margin:12px 0 6px;text-transform:uppercase;">🧂 ${t.edSalt}</div>
            ${this._entityField('salt_entity', t.edSalt, 'sensor')}
            ${this._entityField('rinse_aid_entity', t.edRinseAid, 'sensor')}

            <div style="font-size:10px;font-weight:700;color:var(--secondary-text-color);letter-spacing:.5px;margin:12px 0 6px;text-transform:uppercase;">🔢 ${t.edStartCount}</div>
            ${this._entityField('start_count_entity', t.edStartCount, 'sensor')}

            <div style="font-size:10px;font-weight:700;color:var(--secondary-text-color);letter-spacing:.5px;margin:12px 0 6px;text-transform:uppercase;">💧 ${t.edWaterForecast} (%)</div>
            ${this._entityField('water_forecast_entity', t.edWaterForecast, 'sensor')}
            ${this._entityField('energy_forecast_entity', t.edEnergyForecast, 'sensor')}

            <div style="font-size:10px;font-weight:700;color:var(--secondary-text-color);letter-spacing:.5px;margin:12px 0 6px;text-transform:uppercase;">💦 ${t.edWaterPressure}</div>
            ${this._entityField('water_pressure_entity', t.edWaterPressure, 'binary_sensor')}
            ${this._entityField('aquastop_entity', t.edAquastop, 'binary_sensor')}

            <div style="font-size:10px;font-weight:700;color:var(--secondary-text-color);letter-spacing:.5px;margin:12px 0 6px;text-transform:uppercase;">🔊 ${t.edSoundLevel}</div>
            ${this._entityField('sound_level_entity', t.edSoundLevel, 'select')}
            ${this._entityField('remote_control_entity', t.edRemoteControl, 'select')}

            <div style="font-size:10px;font-weight:700;color:var(--secondary-text-color);letter-spacing:.5px;margin:12px 0 6px;text-transform:uppercase;">▶️ ${t.edStart}</div>
            ${this._entityField('start_button_entity', t.edStart, 'button')}
            ${this._entityField('abort_button_entity', t.edAbort, 'button')}

            <div style="font-size:10px;font-weight:700;color:var(--secondary-text-color);letter-spacing:.5px;margin:12px 0 6px;text-transform:uppercase;">⚡ ${t.edVarioSpeed}</div>
            ${this._entityField('variospeed_entity', t.edVarioSpeed, 'switch')}
            ${this._entityField('half_load_entity', t.edHalfLoad, 'switch')}
            ${this._entityField('silence_entity', t.edSilence, 'switch')}
            ${this._entityField('speed_entity', t.edSpeed, 'switch')}
          </div>
        </div>

        <!-- Background -->
        <div class="acc-wrap">
          <div class="acc-head" id="head-bg">
            <ha-icon icon="mdi:palette"></ha-icon> ${t.edBg}
            <span class="acc-arrow" id="arrow-bg">${this._open.bg ? '▾' : '▸'}</span>
          </div>
          <div class="acc-body" id="body-bg" style="display:${this._open.bg ? 'block' : 'none'}">
            <div style="font-size:11px;font-weight:700;color:var(--secondary-text-color);margin-bottom:8px;">${t.edBgPresets}</div>
            <div class="bg-grid">
              ${DW_BG_PRESETS.map(p => {
                const c1 = p.c1 || '#888', c2 = p.c2 || '#444';
                const isC = p.id === 'custom';
                return `<div class="bgs ${bgP === p.id ? 'on' : ''}" data-bg="${p.id}"
                  style="${isC ? 'background:linear-gradient(135deg,#e0e0e0,#bdbdbd);color:#555;text-shadow:none;' : 'background:linear-gradient(135deg,' + c1 + 'cc 0%,' + c2 + '55 100%);'}">${p.label}</div>`;
              }).join('')}
            </div>
            ${bgP === 'custom' ? `
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:8px;">
                ${this._colorRow('bg_color1', t.edColorAccent)}
                ${this._colorRow('bg_color2', t.edColorAccent)}
              </div>
            ` : ''}
            <div class="sl-row">
              <label>${t.edBgAlpha}</label>
              <input type="range" id="inp-bg-alpha" min="0" max="100" step="1" value="${cfg.bg_alpha !== undefined ? cfg.bg_alpha : 85}"/>
              <span class="slv" id="bg-alpha-lbl">${cfg.bg_alpha !== undefined ? cfg.bg_alpha : 85}%</span>
            </div>
            <div class="sl-row" style="margin-top:4px;">
              <label>${t.edBgBlur}</label>
              <input type="range" id="inp-bg-blur" min="0" max="30" step="1" value="${cfg.bg_blur !== undefined ? cfg.bg_blur : 12}"/>
              <span class="slv" id="bg-blur-lbl">${cfg.bg_blur !== undefined ? cfg.bg_blur : 12}px</span>
            </div>
          </div>
        </div>

        <!-- Colors -->
        <div class="acc-wrap">
          <div class="acc-head" id="head-colors">
            <ha-icon icon="mdi:palette-swatch"></ha-icon> ${t.edColors}
            <span class="acc-arrow" id="arrow-colors">${this._open.colors ? '▾' : '▸'}</span>
          </div>
          <div class="acc-body" id="body-colors" style="display:${this._open.colors ? 'block' : 'none'}">
            ${this._colorRow('color_progress', t.edColorProgress)}
            ${this._colorRow('color_running', t.edColorRunning)}
            ${this._colorRow('color_idle', t.edColorIdle)}
            ${this._colorRow('color_error', t.edColorError)}
            ${this._colorRow('color_accent', t.edColorAccent)}
            ${this._colorRow('color_text', t.edColorText)}
            <button class="reset-btn" id="btn-reset-colors">${t.edColorsReset}</button>
          </div>
        </div>

        <!-- Display -->
        <div class="acc-wrap">
          <div class="acc-head" id="head-display">
            <ha-icon icon="mdi:eye"></ha-icon> ${t.edDisplay}
            <span class="acc-arrow" id="arrow-display">${this._open.display ? '▾' : '▸'}</span>
          </div>
          <div class="acc-body" id="body-display" style="display:${this._open.display ? 'block' : 'none'}">
            ${this._toggleSwitch('show_greet', t.edShowGreet, t.edShowGreetDesc)}
            ${this._toggleSwitch('show_status', t.edShowStatus, '')}
            ${this._toggleSwitch('show_progress', t.edShowProgress, '')}
            ${this._toggleSwitch('show_phase', t.edShowPhase, '')}
            ${this._toggleSwitch('show_end_time', t.edShowEndTime, '')}
            ${this._toggleSwitch('show_consumption', t.edShowConsumption, '')}
            ${this._toggleSwitch('show_controls', t.edShowControls, '')}
          </div>
        </div>
      </div>
    `;

    this._bindEvents();
    this._syncPickers();
  }

  _bindEvents() {
    const sr = this.shadowRoot;

    ['lang', 'title', 'entities', 'bg', 'colors', 'display'].forEach(id => {
      const hdr = sr.getElementById('head-' + id);
      if (hdr) hdr.addEventListener('click', () => this._toggleSection(id));
    });

    sr.querySelectorAll('[data-lang]').forEach(btn =>
      btn.addEventListener('click', () => {
        this._config.language = btn.dataset.lang;
        this._fire();
        this._render();
      }));

    sr.querySelectorAll('[data-theme]').forEach(btn =>
      btn.addEventListener('click', () => {
        this._config.theme = btn.dataset.theme;
        this._fire();
        this._render();
      }));

    const wireText = (id, key) => {
      const el = sr.getElementById(id);
      if (!el) return;
      const commit = () => {
        this._config[key] = el.value.trim();
        this._fire();
      };
      el.addEventListener('change', commit);
      el.addEventListener('blur', commit);
    };
    wireText('inp-title', 'title');
    wireText('inp-subtitle', 'subtitle');
    wireText('inp-owner', 'owner_name');

    sr.querySelectorAll('[data-bg]').forEach(tile =>
      tile.addEventListener('click', () => {
        this._config.background_preset = tile.dataset.bg;
        this._fire();
        this._render();
      }));

    const alphaSlider = sr.getElementById('inp-bg-alpha');
    if (alphaSlider) {
      const lbl = sr.getElementById('bg-alpha-lbl');
      alphaSlider.addEventListener('input', () => {
        if (lbl) lbl.textContent = alphaSlider.value + '%';
        this._config.bg_alpha = parseInt(alphaSlider.value);
        this._fire();
      });
    }

    const blurSlider = sr.getElementById('inp-bg-blur');
    if (blurSlider) {
      const lbl = sr.getElementById('bg-blur-lbl');
      blurSlider.addEventListener('input', () => {
        if (lbl) lbl.textContent = blurSlider.value + 'px';
        this._config.bg_blur = parseInt(blurSlider.value);
        this._fire();
      });
    }

    sr.querySelectorAll('[data-cp]').forEach(hdr =>
      hdr.addEventListener('click', () => {
        this._picker = this._picker === hdr.dataset.cp ? null : hdr.dataset.cp;
        this._render();
      }));

    sr.querySelectorAll('[data-cp-native]').forEach(inp => {
      inp.addEventListener('input', () => {
        const ci = inp.closest('.ci');
        const sw = ci?.querySelector('.ci-swatch');
        const code = ci?.querySelector('.ci-code');
        const hex = sr.querySelector(`[data-cp-hex="${inp.dataset.cpNative}"]`);
        if (sw) sw.style.background = inp.value;
        if (code) code.textContent = inp.value;
        if (hex) hex.value = inp.value.replace('#', '');
        this._config[inp.dataset.cpNative] = inp.value;
        this._fire();
      });
      inp.addEventListener('change', () => {
        this._config[inp.dataset.cpNative] = inp.value;
        this._fire();
        this._render();
      });
    });

    sr.querySelectorAll('[data-cp-hex]').forEach(inp =>
      inp.addEventListener('change', () => {
        const val = '#' + inp.value.replace('#', '');
        if (/^#[0-9a-fA-F]{6}$/.test(val)) {
          this._config[inp.dataset.cpHex] = val;
          this._fire();
          this._render();
        }
      }));

    sr.querySelectorAll('[data-cp-dot]').forEach(dot =>
      dot.addEventListener('click', () => {
        this._config[dot.dataset.cpDot] = dot.dataset.color;
        this._fire();
        this._render();
      }));

    const resetBtn = sr.getElementById('btn-reset-colors');
    if (resetBtn) resetBtn.addEventListener('click', () => {
      ['color_progress', 'color_running', 'color_idle', 'color_error', 'color_accent', 'color_text'].forEach(k => delete this._config[k]);
      this._fire();
      this._render();
    });

    sr.querySelectorAll('.disp-tog').forEach(tog =>
      tog.addEventListener('change', () => {
        this._config[tog.dataset.key] = tog.checked;
        this._fire();
        this._render();
      }));

    sr.querySelectorAll('ha-entity-picker[data-key]').forEach(picker =>
      picker.addEventListener('value-changed', e => {
        const key = picker.dataset.key;
        const val = e.detail.value;
        const c = { ...this._config };
        if (val) c[key] = val;
        else delete c[key];
        this._config = c;
        this._fire();
      }));
  }
}

// ─── REGISTER ────────────────────────────────────────────────────────────
customElements.define('dishwasher-card', DishwasherCard);
customElements.define('dishwasher-card-editor', DishwasherCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'dishwasher-card',
  name: 'Siemens Dishwasher Card',
  description: 'Professional card for Siemens dishwasher with visual editor, multi-language, full control, and HA theme support',
  preview: true,
});

console.info(
  '%c 🍽️ Siemens Dishwasher Card %c v1.2.2 %c ready! (Salt & Rinse aid + Power toggle)',
  'background:#0a1628;color:#00d4ff;font-weight:700;padding:2px 6px;border-radius:4px 0 0 4px;font-size:12px',
  'background:#00d4ff;color:#0a1628;font-weight:700;padding:2px 6px;border-radius:0 4px 4px 0;font-size:12px',
  'color:#4ade80;font-weight:400;font-size:11px;margin-left:4px'
);