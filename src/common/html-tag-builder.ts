export function buildLink(href: string, content: string): string {
  return `<a href="${href}">${content}</a>`;
}

export function buildImage(src: string): string {
  return `<img src="${src}" alt="img"/>`;
}

export function newLineToBr(content: string): string {
  return content.replace(/(?:\r\n|\r|\n)/g, '<br>');
}
