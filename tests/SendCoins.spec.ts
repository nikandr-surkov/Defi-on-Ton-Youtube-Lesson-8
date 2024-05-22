import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { SendCoins } from '../wrappers/SendCoins';
import '@ton/test-utils';

describe('SendCoins', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let sendCoins: SandboxContract<SendCoins>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        sendCoins = blockchain.openContract(await SendCoins.fromInit());

        deployer = await blockchain.treasury('deployer');

        const deployResult = await sendCoins.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: sendCoins.address,
            deploy: true,
            success: true,
        });

        const sendResult = await sendCoins.send(
            deployer.getSender(),
            {
                value: toNano('1')
            },
            null
        );

        expect(sendResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: sendCoins.address,
            success: true
        });

    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and sendCoins are ready to use
    });

    it('should withdraw all balance', async () => {
        let balance = await sendCoins.getBalance();
        console.log(`Balance before withdraw all: ${balance}`);

        const withdrawResult = await sendCoins.send(
            deployer.getSender(),
            {
                value: toNano('0.01')
            },
            'withdraw all'
        );

        expect(withdrawResult.transactions).toHaveTransaction({
            from: sendCoins.address,
            to: deployer.address,
            success: true
        });

        balance = await sendCoins.getBalance();
        console.log(`Balance after withdraw all: ${balance}`);
        expect(balance).toBe('0');
    });

    it('should withdraw balance but leave safe amount for storage', async () => {
        let balance = await sendCoins.getBalance();
        console.log(`Balance before withdraw safe: ${balance}`);

        const withdrawSafeResult = await sendCoins.send(
            deployer.getSender(),
            {
                value: toNano('0.01')
            },
            'withdraw safe'
        );

        expect(withdrawSafeResult.transactions).toHaveTransaction({
            from: sendCoins.address,
            to: deployer.address,
            success: true
        });

        balance = await sendCoins.getBalance();
        console.log(`Balance after withdraw safe: ${balance}`);
        expect(parseFloat(balance)).toBeCloseTo(0.01, 2);
    });

    it('should withdraw specific amount but leave safe amount for storage', async () => {
        const withdrawAmount = toNano('0.03');

        let balance = await sendCoins.getBalance();
        console.log(`Balance before withdraw specific: ${balance}`);

        const withdrawSpecificResult = await sendCoins.send(
            deployer.getSender(),
            {
                value: toNano('0.01')
            },
            {
                $$type: 'Withdraw',
                amount: withdrawAmount
            }
        );

        expect(withdrawSpecificResult.transactions).toHaveTransaction({
            from: sendCoins.address,
            to: deployer.address,
            success: true
        });

        balance = await sendCoins.getBalance();
        console.log(`Balance after withdraw specific: ${balance}`);
        expect(parseFloat(balance)).toBeGreaterThanOrEqual(0.01);
    });

});
