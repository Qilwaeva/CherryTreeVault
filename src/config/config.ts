import { Config, ConfigBase } from "./types";

const config: Config = {
    currentEnv: "@DEPLOY-ENV@",
    local: {
        env: "local",
        api: {
            base: "http://localhost:8080",
        }
    },
    dev: {
        env: "local",
        api: {
            base: "http://localhost:8080",
        }
    },
    prod: {
        env: "local",
        api: {
            base: "http://localhost:8080",
        }
    }
}

export function getConfig(): ConfigBase {
    if (config.currentEnv.startsWith("@")) {
        return config.local;
    }

    return config[<"dev" | "prod">config.currentEnv]
}