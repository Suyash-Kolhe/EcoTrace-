/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ActionItem } from '../types';

export const REDUCTION_ACTIONS: ActionItem[] = [
  // TRANSPORT ACTIONS
  {
    id: 't-carpool',
    category: 'transport',
    title: 'Carpool or Rideshare',
    description: 'Share your weekly commute with coworkers or neighbors to cut your individual driving distance.',
    co2SavingKg: 380,
    difficulty: 'easy',
  },
  {
    id: 't-transit',
    category: 'transport',
    title: 'Adopt Public Transit',
    description: 'Replace two driving days per week with commuter trains, subways, or buses.',
    co2SavingKg: 850,
    difficulty: 'medium',
  },
  {
    id: 't-flyless',
    category: 'transport',
    title: 'Flight-Free Holiday Year',
    description: 'Commit to replacing one short-haul flight with high-speed rail or a local staycation.',
    co2SavingKg: 450,
    difficulty: 'medium',
  },
  {
    id: 't-electric',
    category: 'transport',
    title: 'Plan an EV Upgrade',
    description: 'Commit to making your next vehicle purchase an electric or plug-in hybrid model.',
    co2SavingKg: 1800,
    difficulty: 'hard',
  },
  {
    id: 't-tires',
    category: 'transport',
    title: 'Optimize Tire Inflation',
    description: 'Check tire pressure monthly; properly inflated tires improve fuel economy by up to 3%.',
    co2SavingKg: 90,
    difficulty: 'easy',
  },

  // ENERGY ACTIONS
  {
    id: 'e-led',
    category: 'energy',
    title: 'Switch to 100% LED Bulbs',
    description: 'Replace 10 older incandescent/halogen lightbulbs in high-use rooms with energy-star LEDs.',
    co2SavingKg: 140,
    difficulty: 'easy',
  },
  {
    id: 'e-green-tariff',
    category: 'energy',
    title: 'Switch to Green Energy',
    description: 'Contact your utility provider to enroll in a certified 100% renewable wind/solar energy plan.',
    co2SavingKg: 950,
    difficulty: 'easy',
  },
  {
    id: 'e-thermostat',
    category: 'energy',
    title: 'Dial Down the Thermostat',
    description: 'Lower heating by 1°C in winter, or raise cooling by 1°C in summer. Best with a smart thermostat.',
    co2SavingKg: 320,
    difficulty: 'easy',
  },
  {
    id: 'e-cold-wash',
    category: 'energy',
    title: 'Cold Wash & Rack Dry',
    description: 'Wash clothes at 30°C/cold, and air-dry on a rack instead of using a high-energy tumble dryer.',
    co2SavingKg: 180,
    difficulty: 'medium',
  },
  {
    id: 'e-insulation',
    category: 'energy',
    title: 'Improve Attic/Wall Insulation',
    description: 'Seal draft leaks around doors/windows and add basic attic insulation wool.',
    co2SavingKg: 550,
    difficulty: 'hard',
  },

  // FOOD ACTIONS
  {
    id: 'f-meatless',
    category: 'food',
    title: 'Meatless Mondays',
    description: 'Swap all meat for plant-based proteins (beans, lentils, tofu) just one day per week.',
    co2SavingKg: 220,
    difficulty: 'easy',
  },
  {
    id: 'f-vegetarian',
    category: 'food',
    title: 'Transition to Vegetarianism',
    description: 'Adopt a full vegetarian diet, replacing land meat and seafood with wholesome plant foods.',
    co2SavingKg: 750,
    difficulty: 'medium',
  },
  {
    id: 'f-vegan',
    category: 'food',
    title: 'Adopt a Vegan Diet',
    description: 'Go fully plant-based to eliminate diet emissions related to cattle farming and commercial dairy.',
    co2SavingKg: 1200,
    difficulty: 'hard',
  },
  {
    id: 'f-zerowaste',
    category: 'food',
    title: 'Zero Food Waste Challenge',
    description: 'Plan meal ingredients diligently, compost scraps, and use creative freezer prep to avoid wasting food.',
    co2SavingKg: 280,
    difficulty: 'medium',
  },
  {
    id: 'f-local',
    category: 'food',
    title: 'Support Clean & Local Foods',
    description: 'Purchase organic food and seasonal local farm produce to eliminate heavy transportation miles.',
    co2SavingKg: 110,
    difficulty: 'medium',
  },

  // SHOPPING ACTIONS
  {
    id: 's-secondhand',
    category: 'shopping',
    title: 'Choose Secondhand First',
    description: 'Seek pre-loved clothing, tools, and housewares from vintage stores or local classifieds before buying new.',
    co2SavingKg: 160,
    difficulty: 'easy',
  },
  {
    id: 's-fashion',
    category: 'shopping',
    title: 'Boycott Fast Fashion',
    description: 'Purchase only high-quality, durable wardrobe additions from sustainable, ethical brands.',
    co2SavingKg: 190,
    difficulty: 'medium',
  },
  {
    id: 's-repair',
    category: 'shopping',
    title: 'Repair over Replace',
    description: 'Extend device and appliance lifespan with software tuning, battery replacements, and modular repair.',
    co2SavingKg: 230,
    difficulty: 'medium',
  },
  {
    id: 's-full-recycle',
    category: 'shopping',
    title: 'Gold-Standard Recycling',
    description: 'Strictly sort and clean cardboard, PET plastic, glass containers, and aluminum cans for municipal pickup.',
    co2SavingKg: 120,
    difficulty: 'easy',
  },
  {
    id: 's-digital',
    category: 'shopping',
    title: 'Go Fully Paperless',
    description: 'Switch to fully electronic utility bills, digital receipts, and request catalogs in digital formats.',
    co2SavingKg: 30,
    difficulty: 'easy',
  }
];
