// Pairs of [from, to] rich dark gradients — theatre-appropriate
const GRADIENT_PALETTE: [string, string][] = [
  ["#1a2a4a", "#080C14"], // deep navy
  ["#2a1a1a", "#0e0808"], // deep burgundy
  ["#1a2a1a", "#080e08"], // deep forest
  ["#2a2a1a", "#0e0e08"], // deep olive
  ["#2a1a2a", "#0e0808"], // deep plum
  ["#1a1a2a", "#08080e"], // deep indigo
  ["#2a1a0e", "#0e0806"], // deep amber
  ["#0e1a2a", "#060810"], // midnight blue
  ["#1a0e2a", "#08060e"], // deep violet
  ["#2a1818", "#100808"], // deep crimson
  ["#142214", "#080e08"], // dark emerald
  ["#221422", "#0e080e"], // dark mauve
  ["#22180a", "#0e0a04"], // dark bronze
  ["#0a1822", "#040810"], // dark teal
  ["#1e1010", "#0c0606"], // dark ruby
];

export function titleToGradient(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  const index = Math.abs(hash) % GRADIENT_PALETTE.length;
  const [from, to] = GRADIENT_PALETTE[index];
  const angle = 135 + (Math.abs(hash >> 8) % 60) - 30;
  return `linear-gradient(${angle}deg, ${from} 0%, ${to} 100%)`;
}

export function isPlaceholderImage(url: string): boolean {
  return !url || url.includes("picsum.photos") || url === "";
}

export function resolveShowImage(
  url: string,
  title: string
): { isGradient: boolean; value: string } {
  if (isPlaceholderImage(url)) {
    return { isGradient: true, value: titleToGradient(title) };
  }
  return { isGradient: false, value: url };
}
