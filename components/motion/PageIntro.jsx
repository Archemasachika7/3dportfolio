/**
 * An inner page's opening block. Its entrance is pure CSS (app/globals.css,
 * PAGE INTRO), so it plays from the first painted frame: no JavaScript to
 * wait for, nothing for hydration to delay, and nothing hidden if scripts
 * never load. Inside it:
 *
 *   <SheetLabel>             index, typed label, scale rule, node
 *   [data-intro-heading]     the title, rising out of a mask
 *   [data-intro-item]        anything else; style={{ "--d": n }} orders it
 *                            (80ms apart; a negative n runs before the title)
 */
export default function PageIntro({ as: Tag = "div", className, children, ...rest }) {
  return (
    <Tag className={className} data-intro {...rest}>
      {children}
    </Tag>
  )
}
