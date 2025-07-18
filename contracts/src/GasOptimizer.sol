// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

library GasOptimizer {
    uint256 private constant BITMASK_EXTRA_DATA = (1 << 232) - 1;

    function packAddressWithData(address addr, uint96 data) internal pure returns (uint256 packed) {
        packed = uint256(uint160(addr)) | (uint256(data) << 160);
    }

    function unpackAddress(uint256 packed) internal pure returns (address addr) {
        addr = address(uint160(packed));
    }

    function unpackData(uint256 packed) internal pure returns (uint96 data) {
        data = uint96(packed >> 160);
    }

    function efficientStringHash(string memory str) internal pure returns (bytes32) {
        return keccak256(bytes(str));
    }

    function batchHash(bytes32[] memory hashes) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(hashes));
    }

    function optimizedArrayLength(uint256[] memory arr) internal pure returns (uint256) {
        uint256 length;
        assembly {
            length := mload(arr)
        }
        return length;
    }

    function efficientMemoryCopy(bytes memory source, uint256 offset, uint256 length)
        internal
        pure
        returns (bytes memory result)
    {
        result = new bytes(length);
        assembly {
            let src := add(add(source, 0x20), offset)
            let dst := add(result, 0x20)
            for { let i := 0 } lt(i, length) { i := add(i, 0x20) } { mstore(add(dst, i), mload(add(src, i))) }
        }
    }

    function calculateGasForBatch(uint256 itemCount, uint256 gasPerItem) internal pure returns (uint256) {
        return itemCount * gasPerItem + 21000;
    }

    function optimizedModExp(uint256 base, uint256 exponent, uint256 modulus) internal view returns (uint256 result) {
        assembly {
            let freemem := mload(0x40)
            mstore(freemem, 0x20)
            mstore(add(freemem, 0x20), 0x20)
            mstore(add(freemem, 0x40), 0x20)
            mstore(add(freemem, 0x60), base)
            mstore(add(freemem, 0x80), exponent)
            mstore(add(freemem, 0xa0), modulus)
            let success := staticcall(gas(), 0x05, freemem, 0xc0, freemem, 0x20)
            result := mload(freemem)
        }
    }
}
