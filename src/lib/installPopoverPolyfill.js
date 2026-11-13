if (typeof HTMLElement !== 'undefined' && !Object.hasOwn(HTMLElement.prototype, 'popover')) {
  import('@oddbird/popover-polyfill')
}
