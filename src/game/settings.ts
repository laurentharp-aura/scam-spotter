// The prototype's Tweaks panel props, exposed as URL params for testing:
//   ?unlockAll=1          open every round on the trail
//   ?textScale=1.15|1.3   enlarge the whole app
//   ?outlineTappables=1   dash-outline every tappable phrase
const params = new URLSearchParams(window.location.search);
const flag = (k: string) => ['1', 'true'].includes(params.get(k) ?? '');
const scale = Number(params.get('textScale'));

export const settings = {
  unlockAll: flag('unlockAll'),
  textScale: [1, 1.15, 1.3].includes(scale) ? scale : 1,
  outlineTappables: flag('outlineTappables'),
};
