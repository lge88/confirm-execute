var rl = require('readline');
var fs = require('fs');
var spawn = require('child_process').spawn;
var write = fs.writeFileSync;

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
  var rli = rl.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  console.log('Commands:');
  if (!Array.isArray(commands)) {
    commands = [commands];
  }
  console.log(commands.join('\n'));
  console.log('Action: 1) Execute; 2) Write to file; 3) Quit.');
 
  rli.question('You choose: ', function(ans) {
    if (ans === '1') {
      batch(commands, done);
      process.exit();
    } else if (ans === '2') {
      rli.question('File path: ', function(filePath) {
        write(filePath, commands.join('\n'), 'utf8');
        process.exit();
      });
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
