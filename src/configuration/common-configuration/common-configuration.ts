import { join } from 'path';
import yamlReader from '../yaml-reader';

const YAML_CONFIG_FILENAME = 'config.yaml';

export default () => {
  return yamlReader(join(__dirname, '..', '..', 'config', YAML_CONFIG_FILENAME));
};
