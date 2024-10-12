// components/AppComponent.js
import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { Erc20ABI } from '@/assets/abi/Erc20ABI';
import { FuturesMarginPool } from '@/assets/abi/FuturesMarginPool';

import {
  CreateMnemonic,
  CreateAddress,
  MnemonicToSeed,
  PrivateKeyToAddress,
  SignTransaction,
  ValidateMnemonic
} from '@/wallet/index';

const BitcoinSeries = ['Bitcoin', 'Litecoin', 'BitcoinCash'];

const AppComponent = () => {
  const [message, setMessage] = useState('Waiting for response...');
  let provider = null;
  let web3 = null;
  let contract = null;
  let address = '';
  let chainId = '';

  useEffect(() => {
    bindFunction();
    getConnectStatus();
    setTimeout(() => {
      console.log(window.$bridge, 'window.$bridge windowwindow');
      if (window.$bridge) {
        // Register methods on the bridge
        window.$bridge.registermethod('createMnemonic', () => {
          return createMnemonic();
        });
        window.$bridge.registermethod('creatAddress', (mnemonic, chain) => {
          return creatAddress(mnemonic, chain);
        });

        window.$bridge.registermethod('validateMnemonic', (mnemonic) => {
          return validateMnemonic(mnemonic);
        });

        window.$bridge.registermethod('privateKeyToAddress', (privateKey, chain) => {
          return privateKeyToAddress(privateKey, chain);
        });

        window.$bridge.registermethod('MnemonicToSeed', (mnemonic) => {
          return MnemonicToSeed(mnemonic);
        });

        window.$bridge.registerAsynmethod('signTransactionEthereum', (privateKey, nonce, fromAd, toAd, gasLimit, amount, gasPrice, decimal, chainId, tokenAddress) => {
          return signTransactionEthereum(privateKey, nonce, fromAd, toAd, gasLimit, amount, gasPrice, decimal, chainId, tokenAddress);
        });

        window.$bridge.registerAsynmethod('signTransactionBitcoin', (inputs, outputs, privateKey) => {
          return signTransactionBitcoin(inputs, outputs, privateKey);
        });

        window.$bridge.registerAsynmethod('signTransaction', (chainName, params) => {
          return signTransaction(chainName, params);
        });

        // Example test calls
        var s = creatAddress("lounge face pattern cinnamon shrug average spend rapid field cheese wrist weather", 'Sui');
        console.log('sui creatAddress', s);
      }
    }, 1000)

  }, []);

  function postMessage(data) {
    try {
      // eslint-disable-next-line no-undef
      connectState.postMessage(JSON.stringify(data));
    } catch (e) {
      // console.log(e)
    }
  }

  async function getConnectStatus() {
    const walletconnect = window.localStorage.getItem('walletconnect');
    if (walletconnect) {
      const connectJson = JSON.parse(walletconnect);
      if (connectJson.connected) {
        connectWallet();
      }
    }
  }

  function bindFunction() {
    window.setPage = setPage;
    window.connectWallet = connectWallet;
    window.getWalletBalace = getWalletBalace;
    window.sign = sign;
    window.deposit = deposit;
    window.disconnect = disconnect;
    window.createMnemonic = createMnemonic;
  }

  function createMnemonic() {
    const params = {
      number: 12,
      language: "english"
    };
    try {
      const mnemonic = CreateMnemonic(params);
      return JSON.stringify({
        data: mnemonic,
        iserror: false,
        msg: ""
      });
    } catch (e) {
      return JSON.stringify({
        data: null,
        iserror: true,
        msg: e
      });
    }
  }

  function creatAddress(mnemonic, chain) {
    const params_1 = {
      mnemonic: mnemonic,
      password: ""
    };
    const seed = MnemonicToSeed(params_1);

    const param = {
      seedHex: seed.toString("hex"),
      chain: chain,
      index: "0",
      receiveOrChange: "0",
      network: "mainnet"
    };
    try {
      const account = CreateAddress(param);
      return JSON.stringify({
        data: account,
        iserror: false,
        msg: ""
      });
    } catch (e) {
      return JSON.stringify({
        data: null,
        iserror: true,
        msg: e
      });
    }
  }

  function validateMnemonic(mnemonic) {
    const params = {
      mnemonic: mnemonic,
      language: "english"
    };
    try {
      const isValid = ValidateMnemonic(params);
      return JSON.stringify({
        data: isValid,
        iserror: false,
        msg: ""
      });
    } catch (e) {
      return JSON.stringify({
        data: null,
        iserror: true,
        msg: e
      });
    }
  }

  function MnemonicToSeed(mnemonic) {
    const params_1 = {
      mnemonic: mnemonic,
      password: ""
    };

    const seed = MnemonicToSeed(params_1);
    const param = {
      seedHex: seed.toString("hex"),
      chain: "Bitcoin",
      index: "0",
      receiveOrChange: "0",
      network: "mainnet"
    };
    try {
      const account = CreateAddress(param);
      return JSON.stringify({
        data: account,
        iserror: false,
        msg: ""
      });
    } catch (e) {
      return JSON.stringify({
        data: null,
        iserror: true,
        msg: e
      });
    }
  }

  function privateKeyToAddress(privateKey, chain) {
    if (BitcoinSeries.includes(chain)) {
      const params = {
        privateKey: privateKey,
        network: "mainnet"
      };
      try {
        const account = PrivateKeyToAddress(chain, params);
        console.log(account);
        return JSON.stringify({
          data: account,
          iserror: false,
          msg: ""
        });
      } catch (e) {
        return JSON.stringify({
          data: null,
          iserror: true,
          msg: e
        });
      }
    } else {
      try {
        const account = PrivateKeyToAddress(chain, privateKey);
        return JSON.stringify({
          data: account,
          iserror: false,
          msg: ""
        });
      } catch (e) {
        return JSON.stringify({
          data: null,
          iserror: true,
          msg: e
        });
      }
    }
  }

  async function signTransaction(chainName, params) {
    try {
      let data1 = await SignTransaction(chainName, params);
      window.$bridge.callmethod('signTransaction', JSON.stringify({
        data: data1,
        iserror: false,
        msg: ""
      }));
    } catch (error) {
      window.$bridge.callmethod('signTransaction', JSON.stringify({
        data: null,
        iserror: true,
        msg: error.message || error
      }));
    }
  }

  async function signTransactionEthereum(privateKey, nonce, fromAd, toAd, gasLimit, amount, gasPrice, decimal, chainId, tokenAddress) {
    const params = {
      privateKey: privateKey,
      nonce: parseInt(nonce, 10),
      from: fromAd,
      to: toAd,
      gasLimit: parseInt(gasLimit, 10),
      amount: amount,
      gasPrice: parseInt(gasPrice, 10),
      decimal: parseInt(decimal, 10),
      chainId: parseInt(chainId, 10),
      tokenAddress: tokenAddress
    };
    try {
      let data1 = await SignTransaction("Ethereum", params);
      console.log('After awaiting SignTransaction');
      console.log(`data1 ${data1}`);
      window.$bridge.callmethod('signTransactionEthereum', JSON.stringify({
        data: data1,
        iserror: false,
        msg: ""
      }));
    } catch (e) {
      window.$bridge.callmethod('signTransactionEthereum', JSON.stringify({
        data: null,
        iserror: true,
        msg: e
      }));
    }
  }

  async function signTransactionBitcoin(inputs, outputs, privateKey) {
    if (!inputs || !outputs) {
      return { error: "Invalid request, inputs or outputs missing" };
    }
    console.log("old" + privateKey);
    if (privateKey.startsWith("0x")) {
      privateKey = privateKey.slice(2);
    }
    if (privateKey.length == 52) {
      privateKey = wifTohex(privateKey);
    }
    console.log("new" + privateKey);
    const data = {
      inputs: inputs.map(input => ({
        address: input.address,
        txid: input.txid,
        amount: parseInt(input.amount, 10),
        vout: parseInt(input.vout, 10),
      })),
      outputs: outputs.map(output => ({
        amount: parseInt(output.amount, 10),
        address: output.address,
      })),
    };

    const signParams = {
      privateKey: privateKey,
      signObj: data,
      network: 'mainnet'
    };

    const signedTransaction = await SignTransaction("Bitcoin", signParams);
    window.$bridge.callmethod('signTransactionBitcoin', JSON.stringify({
      data: signedTransaction,
      iserror: false,
      msg: ""
    }));
  }

  function bindEvents() {
    provider.on('accountsChanged', (accounts) => {
      if (accounts.length) {
        if (accounts[0] !== address) {
          getWalletInfo();
        }
      }
    });

    provider.on('chainChanged', (chainId) => {
      const chainIdNum = web3.utils.hexToNumber(chainId);
      if (chainIdNum !== chainId) {
        getWalletInfo();
      }
    });

    provider.on('disconnect', () => {
      postMessage({
        code: -1,
        data: null,
      });
    });
  }

  function setPage(title, logo) {
    document.title = title;
    const link = document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = logo;
    document.getElementsByTagName('head')[0].appendChild(link);
  }

  async function connectWallet() {
    try {
      const web3Modal = new Web3Modal({
        network: '',
        cacheProvider: true,
        providerOptions: {
          injected: {
            display: {
              name: 'MetaMask',
              description: '连接钱包',
            },
          },
          walletconnect: {
            package: WalletConnectProvider,
            options: {
              infuraId: '48c1b5f07c7444478cf268b47df23512',
              rpc: {
                56: 'https://bsc-dataseed.binance.org',
                137: 'https://rpc.ankr.com/polygon',
                80001: 'https://matic-mumbai.chainstacklabs.com',
              },
            },
          },
        },
        mobileWallets: [
          {
            id: "38f5d18bd8522c244bdd70cb4a68e0e718865155811c043f052fb9f1c51de662",
            name: "bitkeep",
            links: {
              native: "bitkeep://",
              universal: "chainupdex://",
            },
          },
        ],
        walletImages: {
          bitkeep: "/images/bitkeep.webp",
        },
        defaultChain: 'polygon'
      });
      provider = await web3Modal.connect();
      await provider.enable();
      web3 = new Web3(provider);
      bindEvents();
      getWalletInfo();
    } catch (e) {
      postMessage({
        code: 400,
        error: e,
      });
    }
  }

  async function getWalletInfo() {
    try {
      const accounts = await web3.eth.getAccounts();
      [address] = accounts;
      chainId = await web3.eth.getChainId();
      postMessage({
        code: 2,
        data: {
          chainId: chainId,
          address: address,
        },
      });
    } catch (e) {
      postMessage({
        code: 400,
        error: e,
      });
    }
  }

  function disconnect() {
    provider.disconnect();
  }

  async function getWalletBalace(token) {
    try {
      let balance = 0;
      const contract = new web3.eth.Contract(Erc20ABI, token);
      const decimals = await contract.methods.decimals().call();
      const res = await contract.methods.balanceOf(address).call({ from: address });
      if (Number(res) !== 0) {
        balance = res / (10 ** decimals);
      }
      postMessage({
        code: 3,
        data: balance,
      });
    } catch (e) {
      postMessage({
        code: 400,
        error: e,
      });
    }
  }

  async function sign(companyId) {
    try {
      const chainIdHex = web3.utils.toHex(chainId).replace('0x', '').padStart(64, '0');
      const companyIdHex = web3.utils.toHex(companyId).replace('0x', '').padStart(64, '0');
      const addressHex = address.replace('0x', '').padStart(64, '0');
      const info = `0xaf3067cecdd428dab67b65fe3e0abb5ab731f2a7ad725daf7ca5791e0f693e32${chainIdHex}${companyIdHex}${addressHex}70476298be4a08e9feb87508662fa44d0dbe18806f809cb0fe7fe3f8915529fb`;
      const message = web3.utils.sha3(info.toLowerCase()).replace('0x', '');
      const signData = web3.utils.sha3(`0x1901${message}`);
      const res = await web3.eth.personal.sign(signData, address, '');
      if (res) {
        postMessage({
          code: 4,
          data: res,
        });
      } else {
        postMessage({
          code: 400,
          error: '',
        });
      }
    } catch (e) {
      postMessage({
        code: 400,
        error: e,
      });
    }
  }

  async function deposit(amount, token, poolAddress, recordHash) {
    try {
      contract = new web3.eth.Contract(Erc20ABI, token);
      const allowBalance = await contract.methods.allowance(address, poolAddress).call();
      const decimals = await contract.methods.decimals().call();
      const balanceAmount = allowBalance / (10 ** decimals);
      if (balanceAmount && Number(balanceAmount) >= Number(amount)) {
        confirmDeposit(amount, poolAddress, recordHash);
      } else {
        const number = web3.utils.toWei('100000000000000000000000000', 'ether');
        const approveRes = await contract.methods.approve(poolAddress, number).send({ from: address });
        if (approveRes) {
          confirmDeposit(amount, poolAddress, recordHash);
        } else {
          postMessage({
            code: 400,
            error: '',
          });
        }
      }
    } catch (e) {
      postMessage({
        code: 400,
        error: e,
      });
    }
  }

  async function confirmDeposit(amount, poolAddress, recordHash) {
    try {
      const poolContract = new web3.eth.Contract(FuturesMarginPool, poolAddress);
      const decimals = await contract.methods.decimals().call();
      const num = toNumberStr(amount * (10 ** decimals));
      const res = await poolContract.methods.deposit(num, recordHash).send({ from: address });
      if (res) {
        postMessage({
          code: 5,
          data: res.transactionHash,
        });
      } else {
        postMessage({
          code: 400,
          error: '',
        });
      }
    } catch (e) {
      postMessage({
        code: 400,
        error: e,
      });
    }
  }

  function toNumberStr(val) {
    const numStr = val.toFixed(0).toString();
    if (numStr.indexOf('e') > -1) {
      const [num, index] = numStr.split('e+');
      const float = num.indexOf('.') > -1 ? num.split('.')[1].length : 0;
      const intStr = (num * (10 ** float)).toFixed(0).toString();
      return intStr.padEnd(Number(index) + 1, '0');
    }
    return numStr;
  }

  return (
    <div id="app">
      {/* Your UI components go here */}
    </div>
  );
};

export default AppComponent;