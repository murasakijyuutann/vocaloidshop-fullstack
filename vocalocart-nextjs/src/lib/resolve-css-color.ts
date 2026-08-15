/**
 * Resolves a CSS custom property (e.g. "--secondary") to a computed
 * `rgb(...)` string. Used to hand our design tokens to third-party widgets
 * (Stripe Elements) that render in an iframe and can't consume `var()`
 * references directly, so they need literal color values instead.
 */
export function resolveCssColor(cssVarName: string): string {
  if (typeof window === 'undefined') return '#000000'
  const probe = document.createElement('span')
  probe.style.color = `var(${cssVarName})`
  document.body.appendChild(probe)
  const rgb = getComputedStyle(probe).color
  document.body.removeChild(probe)
  return rgb
}
