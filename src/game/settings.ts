// The prototype's Tweaks panel props, exposed as URL params for testing:
//   ?textScale=1.15|1.3   enlarge the whole app
//   ?outlineTappables=1   dash-outline every tappable phrase
const params = new URLSearchParams(window.location.search);
const flag = (k: string) => ['1', 'true'].includes(params.get(k) ?? '');
const scale = Number(params.get('textScale'));

export const settings = {
  textScale: [1, 1.15, 1.3].includes(scale) ? scale : 1,
  outlineTappables: flag('outlineTappables'),
};
