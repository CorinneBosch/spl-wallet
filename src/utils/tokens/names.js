import React, { useContext, useState, useEffect } from 'react';
import EventEmitter from 'events';
import {
  useConnectionConfig,
  MAINNET_URL,
  MAINNET_BACKUP_URL,
} from '../connection';
import { useListener } from '../utils';
import { clusterForEndpoint } from '../clusters';
import { useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import { TokenListProvider } from '@solana/spl-token-registry';

// This list is used for deciding what to display in the popular tokens list
// in the `AddTokenDialog`.
//
// Icons, names, and symbols are fetched not from here, but from the
// @solana/spl-token-registry. To add an icon or token name to the wallet,
// add the mints to that package. To add a token to the `AddTokenDialog`,
// add the `mintAddress` here. The rest of the fields are not used.
const POPULAR_TOKENS = {
  [MAINNET_URL]: [
    {
      tokenSymbol: 'BTC',
      mintAddress: '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E',
      tokenName: 'Bitcoin',
      icon:
        'https://merkle.space/coins/btc.png',
    },
    {
      tokenSymbol: 'ETH',
      mintAddress: '2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk',
      tokenName: 'Ethereum',
      icon:
        'https://merkle.space/coins/eth.png',
    },
    {
      tokenSymbol: 'USDT',
      mintAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
      tokenName: 'Tether USD',
      icon:
        'https://merkle.space/coins/usdt.png',
    },
    {
      tokenSymbol: 'USDC',
      mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      tokenName: 'USD Coin',
      icon:
        'https://merkle.space/coins/usdc.png',
    },
    {
      tokenSymbol: 'DAI',
      mintAddress: 'FYpdBuyAHSbdaAyD1sKkxyLWbAP8uUW9h6uvdhK74ij1',
      tokenName: 'DAI Stablecoin',
      icon:
        'https://merkle.space/coins/dai.png',
    },
    {
      tokenSymbol: 'SRM',
      mintAddress: 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt',
      tokenName: 'Serum Token',
      icon:
        'https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/ethereum/assets/0x476c5E26a75bd202a9683ffD34359C0CC15be0fF/logo.png',
    },
    {
      tokenSymbol: 'SKYW',
      mintAddress: '5wfyWAuqPRonenYy7oHnDKEt6onM1oiR4mKyyBf16yiP',
      tokenName: 'Emirates Skywards Miles',
      icon:
        'https://merkle.space/coins/skywards.png',
    },
    {
      tokenSymbol: 'BLINCbit',
      mintAddress: 'HGLJgzjT8zqxjSJs9rMzsJiLJQQZbC1pR3oWKQQymqKE',
      tokenName: 'BLINCbits',
      icon:
        'https://merkle.space/coins/blincbits.png',
    },
    {
      tokenSymbol: 'EUR',
      mintAddress: '6FeW5eWhiSV9gv6kWi6vvP2mPd6vCbPRJgckomNGyDFL',
      tokenName: 'Euro',
      icon: 'https://merkle.space/coins/eur.png'
    },
    {
      tokenSymbol: 'USD',
      mintAddress: 'DAFJA8fAzAkpG5AL62Ur3A8Rnmm9Pc5PuxrDhc66duhp',
      tokenName: 'US Dollar',
      icon: 'https://merkle.space/coins/usd.png'
    },
    {
      tokenSymbol: 'GBP',
      mintAddress: '6ieGSAoiELCUshdtviNNqyjHf9yzAYYLrPbkt2DS8Fps',
      tokenName: 'Pound Sterling',
      icon: 'https://merkle.space/coins/gbp.png'
    },
    {
      tokenSymbol: 'CHF',
      mintAddress: 'Fokk6YND2Bdw8A5jyaAyc9kmSLdU43EJktnGwheKvQos',
      tokenName: 'Swiss Franc',
      icon: 'https://merkle.space/coins/chf.png'
    },
    {
      tokenSymbol: 'AED',
      mintAddress: '2oiACYKFnJ53saZa5KfZBdBuatxvg7adDudzE12MujSk',
      tokenName: 'UAE Dirham',
      icon: 'https://merkle.space/coins/aed.png'
    },
    {
      tokenSymbol: 'MXN',
      mintAddress: '48ycUaghWVrV36xAXpXRnS7t8WHNeN6uko6fUCrix6xc',
      tokenName: 'Mexican Peso',
      icon: 'https://merkle.space/coins/mxn.png'
    },
    {
      tokenSymbol: 'BRL',
      mintAddress: 'HGLesEYj8s1z2fw3tBWWYZuvwEBK2sC9fK9bZtafWfrk',
      tokenName: 'Brazilian Real',
      icon: 'https://merkle.space/coins/brl.png'
    },
    {
      tokenSymbol: 'ARS',
      mintAddress: 'GXcDbzji5EnwZotKBx3YqXkBan7g9cBfFPxEzeusQSkA',
      tokenName: 'Argentine Peso',
      icon: 'https://merkle.space/coins/ars.png'
    },
    {
      tokenSymbol: 'COP',
      mintAddress: 'Af7MvTPSXfK4e7uWB5Sp8s3YfzmLpeE5kLNTyt8fGMVf',
      tokenName: 'Colombian Peso',
      icon: 'https://merkle.space/coins/cop.png'
    },
    {
      tokenSymbol: 'CAD',
      mintAddress: 'BopHKP146zUft8cspNonTz5uku5JEyAU8gHR9jcfvyC3',
      tokenName: 'Canadian Dollar',
      icon: 'https://merkle.space/coins/cad.png'
    },
    {
      tokenSymbol: 'SGD',
      mintAddress: '83K369p4FEetAkLGyC1gDM3CGMfdjNjZPT7hyRTiUpDi',
      tokenName: 'Singapore Dollar',
      icon: 'https://merkle.space/coins/sgd.png'
    },
    {
      tokenSymbol: 'HKD',
      mintAddress: 'WV8mhvVLGUkdGsTLrhgxfFMfz9oF5V6DYRZZN34xiUS',
      tokenName: 'Hong Kong Dollar',
      icon: 'https://merkle.space/coins/hkd.png'
    },
    {
      tokenSymbol: 'JPY',
      mintAddress: '6gBa5QqnQKaPWYK2H7rkgv5zTbXAUVUKgt8zFyZk1mXB',
      tokenName: 'Japanese Yen',
      icon: 'https://merkle.space/coins/jpy.png'
    },
    {
      tokenSymbol: 'AUD',
      mintAddress: '35sNCECgpQK9PLUPHQyamoaXDnPiZU7U2Wd3zukPKCRf',
      tokenName: 'Australian Dollar',
      icon: 'https://merkle.space/coins/aud.png'
    },
    {
      tokenSymbol: 'ILS',
      mintAddress: 'DC9Bh7gwwLBLXavve12Cy7Km3k8dwr7dx3hqCf34ZE5s',
      tokenName: 'Israeli Shekel',
      icon: 'https://merkle.space/coins/ils.png'
    },
    {
      tokenSymbol: 'SAR',
      mintAddress: 'GPjZXXK5rjtw3w2gWMainVNSTkhzJP6Ra8igrbKXvBwk',
      tokenName: 'Saudi Arabian Riyal',
      icon: 'https://merkle.space/coins/sar.png'
    },
    {
      tokenSymbol: 'NOK',
      mintAddress: '4KoK1JjigDAUbu4frgVBiD9izNd6M6vt4ijBotmcVUAw',
      tokenName: 'Norwegian Krone',
      icon: 'https://merkle.space/coins/nok.png'
    },
    {
      tokenSymbol: 'SEK',
      mintAddress: 'AxMhcUDbfXvuXd5DuQniQhuuFe1o3uHCnzSfKef6nMho',
      tokenName: 'Swedish Krona',
      icon: 'https://merkle.space/coins/sek.png'
    },
    {
      tokenSymbol: 'DKK',
      mintAddress: '9oE6oaVZ7DQaqxxaVHPtSt1WNu6nEsJVna6b5Rw1Vb7Z',
      tokenName: 'Danish Krone',
      icon: 'https://merkle.space/coins/dkk.png'
    },
    {
      tokenSymbol: 'CLP',
      mintAddress: '6a6ELSVhNUBVrhV5Xf9pkeQH9e8uHSxNjUuuz1AsGXe',
      tokenName: 'Chilean Peso',
      icon: 'https://merkle.space/coins/clp.png'
    },
    {
      tokenSymbol: 'PHP',
      mintAddress: 'FeT1wF3jDDdKH4Y3Gu6BrDcyeGFqtg2AEydS7YkHUpqa',
      tokenName: 'Philippine Peso',
      icon: 'https://merkle.space/coins/php.png'
    },
    {
      tokenSymbol: 'INR',
      mintAddress: '4zKqWK65fu3wmkweYrgv3DXubJbcEFujfHSNUZzN7XcS',
      tokenName: 'Indian Rupee',
      icon: 'https://merkle.space/coins/inr.png'
    },
    {
      tokenSymbol: 'BDT',
      mintAddress: '7goHaTunWdZWE3vRGgmufYg9zSgKp2BFFrwB6kp43BpH',
      tokenName: 'Bangladeshi Taka',
      icon: 'https://merkle.space/coins/bdt.png'
    },
    {
      tokenSymbol: 'THB',
      mintAddress: '14XnWw1vAko4wGhkvE4FU7DMkCg1qwNoKXuhiCoE7p6q',
      tokenName: 'Thai Baht',
      icon: 'https://merkle.space/coins/thb.png'
    },
  ],
};

const TokenListContext = React.createContext({});

export function useTokenInfos() {
  const { tokenInfos } = useContext(TokenListContext);
  return tokenInfos;
}

export function TokenRegistryProvider(props) {
  const { endpoint } = useConnectionConfig();
  const [tokenInfos, setTokenInfos] = useState(null);
  useEffect(() => {
    if (endpoint !== MAINNET_BACKUP_URL && endpoint !== MAINNET_URL) return;
    const tokenListProvider = new TokenListProvider();
    tokenListProvider.resolve().then((tokenListContainer) => {
      const cluster = clusterForEndpoint(endpoint);

      const filteredTokenListContainer = tokenListContainer?.filterByClusterSlug(
        cluster?.clusterSlug,
      );
      const tokenInfos =
        tokenListContainer !== filteredTokenListContainer
          ? filteredTokenListContainer?.getList()
          : null; // Workaround for filter return all on unknown slug
      setTokenInfos(tokenInfos);
    });
  }, [endpoint]);

  return (
    <TokenListContext.Provider value={{ tokenInfos }}>
      {props.children}
    </TokenListContext.Provider>
  );
}

const customTokenNamesByNetwork = JSON.parse(
  localStorage.getItem('tokenNames') ?? '{}',
);

const nameUpdated = new EventEmitter();
nameUpdated.setMaxListeners(100);

export function useTokenInfo(mint) {
  const { endpoint } = useConnectionConfig();
  useListener(nameUpdated, 'update');
  const tokenInfos = useTokenInfos();
  return getTokenInfo(mint, endpoint, tokenInfos);
}

export function getTokenInfo(mint, endpoint, tokenInfos) {
  if (!mint) {
    return { name: null, symbol: null };
  }

  let info = customTokenNamesByNetwork?.[endpoint]?.[mint.toBase58()];
  let match = tokenInfos?.find(
    (tokenInfo) => tokenInfo.address === mint.toBase58(),
  );

  if (match) {
    if (!info) {
      info = { ...match, logoUri: match.logoURI };
    }
    // The user has overridden a name locally.
    else {
      info = { ...match, ...info, logoUri: match.logoURI };
    }
  }
  return { ...info };
}

export function useUpdateTokenName() {
  const { endpoint } = useConnectionConfig();
  return useCallback(
    function updateTokenName(mint, name, symbol) {
      if (!name || !symbol) {
        if (name) {
          symbol = name;
        } else if (symbol) {
          name = symbol;
        } else {
          return;
        }
      }
      if (!customTokenNamesByNetwork[endpoint]) {
        customTokenNamesByNetwork[endpoint] = {};
      }
      customTokenNamesByNetwork[endpoint][mint.toBase58()] = { name, symbol };
      localStorage.setItem(
        'tokenNames',
        JSON.stringify(customTokenNamesByNetwork),
      );
      nameUpdated.emit('update');
    },
    [endpoint],
  );
}
// Returns tokenInfos for the popular tokens list.
export function usePopularTokens() {
  const tokenInfos = useTokenInfos();
  const { endpoint } = useConnectionConfig();
  return (!POPULAR_TOKENS[endpoint]
    ? []
    : POPULAR_TOKENS[endpoint]
  ).map((tok) =>
    getTokenInfo(new PublicKey(tok.mintAddress), endpoint, tokenInfos),
  );
}
