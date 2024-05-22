import "@stdlib/deploy";

message Withdraw {
    amount: Int as coins;
}

contract SendCoins with Deployable {

    const MinTonForStorage: Int = ton("0.01");
    deployer: Address;

    init() {
        self.deployer = sender();        
    }

    // accept incoming TON transfers
    receive() {

    }

    // withdraw the entire balance of the contract, leaving 0
    receive("withdraw all") {
        require(sender() == self.deployer, "Only the deployer is allowed to withdraw");
        send(
            SendParameters{
                to: sender(),
                bounce: true,
                value: 0,
                mode: SendRemainingBalance + SendIgnoreErrors
            }
        );
    }

    // withdraw the entire balance but leave 0.01 TON for storage rent costs
    receive("withdraw safe") {
        require(sender() == self.deployer, "Only the deployer is allowed to withdraw");
        send(
            SendParameters{
                to: sender(),
                bounce: true,
                value: myBalance() - context().value - self.MinTonForStorage,
                mode: SendRemainingValue + SendIgnoreErrors
            }
        );
    }

    // withdraw a specific amount but leave 0.01 for storage rent costs
    receive(msg: Withdraw) {
        require(sender() == self.deployer, "Only the deployer is allowed to withdraw");
        let amount: Int = min(msg.amount, myBalance() - context().value - self.MinTonForStorage);
        require(amount > 0, "Insufficient balance");
        send(
            SendParameters{
                to: sender(),
                bounce: true,
                value: amount,
                mode: SendRemainingValue + SendIgnoreErrors
            }
        );
    }

    get fun balance(): String {
        return myBalance().toCoinsString();
    }

}
