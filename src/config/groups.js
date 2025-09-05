// Group configuration for Jack's Solana Tracker
export const GROUPS = {
  'jack-of-all-trenches': {
    id: 'jack-of-all-trenches',
    name: 'Jack of all Trenches',
    displayName: 'Jack of all Trenches',
    level: 'entry',
    status: 'active',
    description: 'The battlefield. New callers grind it out here.',
    mechanic: 'Only Top 5 callers of the week climb up. Everyone else stays.',
    energy: 'Warzone, chaotic, "prove yourself."',
    color: 'orange',
    icon: '⚔️'
  },
  'jack-lounge': {
    id: 'jack-lounge',
    name: 'Jack Lounge',
    displayName: 'Jack Lounge',
    level: 'mid',
    status: 'locked',
    description: 'Chill but competitive. A mix of winners and losers.',
    mechanic: 'Each week 5 top callers go up and 5 bottom callers go down.',
    energy: '"Stay sharp, or you get kicked back to the trenches."',
    color: 'blue',
    icon: '🏛️'
  },
  'jacky-fnf': {
    id: 'jacky-fnf',
    name: 'Jacky FNF (Fight Night Friday)',
    displayName: 'Jacky FNF',
    level: 'high',
    status: 'locked',
    description: 'Coliseum energy, for top dogs. You can rise or fall here, no mercy.',
    mechanic: 'Callers can climb higher or get knocked down.',
    energy: 'Winner\'s circle meets gladiator pit.',
    color: 'purple',
    icon: '🏟️'
  }
};

export const getCurrentGroup = () => {
  return GROUPS['jack-of-all-trenches']; // Currently active group
};

export const getActiveGroups = () => {
  return Object.values(GROUPS).filter(group => group.status === 'active');
};

export const getLockedGroups = () => {
  return Object.values(GROUPS).filter(group => group.status === 'locked');
};

