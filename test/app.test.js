const { expect } = require("chai");
const { execSync } = require("child_process");

const runCommand = (args) => {
  return execSync(`node cli.js ${args}`).toString();
};

describe("CLI", () => {
  it("should run setup command", () => {
    expect(runCommand("setup")).to.include("DB created");
  });
});