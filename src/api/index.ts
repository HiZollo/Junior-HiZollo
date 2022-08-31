import childProcess from "node:child_process";

[0, 1].forEach(n => {
  childProcess.fork('./dist/src/api/app.js', [], {
    env: {
      SHARD_ID: n.toString()
    }
  })
});