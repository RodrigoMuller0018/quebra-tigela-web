/**
 * Função utilitária para concatenar classes CSS condicionalmente
 * Alternativa leve ao clsx/classnames
 *
 * @example
 * cn('base', isActive && 'active', isDanger && 'danger')
 * cn(['base', 'shared'], isActive && 'active')
 * cn('base', { active: isActive, danger: isDanger })
 */

type ClassValue = string | number | boolean | undefined | null | ClassValue[] | Record<string, boolean | undefined | null>;

export function cn(...classes: ClassValue[]): string {
  const result: string[] = [];

  for (const cls of classes) {
    if (!cls) continue;

    if (typeof cls === 'string' || typeof cls === 'number') {
      result.push(String(cls));
    } else if (Array.isArray(cls)) {
      const nested = cn(...cls);
      if (nested) result.push(nested);
    } else if (typeof cls === 'object') {
      for (const [key, value] of Object.entries(cls)) {
        if (value) result.push(key);
      }
    }
  }

  return result.join(' ');
}
