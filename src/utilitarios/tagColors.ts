/**
 * Retorna a cor CSS de background para uma categoria/tipo de arte
 * Baseado nas variáveis CSS definidas em tema.css
 *
 * @param categoria - Nome da categoria de arte
 * @returns String com a variável CSS da cor correspondente
 */
export const getTagColor = (categoria: string): string => {
  const colors: Record<string, string> = {
    'Pintura': 'var(--tag-pintura)',       // Azul pastel #BEE3F8
    'Escultura': 'var(--tag-escultura)',   // Verde menta #C6F6D5
    'Fotografia': 'var(--tag-fotografia)', // Pêssego claro #FFE4C4
    'Digital': 'var(--tag-digital)',       // Turquesa claro #E0F2F1
    'Cerâmica': 'var(--tag-ceramica)',     // Rosa claro #FFE8E8
    'Ceramica': 'var(--tag-ceramica)',     // Alias sem acento
  };

  return colors[categoria] || 'var(--accent-light)'; // Default: pêssego claro
};

/**
 * Retorna cor de texto adequada para uma categoria
 * Usa cores que contrastam bem com os backgrounds pastéis
 *
 * @param categoria - Nome da categoria de arte
 * @returns String com a variável CSS da cor de texto correspondente
 */
export const getTagTextColor = (categoria: string): string => {
  const textColors: Record<string, string> = {
    'Pintura': 'var(--info-text)',        // Azul escuro #2C5282
    'Escultura': 'var(--success-text)',   // Verde escuro #22543D
    'Fotografia': 'var(--warning-text)',  // Laranja escuro #92400E
    'Digital': 'var(--secondary)',        // Turquesa #4ECDC4
    'Cerâmica': 'var(--primary)',         // Rosa coral #FF6B6B
    'Ceramica': 'var(--primary)',         // Alias sem acento
  };

  return textColors[categoria] || 'var(--accent)'; // Default: pêssego
};

/**
 * Retorna um objeto com background e cor de texto para uma tag
 * Útil para aplicar estilos inline em componentes
 *
 * @param categoria - Nome da categoria de arte
 * @returns Objeto com backgroundColor e color
 */
export const getTagStyle = (categoria: string) => {
  return {
    backgroundColor: getTagColor(categoria),
    color: getTagTextColor(categoria),
  };
};

/**
 * Lista de todas as categorias disponíveis
 */
export const CATEGORIAS_ARTE = [
  'Pintura',
  'Escultura',
  'Fotografia',
  'Digital',
  'Cerâmica',
] as const;

export type CategoriaArte = typeof CATEGORIAS_ARTE[number];
