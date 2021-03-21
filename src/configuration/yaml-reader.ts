import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';

export default (filePath: string) => {
  return yaml.load(readFileSync(filePath, 'utf8')) as Record<string, any>;
};
