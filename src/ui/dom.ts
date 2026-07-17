/**
 * Tiny DOM helpers. All UI is built through these — no innerHTML, so
 * question text can never inject markup.
 */

/** Options for h(). */
export interface HProps {
  className?: string;
  text?: string;
  onClick?: (ev: MouseEvent) => void;
  attrs?: Record<string, string>;
}

/**
 * Create an element.
 * Input: tag name, optional props (class, text content, click handler,
 * extra attributes), optional children. Output: the element.
 */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: HProps = {},
  children: Node[] = [],
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (props.className) el.className = props.className;
  if (props.text !== undefined) el.textContent = props.text;
  if (props.onClick) el.addEventListener('click', props.onClick as EventListener);
  if (props.attrs) {
    for (const [name, value] of Object.entries(props.attrs)) el.setAttribute(name, value);
  }
  for (const child of children) el.appendChild(child);
  return el;
}

/**
 * Remove every child of an element.
 * Input: the element. Output: none.
 */
export function clearChildren(el: Element): void {
  while (el.firstChild) el.removeChild(el.firstChild);
}
