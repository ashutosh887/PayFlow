pragma solidity ^0.8.20;

import "./PaymentFlow.sol";
import "./ApprovalManager.sol";
import "./interfaces/IMNEE.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FlowFactory is Ownable {
    PaymentFlow public paymentFlowImplementation;
    ApprovalManager public approvalManager;
    
    mapping(address => address[]) public flowsByOwner;
    mapping(address => bool) public isFlow;
    address[] public allFlows;
    
    event FlowCreated(
        address indexed flowAddress,
        address indexed owner,
        uint256 flowType,
        uint256 amount
    );

    constructor(
        address _paymentFlowImplementation,
        address _approvalManager
    ) Ownable(msg.sender) {
        paymentFlowImplementation = PaymentFlow(_paymentFlowImplementation);
        approvalManager = ApprovalManager(_approvalManager);
    }

    function _createFlow(
        address _mneeToken,
        uint256 _initialDeposit,
        uint256 _flowType
    ) internal returns (address) {
        PaymentFlow newFlow = new PaymentFlow(_mneeToken);
        address flowAddress = address(newFlow);
        
        newFlow.transferOwnership(msg.sender);
        
        if (_initialDeposit > 0) {
            uint256 balanceBefore = IMNEE(_mneeToken).balanceOf(flowAddress);
            require(
                IMNEE(_mneeToken).transferFrom(msg.sender, flowAddress, _initialDeposit),
                "Deposit transfer failed"
            );
            uint256 balanceAfter = IMNEE(_mneeToken).balanceOf(flowAddress);
            require(balanceAfter - balanceBefore == _initialDeposit, "Deposit amount mismatch");
            
            newFlow.depositFromFactory(msg.sender, _initialDeposit);
        }
        
        flowsByOwner[msg.sender].push(flowAddress);
        isFlow[flowAddress] = true;
        allFlows.push(flowAddress);
        
        emit FlowCreated(flowAddress, msg.sender, _flowType, _initialDeposit);
        return flowAddress;
    }

    function createMilestoneFlow(
        address _mneeToken,
        uint256 _initialDeposit
    ) external returns (address) {
        return _createFlow(_mneeToken, _initialDeposit, 0);
    }

    function createSplitFlow(
        address _mneeToken,
        uint256 _initialDeposit
    ) external returns (address) {
        return _createFlow(_mneeToken, _initialDeposit, 1);
    }

    function createRecurringFlow(
        address _mneeToken,
        uint256 _initialDeposit
    ) external returns (address) {
        return _createFlow(_mneeToken, _initialDeposit, 2);
    }

    function getFlowsByOwner(address _owner) external view returns (address[] memory) {
        return flowsByOwner[_owner];
    }

    function getAllFlows() external view returns (address[] memory) {
        return allFlows;
    }

    function getFlowCount() external view returns (uint256) {
        return allFlows.length;
    }
}
