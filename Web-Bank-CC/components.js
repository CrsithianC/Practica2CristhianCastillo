"use strict";

function Actions(props) {
    const [depositVal, setDepositVal] = React.useState("0");
    const [withdrawVal, setWithdrawVal] = React.useState("0");
    const [transferVal, setTransferVal] = React.useState("0");
    const [recipient, setRecipient] = React.useState("");
    const [overdraftLimit, setOverdraftLimit] = React.useState("0.1"); // Límite de descubierto en ETH

    async function deposit() {
        const wallet = props.wallet;
        await BANK.methods.deposit().send({
            from: wallet,
            value: web3.utils.toWei(depositVal, 'ether')
        });
        setDepositVal("0");
        props.refresh(wallet);
    }

    async function withdraw() {
        const wallet = props.wallet;
        const bankBalanceVal = await BANK.methods.getBalance(wallet).call();
        const bankBalance = web3.utils.fromWei(bankBalanceVal, 'ether');

        if (parseFloat(withdrawVal) > parseFloat(bankBalance) + parseFloat(overdraftLimit)) {
            alert("Error: Exceeds overdraft limit!");
            return;
        }

        await BANK.methods.withdraw(web3.utils.toWei(withdrawVal, 'ether')).send({
            from: wallet
        });
        setWithdrawVal("0");
        props.refresh(wallet);
    }

    async function transfer() {
        const wallet = props.wallet;
        const bankBalanceVal = await BANK.methods.getBalance(wallet).call();
        const bankBalance = web3.utils.fromWei(bankBalanceVal, 'ether');

        if (parseFloat(transferVal) > parseFloat(bankBalance) + parseFloat(overdraftLimit)) {
            alert("Error: Exceeds overdraft limit!");
            return;
        }

        await BANK.methods.transfer(recipient, web3.utils.toWei(transferVal, 'ether')).send({
            from: wallet
        });
        setTransferVal("0");
        setRecipient("");
        props.refresh(wallet);
    }

    return (
        <div>
            <div>
                <h2>Deposit Process</h2>
                <input type="number" value={depositVal} onChange={e => setDepositVal(e.target.value)} />
                <button onClick={deposit}>Deposit</button>
            </div>
            
            <div>
                <h2>Withdraw Process</h2>
                <input type="number" value={withdrawVal} onChange={e => setWithdrawVal(e.target.value)} />
                <button onClick={withdraw}>Withdraw</button>
            </div>

            <div>
                <h2>Transfer Process</h2>
                <input type="text" placeholder="Recipient Address" value={recipient} onChange={e => setRecipient(e.target.value)} />
                <input type="number" value={transferVal} onChange={e => setTransferVal(e.target.value)} />
                <button onClick={transfer}>Transfer</button>
            </div>
        </div>
    );
}

function Main(props) {
    const [wallet, setWallet] = React.useState("");
    const [ethBalance, setEthBalance] = React.useState("");
    const [bankBalance, setBankBalance] = React.useState("");

    async function refreshBalances(wallet) {
        const balanceVal = await web3.eth.getBalance(wallet);
        setEthBalance(web3.utils.fromWei(balanceVal, 'ether'));
        const bankBalanceVal = await BANK.methods.getBalance(wallet).call();
        setBankBalance(web3.utils.fromWei(bankBalanceVal, 'ether'));
    }

    async function connectToMetamask() {
        try {
            const savedWallet = localStorage.getItem("Web3Login");
            if (savedWallet) {
                setWallet(savedWallet);
                await refreshBalances(savedWallet);
            }
        } catch (error) {}

        const wallets = await METAMASK.request({ method: 'eth_requestAccounts' });
        await METAMASK.request({ method: 'wallet_addEthereumChain', params: [NETWORK] });
        const wallet = wallets.length > 0 ? wallets[0] : null;
        setWallet(wallet);
        localStorage.setItem("Web3Login", wallet);
        await refreshBalances(wallet);
    }

    return (
        <div>
            <img src="https://keepcoding.io/wp-content/uploads/2022/01/cropped-logo-keepcoding-Tech-School.png" alt="Keepcoding Logo" />
            <h1>Welcome to Keepcoding Bank</h1>
            {
                wallet ? (
                    <section>
                        <p><b>Wallet</b> = {wallet}</p>
                        <p><b>Wallet Balance</b> = {ethBalance} ETH</p>
                        <p><b>Bank Balance</b> = {bankBalance} ETH</p>
                        <Actions wallet={wallet} refresh={refreshBalances} />
                    </section>
                ) : (
                    <section>
                        <p>Welcome to your bank! It is time to connect your wallet.</p>
                        <button onClick={connectToMetamask}>Connect to Metamask</button>
                    </section>
                )
            }
        </div>
    );
}
