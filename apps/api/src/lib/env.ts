import "dotenv/config";

export const validateEnv = (name: string) => {
  const env = process.env[name];

  if (!env) {
    throw new Error(`${name} is not defined`);
  }

  return env;
};
