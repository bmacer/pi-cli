import { getSendRemark, sendRemark } from './util';

const run = async () => {
    const prompt = require('prompt-sync')();
    const item = prompt('Item: ');
    const recipient = prompt("Recipient: ");
    let remark = getSendRemark(item, recipient);
    console.log(remark);
    prompt('Enter to continue, CTRL-C to quit.');
    console.log("Continuing...");
    await sendRemark(remark);
    process.exit(0);
}

run();