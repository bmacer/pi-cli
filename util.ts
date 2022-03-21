import { WS_URL } from "./constants";
import { MNEMONIC_PHRASE } from "./secrets";

import type { EventRecord } from '@polkadot/types/interfaces';

import { KeyringPair } from "@polkadot/keyring/types";
import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";
import { SubmittableExtrinsic } from "@polkadot/api/types";
import { ISubmittableResult } from "@polkadot/types/types";
import { CodecHash } from "@polkadot/types/interfaces";
import { cryptoWaitReady } from "@polkadot/util-crypto";

export const getSendRemark = (from: string, to: string) => {
    return `RMRK::SEND::2.0.0::${from}::${to}`
}

export const getApi = async (wsEndpoint: string): Promise<ApiPromise> => {
    const wsProvider = new WsProvider(wsEndpoint);
    const api = ApiPromise.create({ provider: wsProvider });
    return api;
};

export const getKeys = (): KeyringPair[] => {
    const k = [];
    const keyring = new Keyring({ type: "sr25519" });
    k.push(keyring.addFromMnemonic(MNEMONIC_PHRASE));
    return k;
};

export const getKeyringFromUri = (phrase: string): KeyringPair => {
    const keyring = new Keyring({ type: "sr25519" });
    return keyring.addFromUri(phrase);
};

export const sendRemarks = async (remarks: string[]) => {
    await cryptoWaitReady();
    const accounts = getKeys();
    const ws = WS_URL;
    const phrase = MNEMONIC_PHRASE;
    const kp = getKeyringFromUri(phrase);
    const api = await getApi(ws);

    const txs = remarks.map((remark) => api.tx.system.remark(remark));
    const tx = api.tx.utility.batchAll(txs);
    const { block } = await sendAndFinalize(tx, kp);
    console.log("NFT sent at block: ", block);
    return block;
}

export const sendRemark = async (remark: string) => {
    await cryptoWaitReady();
    const accounts = getKeys();
    const ws = WS_URL;
    const phrase = MNEMONIC_PHRASE;
    const kp = getKeyringFromUri(phrase);
    const api = await getApi(ws);

    const tx = api.tx.system.remark(remark);
    const { block } = await sendAndFinalize(tx, kp);
    console.log("NFT sent at block: ", block);
    return block;
}

export const sendAndFinalize = async (
    tx: SubmittableExtrinsic<"promise", ISubmittableResult>,
    account: KeyringPair
): Promise<{
    block: number;
    success: boolean;
    hash: CodecHash;
    included: any[];
    finalized: any[];
}> => {
    return new Promise(async (resolve) => {
        let success = false;
        let included: EventRecord[] = [];
        let finalized = [];
        let block = 0;
        let unsubscribe = await tx.signAndSend(
            account,
            async ({ events = [], status, dispatchError }) => {
                if (status.isInBlock) {
                    success = dispatchError ? false : true;
                    console.log(
                        `📀 Transaction ${tx.meta.name} included at blockHash ${status.asInBlock} [success = ${success}]`
                    );
                    const api = await getApi(WS_URL);
                    const signedBlock = await api.rpc.chain.getBlock(status.asInBlock);
                    block = signedBlock.block.header.number.toNumber();
                    included = [...events];
                } else if (status.isBroadcast) {
                    console.log(`🚀 Transaction broadcasted.`);
                } else if (status.isFinalized) {
                    console.log(
                        `💯 Transaction ${tx.meta.name}(..) Finalized at blockHash ${status.asFinalized}`
                    );
                    finalized = [...events];
                    let hash = status.hash;
                    unsubscribe();
                    resolve({ success, hash, included, finalized, block });
                } else if (status.isReady) {
                    // let's not be too noisy..
                } else {
                    console.log(`🤷 Other status ${status}`);
                }
            }
        );
    });
};
