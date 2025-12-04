export type ConfigBase = {
    env: string
    api: {
        base: string
    }
}

export type Config = {
    currentEnv: string
    local: ConfigBase
    dev: ConfigBase
    prod: ConfigBase
}