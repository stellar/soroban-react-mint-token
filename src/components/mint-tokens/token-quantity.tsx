import React, { ChangeEvent } from "react";
// import BigNumber from "bignumber.js";
import { Button, Heading, Input } from "@stellar/design-system";
// import { formatTokenAmount } from "../../helpers/format";

interface TokenQuantityProps {
  quantity: string;
  onClick: () => void;
  setQuantity: (quantity: string) => void;
  tokenSymbol: string;
}

export const TokenQuantity = (props: TokenQuantityProps) => {
  // const canFulfillPayment = new BigNumber(props.quantity).isLessThanOrEqualTo(
  //   new BigNumber(props.quantity),
  // );
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    props.setQuantity(event.target.value);
  };

  return (
    <>
      <Heading as="h1" size="sm" addlClassName="title">
        Set Quantity
      </Heading>
      <Heading size="sm" as="h2" addlClassName="balance">
        {props.quantity}
        {props.tokenSymbol}
      </Heading>
      <Input
        fieldSize="md"
        id="input-amount"
        label="Choose quantity to send"
        value={props.quantity}
        onChange={handleChange}
      />
      <div className="submit-row-send">
        <Button
          size="md"
          variant="tertiary"
          isFullWidth
          onClick={props.onClick}
          disabled={props.quantity.length < 1}
        >
          Next
        </Button>
      </div>
    </>
  );
};
