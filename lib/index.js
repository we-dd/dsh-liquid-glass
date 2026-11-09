/**
 * dsh-liquid-glass — host half.
 *
 * The material itself is a browser concern: this half exists so the loader has
 * a real plugin row to activate (the `dsh.client` declaration in package.json
 * is what makes the web app load ./client.js). It intentionally registers no
 * Host service, no tool and no config: the glass layer is presentation only,
 * so switching it off in the plugin manager removes every visual it owns and
 * leaves the Host composition untouched.
 */

export const name = 'dsh-liquid-glass'

/** No Host services are consumed. */
export const inject = []

/**
 * Nothing to mount on the Host side; the effect is entirely in the Client half.
 * Kept explicit (rather than omitted) so the plugin is a well-formed Cordis
 * plugin and the loader reports it as active.
 */
export function apply(ctx) {
  ctx.effect(() => () => {}, 'dsh-liquid-glass: presentation-only material')
}
