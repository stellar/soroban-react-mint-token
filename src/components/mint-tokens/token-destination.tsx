import React, { ChangeEvent } from "react";
import { Button, Heading, Input } from "@stellar/design-system";

interface TokenDestProps {
  destination: string;
  setDestination: (address: string) => void;
  onClick: () => void;
}

export const TokenDest = (props: TokenDestProps) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    props.setDestination(event.target.value);
  };

  return (
    <>
      <Heading as="h1" size="sm">
        Mint to a Destination
      </Heading>
      <Input
        fieldSize="md"
        id="input-destination"
        label="Destination Account"
        value={props.destination}
        onChange={handleChange}
      />
      <div className="submit-row-destination">
        <Button
          size="md"
          variant="tertiary"
          isFullWidth
          onClick={props.onClick}
          disabled={props.destination.length < 1}
        >
          Next
        </Button>
      </div>
    </>
  );
};
