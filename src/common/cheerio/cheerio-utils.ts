import Cheerio = cheerio.Cheerio;

export function ifPresent(cheerio: Cheerio, onPresent: (cheerio: Cheerio) => void) {
  if (cheerio && cheerio.length) {
    onPresent(cheerio);
  }
}

export async function ifAsyncPresent(cheerio: Cheerio, onPresent: (cheerio: Cheerio) => Promise<void>) {
  if (cheerio && cheerio.length) {
    await onPresent(cheerio);
  }
}
