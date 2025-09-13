// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.23;
import "./handshake-router-interfaces/ILBRouter.sol";
import "./handshake-router-interfaces/IWNATIVE.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./handshake-router-interfaces/ILBQuoter.sol";
import "./handshake-router-interfaces/IJoePair.sol";
import {SafeTransferLib} from "solady/src/utils/SafeTransferLib.sol";
import {IRouterErrors} from "./handshake-router-interfaces/IRouterErrors.sol";
import {IRouterEvents} from "./handshake-router-interfaces/IRouterEvents.sol";
import {IRouterStructs} from "./handshake-router-interfaces/IRouterStructs.sol";
import {IERC20INFO} from "./handshake-router-interfaces/IERC20INFO.sol";
import 'hardhat/console.sol';
contract RouterTraderJoe is IRouterErrors, IRouterEvents, IRouterStructs {
    ILBRouter constant ROUTER = ILBRouter(0xb4315e873dBcf96Ffd0acd8EA43f689D8c20fB30);
    IWNATIVE constant AVAX_WRAPPER = IWNATIVE(0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7);
    ILBQuoter constant QUOTER = ILBQuoter(0xd76019A16606FDa4651f636D9751f500Ed776250);

    ILBFactory constant FACTORY = ILBFactory(0x8e42f2F4101563bF679975178e880FD87d3eFd4e);
    IJoeFactory constant FACTORY_V1 = IJoeFactory(0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10);

    address internal feeSink;
    address internal owner;
    uint256 internal buyFeeBps;
    uint256 internal sellFeeBps;

    uint256 internal frozen;
    mapping(address => bool) internal tokenAllowlist;
    mapping(address => bool) internal userDenylist;

    constructor(address owner_, address feeSink_, uint256 buyFeeBps_, uint256 sellFeeBps_){
        feeSink = feeSink_;
        owner = owner_;
        buyFeeBps = buyFeeBps_;
        sellFeeBps = sellFeeBps_;
    }

    function sellNativeForToken(address token, uint256 slippage, ILBRouter.Version[] memory versions, uint256[] memory binSteps, uint256 virtualAmountWithoutSlippage) external payable {
        require(!userDenylist[msg.sender], 'DL');
        require(frozen == 0, 'CF');
        uint256 amount = tokenAllowlist[token] ? msg.value : msg.value - ((msg.value * buyFeeBps) / 1000000);
        uint256 pFees = msg.value - amount;

        AVAX_WRAPPER.deposit{value: amount}();
        AVAX_WRAPPER.approve(address(ROUTER), amount);
        ILBRouter.Path memory path;
        IERC20[] memory mem_route = new IERC20[](2);
        mem_route[0] = IERC20(address(AVAX_WRAPPER));
        mem_route[1] = IERC20(token);
        path.tokenPath = mem_route;
        path.versions = versions;
        path.pairBinSteps = binSteps;
        uint256 amountOutWithSlippage = (virtualAmountWithoutSlippage * (1000-slippage))/1000;
        uint256 amountOut = ROUTER.swapExactTokensForTokensSupportingFeeOnTransferTokens(amount, amountOutWithSlippage, path, msg.sender, block.timestamp + 1);
        require(amountOut >= amountOutWithSlippage, 'SR');
        emit SwapExecuted(msg.sender, token, address(AVAX_WRAPPER), amount, amountOut, 0, 0, pFees);
    }

    function sellTokenForNative(uint128 amount, address token, uint256 slippage, ILBRouter.Version[] memory versions, uint256[] memory binSteps, uint256 virtualAmountWithoutSlippage) external{
        require(!userDenylist[msg.sender], 'DL');
        require(frozen == 0, 'CF');
        SafeTransferLib.safeTransferFrom(token, msg.sender, address(this), amount);
        amount = uint128(SafeTransferLib.balanceOf(token, address(this)));
        SafeTransferLib.safeApproveWithRetry(token, address(ROUTER), amount);
        ILBRouter.Path memory path;
        IERC20[] memory mem_route = new IERC20[](2);
        mem_route[0] = IERC20(token);
        mem_route[1] = IERC20(address(AVAX_WRAPPER));
        path.tokenPath = mem_route;
        path.versions = versions;
        path.pairBinSteps = binSteps;
        uint256 amountOutWithSlippage = (virtualAmountWithoutSlippage * (1000-slippage))/1000;
        uint256 amountOut = ROUTER.swapExactTokensForNATIVESupportingFeeOnTransferTokens(amount, amountOutWithSlippage, path, payable(address(this)), block.timestamp + 1);
        uint256 amountOutAfterFees = tokenAllowlist[token] ? amountOut : amountOut - ((amountOut*sellFeeBps)/1000000);
        emit SwapExecuted(msg.sender, address(AVAX_WRAPPER), token, amount, amountOut, 0, 0, amountOut - amountOutAfterFees);
        assembly {
            if iszero( call(
                gas(),
                caller(),
                amountOutAfterFees,
                0,
                0,
                0,
                0
            )) {
                revert(0,0)
            }
        }
    }

    // Same flow as uni, for v1 same as uni v2, for v2.1 get active bin get price from id done
    function fetchTokenInfo(address token) external view returns (AllInfo memory info) {
        address pairAddress;
        uint256 maxAvaxBalance = type(uint256).max;
        uint16 binStep;
        uint24 binId;
        uint24 version;
        info.totalSupply = IERC20INFO(token).totalSupply();
        info.decimals = IERC20INFO(token).decimals();
        info.name = IERC20INFO(token).name();
        info.symbol = IERC20INFO(token).symbol();

        ILBFactory.LBPairInformation[] memory v2Pairs = FACTORY.getAllLBPairs(IERC20(token), AVAX_WRAPPER);
        address v1Pair = FACTORY_V1.getPair(token, address(AVAX_WRAPPER));
        if(v1Pair != address(0)) {
            uint256 wavaxBalance = _findWavaxBalance(v1Pair, 0);
            if (maxAvaxBalance < wavaxBalance || maxAvaxBalance == type(uint256).max) {
                maxAvaxBalance = wavaxBalance;
                pairAddress = v1Pair;
                binStep = 0;
                binId = 0;
            }
        }
        if(v2Pairs.length > 0) {
            for(uint i = 0; i<v2Pairs.length; i++) {
                uint256 wavaxBalance = _findWavaxBalance(address(v2Pairs[i].LBPair), v2Pairs[i].binStep);
                if (maxAvaxBalance < wavaxBalance || maxAvaxBalance == type(uint256).max) {
                    maxAvaxBalance = wavaxBalance;
                    pairAddress = address(v2Pairs[i].LBPair);
                    binStep = v2Pairs[i].binStep;
                    binId = ILBPair(pairAddress).getActiveId();
                    version = 1;
                }
            }
        }
        info.pairAddress = pairAddress;
        info.binId = binId;
        info.binStep = binStep;
        info.version = version;
        if(version == 0) {
            (info.reserves0, info.reserves1 ,) = IJoePair(pairAddress).getReserves();
            info.token0 = IJoePair(pairAddress).token0();
            info.token1 =  IJoePair(pairAddress).token1();
        } else {
            (uint128 reserves0, uint128 reserves1) = ILBPair(pairAddress).getReserves();
            info.reserves0 = uint112(reserves0);
            info.reserves1 = uint112(reserves1);
            info.token0 = address(ILBPair(pairAddress).getTokenX());
            info.token1 =  address(ILBPair(pairAddress).getTokenY());
        }
    }

    function fetchTokensInfo(address[] calldata tokens) external view returns (GeneralInfo[] memory info) {
        uint256 len = tokens.length;
        info = new GeneralInfo[](len);
        for(uint i =0; i<len; i++){
            address pairAddress;
            uint256 maxAvaxBalance = type(uint256).max;
            uint16 binStep;
            uint24 binId;
            uint24 version;
            info[i].totalSupply = IERC20INFO(tokens[i]).totalSupply();
            info[i].decimals = IERC20INFO(tokens[i]).decimals();
            ILBFactory.LBPairInformation[] memory v2Pairs = FACTORY.getAllLBPairs(IERC20(tokens[i]), AVAX_WRAPPER);
            address v1Pair = FACTORY_V1.getPair(tokens[i], address(AVAX_WRAPPER));
            if(v1Pair != address(0)) {
                uint256 wavaxBalance = _findWavaxBalance(v1Pair, 0);
                if (maxAvaxBalance < wavaxBalance || maxAvaxBalance == type(uint256).max) {
                    maxAvaxBalance = wavaxBalance;
                    pairAddress = v1Pair;
                    binStep = 0;
                    binId = 0;
                }
            }
            if(v2Pairs.length > 0) {
                for(uint j = 0; j<v2Pairs.length; j++) {
                    uint256 wavaxBalance = _findWavaxBalance(address(v2Pairs[j].LBPair), v2Pairs[j].binStep);
                    if (maxAvaxBalance < wavaxBalance || maxAvaxBalance == type(uint256).max) {
                        maxAvaxBalance = wavaxBalance;
                        pairAddress = address(v2Pairs[j].LBPair);
                        binStep = v2Pairs[j].binStep;
                        binId = ILBPair(pairAddress).getActiveId();
                        version = 1;
                    }
                }
            }
            info[i].pairAddress = pairAddress;
            info[i].binId = binId;
            info[i].binStep = binStep;
            info[i].version = version;
            if(version == 0) {
                (info[i].reserves0, info[i].reserves1 ,) = IJoePair(pairAddress).getReserves();
                info[i].token0 = IJoePair(pairAddress).token0();
                info[i].token1 =  IJoePair(pairAddress).token1();
            } else {
                (uint128 reserves0, uint128 reserves1) = ILBPair(pairAddress).getReserves();
                info[i].reserves0 = uint112(reserves0);
                info[i].reserves1 = uint112(reserves1);
                info[i].token0 = address(ILBPair(pairAddress).getTokenX());
                info[i].token1 =  address(ILBPair(pairAddress).getTokenY());
            }
        }
    }

    function setFeeSink(address feeSink_) external {
        require(msg.sender == owner);
        require(feeSink_ != address(0));
        feeSink = feeSink_;
    }

    function withdrawFees() external {
        require(msg.sender == owner);
        address feeSink_ = feeSink;
        assembly {
           if iszero(call(
               gas(),
               feeSink_,
               selfbalance(),
               0,
               0,
               0,
               0
           )) {
               revert(0,0)
           }
       }
    }

    /**
        @notice Admin withdraw given tokens whole balance to fee sink
        @param token A list of tokens
    */
    function withdrawToken(address[] calldata token) external {
        require(msg.sender == owner);
        address toAddress = feeSink;
        for(uint i=0; i<token.length; i++){
            SafeTransferLib.safeTransferAll(token[i], toAddress);
        }
    }

    /**
        @notice Owner updates the buy fee bps
        @param feeBps_ The new fee in Bps
    */
    function updateBuyFeeBPS(uint256 feeBps_) external {
        require(msg.sender == owner);
        buyFeeBps = feeBps_;
    }

    /**
        @notice Owner updates the sell fee bps
        @param feeBps_ The new fee in Bps
    */
    function updateSellFeeBPS(uint256 feeBps_) external {
        require(msg.sender == owner);
        sellFeeBps = feeBps_;
    }

    /**
        @notice Owner adds a list of addresses to the allowlist
        @param tokens The address of tokens to be allowlisted
    */
    function addToTokenAllowlist(address[] calldata tokens) external {
        require(msg.sender == owner);
        for(uint i=0; i<tokens.length; i++){
            tokenAllowlist[tokens[i]] = true;
        }
    }

    /**
        @notice Owner removed a list of addresses from the allowlist
        @param tokens The address of tokens to be removed from the allowlis
    */
    function removeFromTokenAllowlist(address[] calldata tokens) external {
        require(msg.sender == owner);
        for(uint i=0; i<tokens.length; i++){
            tokenAllowlist[tokens[i]] = false;
        }
    }

     /**
        @notice Owner adds a list of addresses to the denylist
        @param users The address of users to be denylisted
    */
    function addToDenylist(address[] calldata users) external {
        require(msg.sender == owner);
        for(uint i=0; i<users.length; i++){
            userDenylist[users[i]] = true;
        }
    }

    /**
        @notice Owner removes a list of addresses from the denylist
        @param users The address of users to be removed from the denyliste
    */
    function removeFromDenylist(address[] calldata users) external {
        require(msg.sender == owner);
        for(uint i=0; i<users.length; i++){
            userDenylist[users[i]] = false;
        }
    }

    /**
        @notice Owner freezes the contract
    */
    function freezeContract() external {
        require(msg.sender == owner);
        frozen = 1;
    }

    /**
        @notice Owner unfreezes the contract
    */
    function unfreezeContract() external {
        require(msg.sender == owner);
        frozen = 0;
    }

    function findBestPathFromAmountIn(address token1, address token2, uint128 balance) external view returns (ILBQuoter.Quote memory rsp) {
        address[] memory path = new address[](2);
        path[0] = token1;
        path[1] = token2;
        rsp = QUOTER.findBestPathFromAmountIn(path, balance);
    }
    
     function _findWavaxBalance(address pairAddress, uint24 fee) internal view returns(uint112 wavaxToken) {
        if(fee == 0) {
            address token0 = IJoePair(pairAddress).token0();
            (uint112 token0R, uint112 token1R, ) = IJoePair(pairAddress).getReserves();
            wavaxToken = token0 == address(AVAX_WRAPPER) ? token0R : token1R;
        } else {
            address token0 = address(ILBPair(pairAddress).getTokenX());
            (uint128 token0R, uint128 token1R) = ILBPair(pairAddress).getReserves();
            wavaxToken = token0 == address(AVAX_WRAPPER) ? uint112(token0R) : uint112(token1R);
        }
    }
    
    receive() external payable {}
}
