/**
 * Design Tokens
 * Sistema de tokens estruturado para escalar com manutenibilidade
 * Hierarquia: Primitivos → Semânticos → Componentes
 */

// ===== PRIMITIVOS =====
// Valores brutos que nunca são usados diretamente nos componentes

export const primitives = {
  // Cores
  colors: {
    coral50: '#FFE8E8',
    coral100: '#FFB8B8',
    coral500: '#FF6B6B',
    coral600: '#FF5252',
    coral700: '#E84545',

    turquoise50: '#E0F2F1',
    turquoise100: '#B2DFDB',
    turquoise500: '#4ECDC4',
    turquoise600: '#3DBDB4',
    turquoise700: '#2DA39A',

    peach50: '#FFE4C4',
    peach100: '#FFD4A8',
    peach500: '#FFB86C',
    peach600: '#FFA855',

    gray50: '#FAFAFA',
    gray100: '#F5F5F5',
    gray200: '#E0E0E0',
    gray300: '#CBD5E0',
    gray400: '#A0AEC0',
    gray500: '#718096',
    gray600: '#4A5568',
    gray700: '#2D3748',
    gray800: '#1A202C',

    white: '#FFFFFF',
    black: '#000000',

    red50: '#FEE2E2',
    red500: '#EF4444',
    red700: '#991B1B',

    green50: '#C6F6D5',
    green500: '#10B981',
    green700: '#22543D',

    blue50: '#BEE3F8',
    blue500: '#3B82F6',
    blue700: '#2C5282',

    orange50: '#FED7AA',
    orange500: '#F59E0B',
    orange700: '#92400E',
  },

  // Espaçamento (escala 4px)
  spacing: {
    '0': '0',
    'xs': '4px',    // 0.25rem
    'sm': '8px',    // 0.5rem
    'md': '16px',   // 1rem
    'lg': '24px',   // 1.5rem
    'xl': '32px',   // 2rem
    '2xl': '40px',  // 2.5rem
    '3xl': '48px',  // 3rem
    '4xl': '64px',  // 4rem
    '5xl': '80px',  // 5rem
  },

  // Raios de borda
  radius: {
    none: '0',
    sm: '8px',
    md: '12px',
    lg: '18px',
    xl: '24px',
    full: '9999px',
  },

  // Sombras
  shadows: {
    none: 'none',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },

  // Tipografia
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
  },

  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    black: '900',
  },

  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },

  // Z-index
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },

  // Transições
  transition: {
    fast: '150ms',
    base: '250ms',
    slow: '350ms',
  },
} as const;

// ===== TOKENS SEMÂNTICOS =====
// Mapeiam propósito/intenção, não aparência

export const semantic = {
  colors: {
    // Branding
    primary: primitives.colors.coral500,
    primaryHover: primitives.colors.coral600,
    primaryLight: primitives.colors.coral50,

    secondary: primitives.colors.turquoise500,
    secondaryHover: primitives.colors.turquoise600,

    accent: primitives.colors.peach500,
    accentLight: primitives.colors.peach50,

    // Backgrounds
    bgPrimary: primitives.colors.white,
    bgSecondary: '#FFF5F5',
    bgTertiary: primitives.colors.gray50,

    // Surfaces (cards, modals)
    surface: primitives.colors.white,
    surfaceHover: '#FFF8F8',

    // Text
    textPrimary: primitives.colors.gray700,
    textSecondary: primitives.colors.gray500,
    textTertiary: primitives.colors.gray400,
    textMuted: primitives.colors.gray300,
    textOnPrimary: primitives.colors.white,

    // Borders
    border: primitives.colors.coral50,
    borderHover: primitives.colors.peach500,
    borderFocus: primitives.colors.turquoise500,

    // Estados
    success: primitives.colors.green500,
    successBg: primitives.colors.green50,
    successText: primitives.colors.green700,

    error: primitives.colors.red500,
    errorBg: primitives.colors.red50,
    errorText: primitives.colors.red700,

    warning: primitives.colors.orange500,
    warningBg: primitives.colors.orange50,
    warningText: primitives.colors.orange700,

    info: primitives.colors.blue500,
    infoBg: primitives.colors.blue50,
    infoText: primitives.colors.blue700,
  },

  spacing: primitives.spacing,
  radius: primitives.radius,
  shadows: primitives.shadows,
  fontSize: primitives.fontSize,
  fontWeight: primitives.fontWeight,
  lineHeight: primitives.lineHeight,
  zIndex: primitives.zIndex,
  transition: primitives.transition,
} as const;

// ===== TOKENS DE COMPONENTES =====
// Específicos para componentes individuais

export const components = {
  button: {
    paddingX: semantic.spacing.lg,
    paddingY: semantic.spacing.md,
    borderRadius: semantic.radius.md,
    fontSize: semantic.fontSize.base,
    fontWeight: semantic.fontWeight.bold,
    transition: semantic.transition.base,
  },

  input: {
    height: '44px',
    paddingX: semantic.spacing.md,
    borderRadius: semantic.radius.md,
    fontSize: semantic.fontSize.base,
    borderWidth: '2px',
    transition: semantic.transition.base,
  },

  card: {
    padding: semantic.spacing.xl,
    borderRadius: semantic.radius.lg,
    shadow: semantic.shadows.md,
    shadowHover: semantic.shadows.lg,
    borderWidth: '1px',
  },

  modal: {
    borderRadius: semantic.radius.xl,
    padding: semantic.spacing['2xl'],
    shadow: semantic.shadows['2xl'],
  },
} as const;

// ===== UTILITÁRIO DE TIPO =====
export type Spacing = keyof typeof semantic.spacing;
export type Radius = keyof typeof semantic.radius;
export type FontSize = keyof typeof semantic.fontSize;
export type FontWeight = keyof typeof semantic.fontWeight;
