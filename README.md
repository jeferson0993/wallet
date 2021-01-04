<!-- PROJECT SHIELDS -->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]


<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://github.com/jeferson0993/wallet">
    <img src="https://user-images.githubusercontent.com/29678099/102724065-83263880-42eb-11eb-8625-37935126a86e.png" alt="Logo" width="80" height="80">
  </a>
  <h3 align="center">Jefinho - Bitcoin Web Wallet</h3>

  <p align="center">
    carteira bitcoin de código aberto
    <br />
    <br />
    <strong>Me pague um cafézinho</strong><br />
    <i>bc1qk2up2058008rwnh3jkyhhwfg7450nzmrk0ms4j</i>
    <br />
    <i>1PKTbhTEYe78EJUs4i3rkmNCtatNRMmUFb</i>
    <br />
    <br />
    <a href="https://jeferson0993.github.io/wallet/">Ir ao site</a>
    ·
    <a href="https://github.com/jeferson0993/wallet/issues">Reportar erro</a>
    ·
    <a href="https://github.com/jeferson0993/wallet/issues">Solicitar recurso</a>
  </p>
</p>

# Jefinho - Bitcoin Web Wallet

Jefinho Web Wallet is an open-source bitcoin web wallet written in html, css and javascript. All signatures are handled on the client-side and private keys never leave the browser.
To secure the account of users who login with an email and password rather than a private key, the wallet hashes the email and passsword 144,000 times, and then uses the final hash to create an address and private key in the end.
The wallet also enforces very strong passwords using a password strength meter to further secure the accounts against brute-force attacks.

# Hosting
This web wallet is hosted on github, and can be verified and accessed via the following links:

* https://jeferson0993.github.io/wallet/

To avoid becoming a victim of phishing attacks, make sure you always double check the domain in your browser's address bar. You can also download the wallet and run it locally. But you're still going to need Internet in order to transact with the blockchain.

# BTC Support
Bitcoin transactions are created and signed locally and then sent to the network using api(s) provided by https://blockchair.com/ - https://www.blockcypher.com is also used for following up on transaction details.

# Login With Your Private Key(s)
You can login with a Bitcoin private key. If you login with a Bitcoin private key, the wallet will generate a address using your Bitcoin private key. It is however highly recommended to use email and password to login if you intend to stash all your cryptos in the same wallet per se, and only use the login with private key feature to spend your paper or brain wallets.

# Transaction Fees
The wallet enforces a minimum of `0.0001 BTC` transaction fee and allows users to increase this fee. To help avoid situations in which ridiculously high fees are paid by accident, the wallet enforces a maximum of `0.01 BTC` transaction fee.

# Change Addresses
By default, all changes are sent back to the sender's address. To specify a custom change address, click on the link on the menu. You need to specify a custom change address everytime you login, to override the default behavior.

# Notes
* To copy your address, click on the copy link on the menu.
* To refresh your balance, click on the link on the menu.
* To view your balance in BRL reais, click on your balance.
* To specify a custom change address, click on the link on the menu.
* To change/adjust the transaction fee, click on the link on the menu.
* To copy your private key, click on the link on the menu.
* To donate, click on the donate link on the menu.

# License
Copyright (C) 2021 Jeferson Ferreira <br />
This software is provided as is and with no warranty under the MIT license.

# Donation Addresses
* BTC: `1E9xPAPifPFHmVTX1pDdPLcsgub71zdpDY`



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/jeferson0993/wallet.svg?style=flat-square
[contributors-url]: https://github.com/jeferson0993/wallet/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/jeferson0993/wallet.svg?style=flat-square
[forks-url]: https://github.com/jeferson0993/wallet/network/members
[stars-shield]: https://img.shields.io/github/stars/jeferson0993/wallet.svg?style=flat-square
[stars-url]: https://github.com/jeferson0993/wallet/stargazers
[issues-shield]: https://img.shields.io/github/issues/jeferson0993/wallet.svg?style=flat-square
[issues-url]: https://github.com/jeferson0993/wallet/issues
[license-shield]: https://img.shields.io/github/license/jeferson0993/wallet.svg?style=flat-square
[license-url]: https://github.com/jeferson0993/wallet/blob/master/LICENSE
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=flat-square&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/jeferson-ferreira-4a036b143/
[home-screenshot]: https://user-images.githubusercontent.com/29678099/71330655-f47eb000-250c-11ea-8f5c-3069b4c708f7.png
[add-screenshot]: https://user-images.githubusercontent.com/29678099/71330627-db75ff00-250c-11ea-8fe5-a2c1a02c1550.png
