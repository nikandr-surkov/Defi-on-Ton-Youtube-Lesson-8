import { toNano } from '@ton/core';
import { SendCoins } from '../wrappers/SendCoins';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const sendCoins = provider.open(await SendCoins.fromInit());

    await sendCoins.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(sendCoins.address);

    // run methods on `sendCoins`
}
