// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

library OptimizedStorage {
    struct PackedCoordinates {
        int128 latitude;
        int128 longitude;
    }

    struct PackedTimestamp {
        uint128 timestamp;
        uint128 blockNumber;
    }

    struct PackedStats {
        uint64 upvotes;
        uint64 downvotes;
        uint64 totalRating;
        uint64 ratingCount;
    }

    struct PackedUserStats {
        uint64 totalRecordings;
        uint64 totalVotes;
        uint64 reputation;
        uint64 registrationTimestamp;
    }

    function packCoordinates(int256 lat, int256 lng) internal pure returns (PackedCoordinates memory) {
        require(lat >= type(int128).min && lat <= type(int128).max, "Latitude out of range");
        require(lng >= type(int128).min && lng <= type(int128).max, "Longitude out of range");

        return PackedCoordinates({latitude: int128(lat), longitude: int128(lng)});
    }

    function unpackCoordinates(PackedCoordinates memory packed) internal pure returns (int256 lat, int256 lng) {
        return (int256(packed.latitude), int256(packed.longitude));
    }

    function packTimestamp(uint256 timestamp) internal view returns (PackedTimestamp memory) {
        require(timestamp <= type(uint128).max, "Timestamp out of range");
        require(block.number <= type(uint128).max, "Block number out of range");

        return PackedTimestamp({timestamp: uint128(timestamp), blockNumber: uint128(block.number)});
    }

    function packStats(uint256 upvotes, uint256 downvotes, uint256 totalRating, uint256 ratingCount)
        internal
        pure
        returns (PackedStats memory)
    {
        require(upvotes <= type(uint64).max, "Upvotes out of range");
        require(downvotes <= type(uint64).max, "Downvotes out of range");
        require(totalRating <= type(uint64).max, "Total rating out of range");
        require(ratingCount <= type(uint64).max, "Rating count out of range");

        return PackedStats({
            upvotes: uint64(upvotes),
            downvotes: uint64(downvotes),
            totalRating: uint64(totalRating),
            ratingCount: uint64(ratingCount)
        });
    }

    function packUserStats(
        uint256 totalRecordings,
        uint256 totalVotes,
        uint256 reputation,
        uint256 registrationTimestamp
    ) internal pure returns (PackedUserStats memory) {
        require(totalRecordings <= type(uint64).max, "Total recordings out of range");
        require(totalVotes <= type(uint64).max, "Total votes out of range");
        require(reputation <= type(uint64).max, "Reputation out of range");
        require(registrationTimestamp <= type(uint64).max, "Registration timestamp out of range");

        return PackedUserStats({
            totalRecordings: uint64(totalRecordings),
            totalVotes: uint64(totalVotes),
            reputation: uint64(reputation),
            registrationTimestamp: uint64(registrationTimestamp)
        });
    }
}
