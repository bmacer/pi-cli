import { getSendRemark, sendRemark } from './util';

const run = async () => {
    const prompt = require('prompt-sync')();
    const item = prompt('Item: ').replace("https://singular.app/collectibles/", "");
    if (item == "") {
        console.log("Quitting...")
        process.exit(0);
    }
    console.log(item);
    const recipient = prompt("Recipient: ").replace("https://singular.app/collectibles/", "");
    if (recipient == "") {
        console.log("Quitting...")
        process.exit(0);
    }
    console.log(recipient);
    let remark = getSendRemark(item, recipient);
    console.log(remark);
    const cont = prompt('Enter to continue, CTRL-C to quit: ');
    if (cont != "") {
        console.log("Quitting...");
        process.exit(0);
    }
    console.log("Continuing...");
    await sendRemark(remark);
    process.exit(0);
}

run();