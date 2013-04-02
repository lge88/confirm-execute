var rl = require('readline');
var fs = require('fs');
var spawn = require('child_process').spawn;

function batch (commands, done) {
  if(!Array.isArray(commands) || commands.length < 1) {
    process.exit();
  }
  var tmpFile =  '/tmp/~confirm-execute' + Date.now() + '~';
  commands.push('rm -f ' + tmpFile);
  fs.writeFileSync(tmpFile, commands.join('\n'), 'utf8');
  var child = spawn('/bin/bash', [tmpFile], {
    stdio: 'inherit'
  });

  child
    .on('exit', function() {
      if (done && typeof done === 'function') {
        done();
      } else {
        process.exit();
      }
    })
    .on('error', function(err) {
      console.error(err);
      process.exit();
    });
};
exports.batch = batch;

function confirmExecute(commands, done) {
  console.log('Commands:');
  console.log(commands.join('\n'));
  rl.createInterface({
    input: process.stdin,
    output: process.stdout
  }).question('Execute above commands? [yes/no] ', function(ans) {
    if (ans === 'yes') {
      batch(commands, done);
    } else {
      console.log('Abort.');
      if (done && typeof done === 'function') {
        done();
      } else {
        process.exit();
      }
    }
  });
}
exports.confirmExecute = confirmExecute;

if (require.main === module) {
  var commands = [
    'cd ~',
    'ls'
  ];
  confirmExecute(commands);
};