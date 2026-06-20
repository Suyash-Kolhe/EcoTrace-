import { describe, it, expect } from 'vitest';
import { REDUCTION_ACTIONS } from '../data/actions';

describe('EcoTrace Climate Milestones & Action Alignment', () => {
  it('should verify actions are structured correctly with science boundaries', () => {
    REDUCTION_ACTIONS.forEach(action => {
      expect(action.co2SavingKg).toBeGreaterThan(0);
      expect(['transport', 'energy', 'food', 'shopping']).toContain(action.category);
    });
  });

  it('should verify transport offsets are proportional to fuel profiles', () => {
    const evSwitch = REDUCTION_ACTIONS.find(a => a.id === 'ev-switch');
    if (evSwitch) {
      expect(evSwitch.co2SavingKg).toBeGreaterThan(100);
    }
  });

  it('should check category distributions of the actions', () => {
    const transportCount = REDUCTION_ACTIONS.filter(a => a.category === 'transport').length;
    const energyCount = REDUCTION_ACTIONS.filter(a => a.category === 'energy').length;
    const foodCount = REDUCTION_ACTIONS.filter(a => a.category === 'food').length;

    expect(transportCount).toBeGreaterThan(0);
    expect(energyCount).toBeGreaterThan(0);
    expect(foodCount).toBeGreaterThan(0);
  });
});
