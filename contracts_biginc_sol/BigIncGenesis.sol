// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BigIncGenesis is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    mapping(address => bool) public isShareholder;
    address public usdtAddress; // USDT address
    address public usdcAddress; // USDC address
    uint256 public totalShareValuation = 680000e6; // $680k valuation in USDT/USDC
    uint256 constant decimals = 6;
    uint256 public presaleShareValuation = 457143e6; // $457k valuation in USDT/USDC
    uint256 public presaleShares = 21e6; // 21% shares for presale
    uint256 public sharesSold = 0e6; // Total shares sold
    uint256 public availableShares = 82e6; // Shares available after 18% allocated to owner

    bool public isPresaleActive = true;

    // Mapping to store shareholders' fractional share ownership
    mapping(address => uint256) public shareholders;

    // Array to store the addresses of shareholders
    address[] public shareholderAddresses;

    // Events
    event ShareMinted(
        address indexed buyer,
        uint256 sharesBought,
        uint256 amount
    );
    event PresaleEnded();
    event TransferShare(
        address indexed from,
        address indexed to,
        uint256 shareAmount
    );
    event Donate(address indexed donor, uint256 amount);
    event SharesSeized(address indexed shareholder, uint256 shareAmount);
    event AllSharesSold();

    // Modifier to check if the token address is USDT/USDC
    modifier validToken(address tokenAddress) {
        require(
            tokenAddress == usdtAddress || tokenAddress == usdcAddress,
            "Invalid token address"
        );
        _;
    }

    /**
     * @dev Constructor: assigns 18% of shares to the owner upon deployment.
     * @param _usdtAddress The address of the USDT token.
     * @param _usdcAddress The address of the USDC token.
     */
    constructor(
        address _usdtAddress,
        address _usdcAddress
    ) Ownable(msg.sender) {
        usdtAddress = _usdtAddress; // Set the USDT address
        usdcAddress = _usdcAddress; // Set the USDC address
        uint256 ownerShares = 18e6;
        shareholders[owner()] = ownerShares; // Use owner() from Ownable
        shareholderAddresses.push(owner());
    }

    /**
     * @dev Mints shares based on the amount of USDT/USDC sent.
     * @param tokenAddress The address of the ERC20 token (USDT or USDC).
     */
    /**
     * @dev Internal function to check if share purchase would exceed available shares
     * @param sharesBought The number of shares being purchased
     */
    function _checkOverspill(uint256 sharesBought) internal view {
        require(
            sharesBought <= availableShares,
            "Purchase would exceed available shares"
        );
    }
    
    function mintShare(
        address tokenAddress
    ) external nonReentrant validToken(tokenAddress) whenNotPaused {
        if (availableShares == 0) {
            emit AllSharesSold();
        } else {
            uint256 amount = IERC20(tokenAddress).allowance(
                msg.sender,
                address(this)
            );
            require(amount > 0, "Amount must be greater than zero");
            uint256 userBalance = IERC20(tokenAddress).balanceOf(msg.sender);
            require(userBalance >= amount, "Insufficient token balance");
            uint256 currentPrice = isPresaleActive
                ? presaleShareValuation
                : totalShareValuation;
            uint256 sharesBought = (amount * 100e6) / currentPrice;

            sharesSold += sharesBought;

            _checkOverspill(sharesBought);

            if (isPresaleActive) {
                if (sharesSold >= presaleShares) {
                    isPresaleActive = false;
                    emit PresaleEnded();
                }
            }

            // If new shareholder, add to the array
            if (shareholders[msg.sender] == 0) {
                shareholderAddresses.push(msg.sender);
            }

            // Add fractional shares to the buyer's account
            shareholders[msg.sender] += sharesBought;
            availableShares -= sharesBought;

            // Transfer the USDT/USDC tokens from the buyer to the contract (vault)
            IERC20(tokenAddress).transferFrom(
                msg.sender,
                address(this),
                amount
            );

            // Emit event for minted shares
            emit ShareMinted(msg.sender, sharesBought, amount);
        }
    }

    /**
     * @dev Transfers shares to another address.
     * @param to The recipient address.
     * @param shareAmount The amount of shares to transfer.
     */
    function transferShare(
        address to,
        uint256 shareAmount
    ) external whenNotPaused {
        require(to != address(0), "Cannot transfer to zero address");
        require(shareholders[msg.sender] >= shareAmount, "Insufficient shares");

        shareholders[msg.sender] -= shareAmount;
        shareholders[to] += shareAmount;

        // If the recipient is new, add to the shareholder list
        if (!isShareholder[to]) {
            isShareholder[to] = true;
            shareholderAddresses.push(to);
        }

        // If sender has no shares left, remove from the list
        if (shareholders[msg.sender] == 0 && isShareholder[msg.sender]) {
            isShareholder[msg.sender] = false;
            for (uint256 i = 0; i < shareholderAddresses.length; i++) {
                if (shareholderAddresses[i] == msg.sender) {
                    shareholderAddresses[i] = shareholderAddresses[
                        shareholderAddresses.length - 1
                    ];
                    shareholderAddresses.pop();
                    break;
                }
            }
        }

        emit TransferShare(msg.sender, to, shareAmount);
    }

    /**
     * @dev Allows users to donate POL to the owner.
     */
    function donate() external payable {
        payable(owner()).transfer(msg.value);
        emit Donate(msg.sender, msg.value);
    }

    /**
     * @dev Returns the number of shares available for purchase.
     * @return The number of available shares.
     */
    function getAvailableShares() external view returns (uint256) {
        return availableShares;
    }

    /**
     * @dev Returns the number of shares owned by an address.
     * @param addr The address to query.
     * @return The number of shares owned.
     */
    function getShares(address addr) external view returns (uint256) {
        return shareholders[addr];
    }

    /**
     * @dev Returns all shareholder addresses.
     * @return An array of shareholder addresses.
     */
    function getShareholders() external view returns (address[] memory) {
        return shareholderAddresses;
    }

    /**
     * @dev Allows the owner to withdraw USDT/USDC tokens from the contract.
     * @param tokenAddress The address of the ERC20 token to withdraw.
     * @param amount The amount of tokens to withdraw.
     */
    function withdraw(
        address tokenAddress,
        uint256 amount
    ) external onlyOwner nonReentrant {
        require(
            IERC20(tokenAddress).balanceOf(address(this)) >= amount,
            "Insufficient balance"
        );
        IERC20(tokenAddress).safeTransfer(owner(), amount);
    }

    /**
     * @dev Seizes a shareholder's shares and transfers them to the owner.
     * @param shareholder The address of the shareholder whose shares are to be seized.
     */
    function seizeShares(address shareholder) external onlyOwner whenNotPaused {
        require(shareholders[shareholder] > 0, "No shares to seize");

        uint256 seizedShares = shareholders[shareholder];
        shareholders[shareholder] = 0;
        shareholders[owner()] += seizedShares;

        // Remove shareholder from the list
        if (isShareholder[shareholder]) {
            isShareholder[shareholder] = false;
            for (uint256 i = 0; i < shareholderAddresses.length; i++) {
                if (shareholderAddresses[i] == shareholder) {
                    shareholderAddresses[i] = shareholderAddresses[
                        shareholderAddresses.length - 1
                    ];
                    shareholderAddresses.pop();
                    break;
                }
            }
        }

        emit SharesSeized(shareholder, seizedShares);
    }

    /**
     * @dev Pauses contract operations.
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpauses contract operations.
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
