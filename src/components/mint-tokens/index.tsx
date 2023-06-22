import React from "react";
import { createPortal } from "react-dom";
import {
  Card,
  Caption,
  Layout,
  Notification,
  Profile,
  Loader,
} from "@stellar/design-system";
import {
  StellarWalletsKit,
  WalletNetwork,
  WalletType,
  ISupportedWallet,
} from "stellar-wallets-kit";

import { FUTURENET_DETAILS } from "../../helpers/network";
import { ERRORS } from "../../helpers/error";
import {
  getTxBuilder,
  BASE_FEE,
  XLM_DECIMALS,
  getTokenDecimals,
  getTokenSymbol,
  getServer,
  submitTx,
} from "../../helpers/soroban";

import { TxResult } from "./tx-result";
import { SubmitToken } from "./token-submit";
import { ConfirmMintTx } from "./token-confirmation";
import { TokenTransaction } from "./token-transaction";
import { TokenQuantity } from "./token-quantity";
import { TokenInput } from "./token-input";
import { TokenDest } from "./token-destination";
import { ConnectWallet } from "./connect-wallet";

import "./index.scss";

type StepCount = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

interface MintTokenProps {
  hasHeader?: boolean;
}

export const MintToken = (props: MintTokenProps) => {
  const hasHeader = props.hasHeader === undefined ? true : props.hasHeader;
  const [selectedNetwork] = React.useState(FUTURENET_DETAILS);
  const [activePubKey, setActivePubKey] = React.useState(null as string | null);
  const [stepCount, setStepCount] = React.useState(1 as StepCount);
  const [connectionError, setConnectionError] = React.useState(
    null as string | null,
  );

  const [fee, setFee] = React.useState(BASE_FEE);
  const [memo, setMemo] = React.useState("");

  const [isLoadingTokenDetails, setIsLoadingTokenDetails] =
    React.useState<boolean>(false);

  const [tokenId, setTokenId] = React.useState("");
  const [tokenDecimals, setTokenDecimals] = React.useState(XLM_DECIMALS);
  const [tokenDestination, setTokenDestination] = React.useState("");
  const [tokenSymbol, setTokenSymbol] = React.useState("");
  const [quantity, setQuantity] = React.useState("");
  const [txResultXDR, setTxResultXDR] = React.useState("");
  const [signedXdr, setSignedXdr] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [SWKKit] = React.useState(
    new StellarWalletsKit({
      network: selectedNetwork.networkPassphrase as WalletNetwork,
      selectedWallet: WalletType.FREIGHTER,
    }),
  );

  React.useEffect(() => {
    SWKKit.setNetwork(selectedNetwork.networkPassphrase as WalletNetwork);
  }, [selectedNetwork.networkPassphrase, SWKKit]);

  async function setToken(id: string) {
    setIsLoadingTokenDetails(true);
    setTokenId(id);

    const server = getServer(selectedNetwork);

    try {
      const txBuilderAdmin = await getTxBuilder(
        activePubKey!,
        BASE_FEE,
        server,
        selectedNetwork.networkPassphrase,
      );

      const symbol = await getTokenSymbol(id, txBuilderAdmin, server);
      setTokenSymbol(symbol);

      const txBuilderDecimals = await getTxBuilder(
        activePubKey!,
        BASE_FEE,
        server,
        selectedNetwork.networkPassphrase,
      );
      const decimals = await getTokenDecimals(id, txBuilderDecimals, server);
      setTokenDecimals(decimals);
      setIsLoadingTokenDetails(false);

      return true;
    } catch (error) {
      console.log(error);
      setConnectionError("Unable to fetch token details.");
      setIsLoadingTokenDetails(false);

      return false;
    }
  }

  function renderStep(step: StepCount) {
    switch (step) {
      case 8: {
        const onClick = () => setStepCount(1);
        return <TxResult onClick={onClick} resultXDR={txResultXDR} />;
      }
      case 7: {
        const submit = async () => {
          const server = getServer(selectedNetwork);

          setIsSubmitting(true);

          try {
            const result = await submitTx(
              signedXdr,
              selectedNetwork.networkPassphrase,
              server,
            );

            setTxResultXDR(result);
            setIsSubmitting(false);

            setStepCount((stepCount + 1) as StepCount);
          } catch (error) {
            console.log(error);
            setIsSubmitting(false);
            setConnectionError(ERRORS.UNABLE_TO_SUBMIT_TX);
          }
        };
        return (
          <SubmitToken
            network={selectedNetwork.network}
            destination={tokenDestination}
            quantity={quantity}
            tokenSymbol={tokenSymbol}
            fee={fee}
            signedXdr={signedXdr}
            isSubmitting={isSubmitting}
            memo={memo}
            onClick={submit}
          />
        );
      }
      case 6: {
        const setSignedTx = (xdr: string) => {
          setSignedXdr(xdr);
          setStepCount((stepCount + 1) as StepCount);
        };
        return (
          <ConfirmMintTx
            tokenId={tokenId}
            pubKey={activePubKey!}
            tokenSymbol={tokenSymbol}
            onTxSign={setSignedTx}
            destination={tokenDestination}
            quantity={quantity}
            fee={fee}
            memo={memo}
            networkDetails={selectedNetwork}
            tokenDecimals={tokenDecimals}
            kit={SWKKit}
            setError={setConnectionError}
          />
        );
      }
      case 5: {
        const onClick = () => setStepCount((stepCount + 1) as StepCount);
        return (
          <TokenTransaction
            fee={fee}
            memo={memo}
            onClick={onClick}
            setFee={setFee}
            setMemo={setMemo}
          />
        );
      }
      case 4: {
        const onClick = () => setStepCount((stepCount + 1) as StepCount);
        return (
          <TokenQuantity
            quantity={quantity}
            setQuantity={setQuantity}
            onClick={onClick}
            tokenSymbol={tokenSymbol}
          />
        );
      }
      case 3: {
        if (isLoadingTokenDetails) {
          return (
            <div className="loading">
              <Loader />
            </div>
          );
        }
        const onClick = async (value: string) => {
          const success = await setToken(value);

          if (success) {
            setStepCount((stepCount + 1) as StepCount);
          }
        };
        return <TokenInput onClick={onClick} />;
      }
      case 2: {
        const onClick = () => setStepCount((stepCount + 1) as StepCount);
        return (
          <TokenDest
            onClick={onClick}
            setDestination={setTokenDestination}
            destination={tokenDestination}
          />
        );
      }
      case 1:
      default: {
        const onClick = async () => {
          setConnectionError(null);

          if (!activePubKey) {
            await SWKKit.openModal({
              allowedWallets: [
                WalletType.ALBEDO,
                WalletType.FREIGHTER,
                WalletType.XBULL,
              ],
              onWalletSelected: async (option: ISupportedWallet) => {
                try {
                  SWKKit.setWallet(option.type);
                  const publicKey = await SWKKit.getPublicKey();

                  await SWKKit.setNetwork(WalletNetwork.FUTURENET);
                  setActivePubKey(publicKey);
                } catch (error) {
                  console.log(error);
                  setConnectionError(ERRORS.WALLET_CONNECTION_REJECTED);
                }
              },
            });
          } else {
            setStepCount((stepCount + 1) as StepCount);
          }
        };
        return (
          <ConnectWallet
            selectedNetwork={selectedNetwork.network}
            pubKey={activePubKey}
            onClick={onClick}
          />
        );
      }
    }
  }

  return (
    <>
      {hasHeader && (
        <Layout.Header hasThemeSwitch projectId="soroban-react-mint-token" />
      )}
      <div className="Layout__inset account-badge-row">
        {activePubKey !== null && (
          <Profile isShort publicAddress={activePubKey} size="sm" />
        )}
      </div>
      <div className="Layout__inset layout">
        {stepCount === 3 && (
          <div className="admin-banner-container">
            <Notification
              title="Account must be an admin of the token"
              variant="primary"
            />
          </div>
        )}
        <div className="mint-token">
          <Card variant="primary">
            <Caption size="sm" addlClassName="step-count">
              step {stepCount} of 8
            </Caption>
            {renderStep(stepCount)}
          </Card>
        </div>
        {connectionError !== null &&
          createPortal(
            <div className="notification-container">
              <Notification title={connectionError!} variant="error" />
            </div>,
            document.getElementById("root")!,
          )}
      </div>
    </>
  );
};
