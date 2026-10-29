/**
 * "Did you know?" figures from the FBI Internet Crime Complaint Center (IC3) 2024 Internet Crime Report.
 * Update these when IC3 publishes a newer annual report.
 */
export const STATS_SOURCE = {
  label: 'FBI Internet Crime Complaint Center (IC3), 2024 Internet Crime Report',
  url: 'https://www.fbi.gov/how-we-can-help-you/common-frauds-and-scams',
  report: 'https://www.ic3.gov',
};

export const STATS: { value: string; label: string }[] = [
  { value: '$16.6B', label: 'reported lost to online fraud and scams in the U.S. in 2024' },
  { value: '859,532', label: 'complaints made to the FBI in 2024, about 2,300 every day' },
  { value: '$4.9B', label: 'lost by people over 60, more than any other age group' },
  { value: '$6.5B', label: 'lost to investment scams, the costliest kind' },
];
