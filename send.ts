import { getSendRemark, sendRemark } from './util';

const run = async () => {
    const prompt = require('prompt-sync')();
    const item = prompt('Item: ');
    const recipient = prompt("Recipient: ");
    let remark = getSendRemark(item, recipient);
    console.log(remark);
    const cont = prompt('Enter to continue, CTRL-C to quit.');
    if (cont != "") {
        console.log("Quitting...");
        process.exit(0);
    }
    console.log("Continuing...");
    await sendRemark(remark);
    process.exit(0);
}

run();