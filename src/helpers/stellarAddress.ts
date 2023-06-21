import { FederationServer, MuxedAccount, StrKey } from "soroban-client";

export type DestinationInfo = {
  muxedAddress: string;
  address: string;
  errorMessage: string;
};

export const isFederatedAddress = (input: string) => input.includes("*");

export const getMuxedAccount = (input: string) => {
  try {
    const muxedAccount = MuxedAccount.fromAddress(input, "0");
    return muxedAccount;
  } catch (e) {
    return null;
  }
};

export const isStellarAddress = (input: string) =>
  StrKey.isValidEd25519PublicKey(input) ||
  StrKey.isValidMed25519PublicKey(input) ||
  isFederatedAddress(input);

export const getDestinationAddress = async ({
  federationAddress,
  stellarAddress,
  input,
}: {
  federationAddress: string;
  /**
   * The address as inputted by the user.
   * Can be a pubkey, a muxed pubkey, federation address.
   */
  input: string;
  stellarAddress: string;
}): Promise<DestinationInfo> => {
  const destinationInfo = {
    errorMessage: "",
    address: "",
    muxedAddress: "",
  };

  if (!input) {
    return destinationInfo;
  }

  if (isFederatedAddress(input)) {
    try {
      const federationResponse = await FederationServer.resolve(input);
      const address = federationResponse.account_id;

      return { ...destinationInfo, address };
    } catch (err) {
      return {
        ...destinationInfo,
        errorMessage: "That doesn’t seem to be a valid Federated address.",
      };
    }
  }

  if (StrKey.isValidMed25519PublicKey(input)) {
    const muxedAccount = getMuxedAccount(input);

    if (!muxedAccount) {
      return {
        ...destinationInfo,
        errorMessage: "That doesn’t seem to be a valid muxed address.",
      };
    }

    return {
      ...destinationInfo,
      memo: muxedAccount.id(),
      address: muxedAccount.baseAccount().accountId(),
      muxedAddress: muxedAccount.accountId(),
    };
  }

  return { ...destinationInfo, address: input };
};
