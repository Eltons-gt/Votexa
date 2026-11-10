import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('Client Utils - cn (ClassNames Merger)', () => {
  it('should correctly merge single classes', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('should correctly handle conditional classes', () => {
    const isPrimary = true;
    const isHidden = false;
    expect(cn('base', isPrimary && 'bg-primary', isHidden && 'hidden')).toBe('base bg-primary');
  });

  it('should correctly deduplicate tailwind conflicting classes', () => {
    expect(cn('p-4', 'p-6')).toBe('p-6');
  });
});

