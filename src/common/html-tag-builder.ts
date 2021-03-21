export function buildLink(href: string, content: string): string {
  return `<a href="${href}">${content}</a>`;
}

export function buildImage(src: string): string {
  return `<img src="${src}" alt="img"/>`;
}
