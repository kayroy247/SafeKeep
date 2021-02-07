const About = () => {
  return (
    <main className="about-body">
      <div className="aboutUs-container">
        <h1>About Us</h1>
        <p><span className="subtitle">What happens to your Cryptocurrencies when you die?</span><br />
            This is the question that brought about SafeKeep. What happens to your cryptocurrencies when you die? What happens to your cryptocurrencies if you lose your key or your harddrive crashes?
            You should not lose access to your hard earned and valuable cryptos just like that.
            <br /> <br />
            With the SafeKeep Dapp, you can be rest assured that your crypto is not lost forever, no matter what happens.<br /><br />
          <span className="uk-text-bold">How do we ensure this you ask?, it's simple.</span><br />
            When depositing money into your SafeKeep Wallet, you are also mandated to supply a backup address, preferrably but not limited to a hardware wallet or a paper wallet that can be kept from disasters such as
            fire or a flood
            <br /><br />
          <span className="uk-text-bold">How do I get my crypto sent to my backup address if/when I lose access?</span><br />
            Once we notice that there is no transation on your account for 6 months from the date you performed your last transaction, then we send all your crypto holdings with us to your backup wallet.
            In a case where you don't want to perform any transactions for a long time but want us to know you still have access to your account, all you have to do is send a Ping from the Dapp.<br />
            Most importantly, you can choose to withdraw all your funds any time you want
            <br /><br />
          <span className="uk-text-bold">How do I get started?</span><br />
            We advise you use SafeKeep with Google Chrome browser and also download the MetaMask extension
            <a href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en" target="_blank" rel="noopener">here</a> and set it up (We'll add support for other wallets soon)<br />
            Once that is done, Click on the Connect button on the Navbar or homepage to connect your MetaMask wallet to SafeKeep Dapp<br />
            You should see a balance of 0 Eth if this is your first time; All you have to do now is click on the Withdraw button to open the Withdraw Modal<br />
            Enter the Amount you want to deposit and enter a valid backup address and then click on Deposit and wait for your transaction to be completed<br />
            Hurray! if you got a success message, then you have officially become a SafeKeep User!.
          </p>
      </div>
    </main>
  )
}

export default About;
