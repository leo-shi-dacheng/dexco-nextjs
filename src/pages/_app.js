import { useEffect, useState } from 'react';
import App from 'next/app';
import crypto from 'crypto-browserify';
import * as wallet from '../wallet/index'; // 根据实际路径调整

function MyApp({ Component, pageProps }) {
  const [bridge, setBridge] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 仅在客户端动态导入 dsbridge
      import('../dsbridge').then((module) => {
        const Bridge = module.default || module; // 处理默认或命名导出
        setBridge(Bridge);
        console.log(Bridge, 'Bridge Bridge');
        // 设置全局变量
        window.Buffer = Buffer;
        window.process = process;
        window.$bridge = Bridge;
        window.$crypto = crypto;
        window.$wallet = wallet;
      }).catch(error => {
        console.error("加载 dsbridge 失败:", error);
      });
    }
  }, []);

  return <Component {...pageProps} />;
}

MyApp.getInitialProps = async (appContext) => {
  const appProps = await App.getInitialProps(appContext);
  return { ...appProps };
};

export default MyApp;