import { Config } from "./Config";
import development from "./development";

const env = process.env.NODE_ENV || "development";

const configs = {
  development,
};

const config = configs[env] as Config;

export default config;
