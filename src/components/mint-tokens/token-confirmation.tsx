import React from "react";
import { Button, Heading, Profile } from "@stellar/design-system";
import { StellarWalletsKit } from "stellar-wallets-kit";
import { xlmToStroop } from "../../helpers/format";
import { NetworkDetails, signTx } from "../../helpers/network";
import {
  mintTokens,
  getTxBuilder,
  getServer,
  parseTokenAmount,
} from "../../helpers/soroban";
import { ERRORS } from "../../helpers/error";

interface ConfirmMintTxProps {
  quantity: string;
  destination: string;
  fee: string;
  pubKey: string;
  kit: StellarWalletsKit;
  memo: string;
  onTxSign: (xdr: string) => void;
  tokenId: string;
  tokenDecimals: number;
  tokenSymbol: string;
  networkDetails: NetworkDetails;
  setError: (error: string) => void;
}

export const ConfirmMintTx = (props: ConfirmMintTxProps) => {
  const signWithFreighter = async () => {
    // Need to use the perviously fetched token decimals to properly display the quantity value
    const quantity = parseTokenAmount(props.quantity, props.tokenDecimals);
    // Get an instance of a Soroban RPC set to the selected network
    const server = getServer(props.networkDetails);
    // Gets a transaction builder and use it to add a "mint" operation and build the corresponding XDR
    const txBuilderAdmin = await getTxBuilder(
      props.pubKey,
      xlmToStroop(props.fee).toString(),
      server,
      props.networkDetails.networkPassphrase,
    );

    const xdr = await mintTokens({
      tokenId: props.tokenId,
      quantity: quantity.toNumber(),
      destinationPubKey: props.destination,
      memo: props.memo,
      txBuilderAdmin,
      server,
      networkPassphrase: props.networkDetails.networkPassphrase,
    });

    try {
      // Signs XDR representing the "mint" transaction
      const signedTx = await signTx(xdr, props.pubKey, props.kit);
      props.onTxSign(signedTx);
    } catch (e) {
      console.log("e: ", e);
      props.setError(ERRORS.UNABLE_TO_SIGN_TX);
    }
  };
  return (
    <>
      <Heading as="h1" size="sm">
        Confirm Mint Transaction
      </Heading>
      <div className="tx-details">
        <div className="tx-detail-item">
          <p className="detail-header">Network</p>
          <p className="detail-value">{props.networkDetails.network}</p>
        </div>
        <div className="tx-detail-item">
          <p className="detail-header">To</p>
          <div className="dest-identicon">
            <Profile isShort publicAddress={props.destination} size="sm" />
          </div>
        </div>
        <div className="tx-detail-item">
          <p className="detail-header">Quantity</p>
          <p className="detail-value">
            {props.quantity} {props.tokenSymbol}
          </p>
        </div>
        <div className="tx-detail-item">
          <p className="detail-header">Fee</p>
          <p className="detail-value">{props.fee} XLM</p>
        </div>
        <div className="tx-detail-item">
          <p className="detail-header">Memo</p>
          <p className="detail-value">{props.memo ? props.memo : "(None)"}</p>
        </div>
      </div>
      <div className="submit-row">
        <Button
          size="md"
          variant="tertiary"
          isFullWidth
          onClick={signWithFreighter}
        >
          Sign with Freighter
        </Button>
      </div>
    </>
  );
};
