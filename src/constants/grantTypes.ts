export const GRANT_TYPES = {
  ORI: 'ORI',
  EXTERNAL: 'External',
  SCHOLARSHIP: 'Scholarship',
  TRAVEL_CONFERENCE: 'Travel/Conference',
  GOVT: 'GOVT',
  FELLOWSHIP: 'Fellowship'
} as const;

export type GrantType = typeof GRANT_TYPES[keyof typeof GRANT_TYPES];

export const GRANT_TYPE_OPTIONS = [
  { value: GRANT_TYPES.ORI, label: 'ORI' },
  { value: GRANT_TYPES.EXTERNAL, label: 'External' },
  { value: GRANT_TYPES.SCHOLARSHIP, label: 'Scholarship' },
  { value: GRANT_TYPES.TRAVEL_CONFERENCE, label: 'Travel/Conference' },
  { value: GRANT_TYPES.GOVT, label: 'GOVT' },
  { value: GRANT_TYPES.FELLOWSHIP, label: 'Fellowship' }
];

export const GRANT_TYPE_LABELS: Record<GrantType, string> = {
  [GRANT_TYPES.ORI]: 'ORI',
  [GRANT_TYPES.EXTERNAL]: 'External',
  [GRANT_TYPES.SCHOLARSHIP]: 'Scholarship',
  [GRANT_TYPES.TRAVEL_CONFERENCE]: 'Travel/Conference',
  [GRANT_TYPES.GOVT]: 'GOVT',
  [GRANT_TYPES.FELLOWSHIP]: 'Fellowship'
};
