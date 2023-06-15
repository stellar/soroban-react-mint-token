import React, { ChangeEvent } from "react";
import { Button, Heading, Input } from "@stellar/design-system";

interface TokenQuantityProps {
  quantity: string;
  onClick: () => void;
  setQuantity: (quantity: string) => void;
  tokenSymbol: string;
}

export const TokenQuantity = (props: TokenQuantityProps) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    props.setQuantity(event.target.value);
  };

  return (
    <>
      <Heading as="h1" size="sm" addlClassName="title">
        Set Quantity
      </Heading>
      <Heading size="sm" as="h2" addlClassName="quantity">
        {props.quantity} {props.tokenSymbol}
      </Heading>
      <Input
        fieldSize="md"
        id="input-amount"
        label="Choose quantity to send"
        value={props.quantity}
        onChange={handleChange}
        type="number"
      />
      <div className="submit-row">
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
