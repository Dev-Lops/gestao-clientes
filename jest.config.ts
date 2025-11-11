import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleDirectories: ["node_modules", "<rootDir>/src"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/tests/setupTests.ts"],
  collectCoverageFrom: [
    "src/config/env.ts",
    "src/services/auth/session.ts",
    "src/store/appStore.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 0.8,
      functions: 0.8,
      lines: 0.8,
      statements: 0.8,
    },
  },
};

export default config;
