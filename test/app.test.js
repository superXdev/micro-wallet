const { expect } = require("chai");
const fs = require("fs");
const { execSync } = require("child_process");
const { runSetup } = require('../cmds/modules/setup');

const runCommand = (args) => {
  return execSync(`node cli.js ${args}`).toString();
};

describe("CLI", () => {
  before((done) => {
    runSetup().then(() => done())
  })

  it("should run setup command", () => {
    expect(runCommand("setup")).to.include("Already setting up");
  })
})