import { ethers } from "ethers";

export function validateEthereumAddress(address: string): { 
  isValid: boolean; 
  error?: string;
} {
  try {
    // Remove whitespace
    const trimmedAddress = address.trim();
    
    // Check if address is empty
    if (!trimmedAddress) {
      return { 
        isValid: false, 
        error: "Wallet address is required" 
      };
    }

    // Check if it's a valid Ethereum address
    if (!ethers.isAddress(trimmedAddress)) {
      return { 
        isValid: false, 
        error: "Invalid Ethereum address format" 
      };
    }

    // Check if it's not the zero address
    if (trimmedAddress.toLowerCase() === "0x0000000000000000000000000000000000000000") {
      return { 
        isValid: false, 
        error: "Cannot use zero address" 
      };
    }

    // Check minimum length (42 characters for Ethereum addresses: 0x + 40 hex chars)
    if (trimmedAddress.length !== 42) {
      return { 
        isValid: false, 
        error: "Ethereum address must be 42 characters long" 
      };
    }

    // Check if address starts with 0x
    if (!trimmedAddress.startsWith("0x")) {
      return { 
        isValid: false, 
        error: "Ethereum address must start with 0x" 
      };
    }

    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      error: "Invalid wallet address" 
    };
  }
}
