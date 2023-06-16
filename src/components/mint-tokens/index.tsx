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
import freighterApi from "@stellar/freighter-api";

import {
  connectNetwork,
  Networks,
  NetworkDetails,
} from "../../helpers/network";
import { ERRORS } from "../../helpers/error";
import {
  getTxBuilder,
  BASE_FEE,
  XLM_DECIMALS,
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
  isShowingHeader?: boolean;
}

export const MintToken = (props: MintTokenProps) => {
  const isShowingHeader =
    props.isShowingHeader === undefined ? true : props.isShowingHeader;
  const [activeNetworkDetails, setActiveNetworkDetails] = React.useState(
    {} as NetworkDetails,
  );
  const [activePubKey, setActivePubKey] = React.useState(null as string | null);
  const [stepCount, setStepCount] = React.useState(1 as StepCount);
  const [connectionError, setConnectionError] = React.useState(
    null as string | null,
  );

  const [fee, setFee] = React.useState(BASE_FEE);
  const [memo, setMemo] = React.useState("");

  const [isLoadingTokenDetails, setIsLoadingTokenDetails] =
    React.useState<boolean>(false);

  // Not using vals yet
  /* eslint-disable */
  // @ts-ignore
  const [tokenId, setTokenId] = React.useState("");
  // @ts-ignore
  const [tokenDecimals, setTokenDecimals] = React.useState(XLM_DECIMALS);
  const [tokenDestination, setTokenDestination] = React.useState("");
  // @ts-ignore
  const [tokenSymbol, setTokenSymbol] = React.useState("");
  // @ts-ignore
  const [quantity, setQuantity] = React.useState("");
  const [txResultXDR, setTxResultXDR] = React.useState("");
  const [signedXdr, setSignedXdr] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  /* eslint-enable */

  async function setToken(id: string) {
    setIsLoadingTokenDetails(true);
    setTokenId(id);

    const server = getServer(activeNetworkDetails);

    try {
      const txBuilderAdmin = await getTxBuilder(
        activePubKey!,
        BASE_FEE,
        server,
        activeNetworkDetails.networkPassphrase,
      );

      const symbol = await getTokenSymbol(id, txBuilderAdmin, server);
      setTokenSymbol(symbol);

      return true;
    } catch (error) {
      console.log(error);
      setConnectionError("Unable to fetch token details.");
      setIsLoadingTokenDetails(false);

      return false;
    }
  }
  console.log("signedXdr: ", signedXdr);

  function renderStep(step: StepCount) {
    switch (step) {
      case 8: {
        const onClick = () => setStepCount(1);
        return <TxResult onClick={onClick} resultXDR={txResultXDR} />;
      }
      case 7: {
        const submit = async () => {
          const server = getServer(activeNetworkDetails);

          setIsSubmitting(true);

          try {
            const result = await submitTx(
              signedXdr,
              activeNetworkDetails.networkPassphrase,
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
            network={activeNetworkDetails.network}
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
            network={activeNetworkDetails.network}
            destination={tokenDestination}
            quantity={quantity}
            fee={fee}
            memo={memo}
            networkDetails={activeNetworkDetails}
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
        const onClick =
          activeNetworkDetails.network && connectionError === null
            ? () => setStepCount((stepCount + 1) as StepCount)
            : setConnection;
        return (
          <ConnectWallet
            network={activeNetworkDetails.network}
            connectionError={connectionError}
            onClick={onClick}
          />
        );
      }
    }
  }

  async function setConnection() {
    setConnectionError(null);
    setActivePubKey(null);

    const isConnected = await freighterApi.isConnected();

    if (!isConnected) {
      setConnectionError(ERRORS.FREIGHTER_NOT_AVAILABLE);
      return;
    }

    const { networkDetails, pubKey } = await connectNetwork();

    if (networkDetails.network !== Networks.Futurenet) {
      setConnectionError(ERRORS.UNSUPPORTED_NETWORK);
    }

    setActiveNetworkDetails(networkDetails);
    setActivePubKey(pubKey);
  }

  return (
    <>
      {isShowingHeader && (
        <Layout.Header hasThemeSwitch projectId="soroban-react-mint-token" />
      )}
      <div className="Layout__inset account-badge-row">
        {activePubKey !== null && (
          <Profile isShort publicAddress={activePubKey} size="sm" />
        )}
      </div>
      <div className="Layout__inset layout">
        <div className="admin-banner-container">
          <Notification
            title="Account must be an admin of the token"
            variant="primary"
          />
        </div>
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
