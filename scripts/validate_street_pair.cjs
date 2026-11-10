'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'../assets/v2');
const intake=JSON.parse(fs.readFileSync(path.join(root,'street-pair-intake.json'),'utf8'));
assert.equal(intake.topology,'LSLS');assert.equal(intake.candidates.length,2);
let missing=0;
for(const candidate of intake.candidates){
 const file=path.join(root,candidate.file);
 if(!fs.existsSync(file)){
  console.error('UPLOAD REQUIRED: '+candidate.file+' (full-resolution original)');missing++;continue;
 }
 const data=fs.readFileSync(file);
 assert.equal(data.length,candidate.bytes,candidate.file+' wrong byte length');
 assert.equal(data.subarray(0,8).toString('hex'),'89504e470d0a1a0a',candidate.file+' is not PNG');
 assert.equal(data.readUInt32BE(16),1254,candidate.file+' wrong width');
 assert.equal(data.readUInt32BE(20),1254,candidate.file+' wrong height');
 assert.equal(crypto.createHash('sha256').update(data).digest('hex'),candidate.sha256,
   candidate.file+' does not match the original generated painting');
 console.log('VERIFIED original:',candidate.file, data.length+' bytes, 1254px, SHA-256 matches.');
}
if(missing){
 console.error('Missing '+missing+' of 2 image binaries. The GitHub PR remains a staging review until they are uploaded.');
 process.exitCode=1;
}else{
 assert.notEqual(intake.candidates[0].sha256,intake.candidates[1].sha256);
 assert(fs.existsSync(path.join(root,'street-straight-east-west.png')),
   'Do not remove the original 4.1MB street tile');
 console.log('Both different originals are present. Ready to switch variant 1 and 3 to review assets.');
}
