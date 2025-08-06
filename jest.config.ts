import type { Config } from "jest";

const config: Config = {
  preset: 'ts-jest',
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  moduleNameMapper: {
    "^@application/(.*)$": "<rootDir>/src/application/$1",
    "^@config/(.*)$": "<rootDir>/src/config/$1",
    "^@domain/(.*)$": "<rootDir>/src/domain/$1",
    "^@infrastructure/(.*)$": "<rootDir>/src/infrastructure/$1",
    "^@interfaces/(.*)$": "<rootDir>/src/interfaces/$1",
    "^@shared/(.*)$": "<rootDir>/src/shared/$1",
  },
  testEnvironment: "node",
  testPathIgnorePatterns: ["<rootDir>/dist/", "<rootDir>/node_modules/"],
  // Add more options as needed from the TS config
  moduleFileExtensions: [
    "js",
    "mjs",
    "cjs",
    "jsx",
    "ts",
    "tsx",
    "json",
    "node",
  ],
  setupFiles: ['<rootDir>/jest.setup.ts'],
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: "tsconfig.json" }],
  },
};

export default config;
