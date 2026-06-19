import { describe, it, expect } from 'vitest';
import { REDUCTION_ACTIONS } from './actions';

describe('Reduction Actions Core Data', () => {
  it('should define some core reduction actions of different categories', () => {
    expect(REDUCTION_ACTIONS.length).toBeGreaterThan(0);
    
    const categories = new Set(REDUCTION_ACTIONS.map(action => action.category));
    expect(categories.has('transport')).toBe(true);
    expect(categories.has('energy')).toBe(true);
    expect(categories.has('food')).toBe(true);
    expect(categories.has('shopping')).toBe(true);
  });

  it('should have valid fields with realistic co2 savings for each action', () => {
    REDUCTION_ACTIONS.forEach(action => {
      expect(action.id).toBeTypeOf('string');
      expect(action.title).toBeTypeOf('string');
      expect(action.description).toBeTypeOf('string');
      expect(action.co2SavingKg).toBeTypeOf('number');
      expect(action.co2SavingKg).toBeGreaterThan(0);
      expect(['easy', 'medium', 'hard']).toContain(action.difficulty);
    });
  });

  it('should have unique IDs across all reduction actions', () => {
    const ids = REDUCTION_ACTIONS.map(action => action.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});
