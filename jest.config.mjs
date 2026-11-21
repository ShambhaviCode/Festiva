import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/unit/**/*.test.ts"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
  coverageProvider: "v8",
  collectCoverageFrom: ["src/domain/**/*.ts", "src/lib/**/*.ts"],
};

export default createJestConfig(config);
