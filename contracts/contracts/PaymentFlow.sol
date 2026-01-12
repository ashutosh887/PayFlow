pragma solidity ^0.8.20;

import "./interfaces/IMNEE.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract PaymentFlow is Ownable, ReentrancyGuard {
    enum FlowType { Milestone, Split, Recurring, Escrow }
    enum FlowStatus { Active, Paused, Completed, Cancelled }

    struct Milestone {
        uint256 milestoneId;
        uint256 amount;
        address recipient;
        bool completed;
        bool paid;
    }

    struct Split {
        address recipient;
        uint256 percentage;
    }

    FlowType public flowType;
    FlowStatus public status;
    IMNEE public mneeToken;
    address public factory;
    
    uint256 public totalAmount;
    uint256 public remainingAmount;
    
    Milestone[] public milestones;
    Split[] public splits;
    
    mapping(uint256 => bool) public milestoneCompleted;

    event Deposit(address indexed depositor, uint256 amount);
    event MilestoneCompleted(uint256 indexed milestoneId);
    event PaymentExecuted(address indexed recipient, uint256 amount);
    event FlowPaused();
    event FlowResumed();
    event FlowCancelled();
    event FlowCompleted();

    constructor(address _mneeToken) Ownable(msg.sender) {
        mneeToken = IMNEE(_mneeToken);
        status = FlowStatus.Active;
        factory = msg.sender;
    }

    function deposit(uint256 _amount) external nonReentrant {
        require(status == FlowStatus.Active, "Flow not active");
        require(_amount > 0, "Amount must be > 0");
        
        uint256 balanceBefore = mneeToken.balanceOf(address(this));
        require(
            mneeToken.transferFrom(msg.sender, address(this), _amount),
            "Transfer failed"
        );
        uint256 balanceAfter = mneeToken.balanceOf(address(this));
        uint256 actualAmount = balanceAfter - balanceBefore;
        
        totalAmount += actualAmount;
        remainingAmount += actualAmount;
        
        emit Deposit(msg.sender, actualAmount);
    }

    function depositFromFactory(address _depositor, uint256 _amount) external {
        require(msg.sender == factory, "Only factory can call");
        require(status == FlowStatus.Active, "Flow not active");
        require(_amount > 0, "Amount must be > 0");
        
        uint256 currentBalance = mneeToken.balanceOf(address(this));
        require(currentBalance >= _amount, "Insufficient balance in flow");
        
        totalAmount += _amount;
        remainingAmount += _amount;
        
        emit Deposit(_depositor, _amount);
    }

    function addMilestone(
        uint256 _amount,
        address _recipient
    ) external onlyOwner {
        require(status == FlowStatus.Active, "Flow not active");
        require(_amount > 0, "Amount must be > 0");
        require(_recipient != address(0), "Invalid recipient");
        
        milestones.push(Milestone({
            milestoneId: milestones.length,
            amount: _amount,
            recipient: _recipient,
            completed: false,
            paid: false
        }));
    }

    function markMilestoneComplete(uint256 _milestoneId) external onlyOwner {
        require(status == FlowStatus.Active, "Flow not active");
        require(_milestoneId < milestones.length, "Invalid milestone");
        require(!milestones[_milestoneId].completed, "Already completed");
        
        milestones[_milestoneId].completed = true;
        milestoneCompleted[_milestoneId] = true;
        
        emit MilestoneCompleted(_milestoneId);
    }

    function executeMilestonePayment(uint256 _milestoneId) external nonReentrant {
        require(status == FlowStatus.Active, "Flow not active");
        require(_milestoneId < milestones.length, "Invalid milestone");
        
        Milestone storage milestone = milestones[_milestoneId];
        require(milestone.completed, "Milestone not completed");
        require(!milestone.paid, "Already paid");
        require(remainingAmount >= milestone.amount, "Insufficient funds");
        
        milestone.paid = true;
        remainingAmount -= milestone.amount;
        
        require(
            mneeToken.transfer(milestone.recipient, milestone.amount),
            "Transfer failed"
        );
        
        emit PaymentExecuted(milestone.recipient, milestone.amount);
        
        if (remainingAmount == 0) {
            status = FlowStatus.Completed;
            emit FlowCompleted();
        }
    }

    function addSplit(address _recipient, uint256 _percentage) external onlyOwner {
        require(status == FlowStatus.Active, "Flow not active");
        require(_recipient != address(0), "Invalid recipient");
        require(_percentage > 0 && _percentage <= 100, "Invalid percentage");
        
        splits.push(Split({
            recipient: _recipient,
            percentage: _percentage
        }));
    }

    function executeSplitPayment() external nonReentrant {
        require(status == FlowStatus.Active, "Flow not active");
        require(splits.length > 0, "No splits configured");
        require(remainingAmount > 0, "No funds to split");
        
        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < splits.length; i++) {
            totalPercentage += splits[i].percentage;
        }
        require(totalPercentage == 100, "Percentages must sum to 100");
        
        for (uint256 i = 0; i < splits.length; i++) {
            uint256 amount = (remainingAmount * splits[i].percentage) / 100;
            if (amount > 0) {
                require(
                    mneeToken.transfer(splits[i].recipient, amount),
                    "Transfer failed"
                );
                emit PaymentExecuted(splits[i].recipient, amount);
            }
        }
        
        remainingAmount = 0;
        status = FlowStatus.Completed;
        emit FlowCompleted();
    }

    function pause() external onlyOwner {
        require(status == FlowStatus.Active, "Not active");
        status = FlowStatus.Paused;
        emit FlowPaused();
    }

    function resume() external onlyOwner {
        require(status == FlowStatus.Paused, "Not paused");
        status = FlowStatus.Active;
        emit FlowResumed();
    }

    function cancel() external onlyOwner nonReentrant {
        require(
            status == FlowStatus.Active || status == FlowStatus.Paused,
            "Cannot cancel"
        );
        
        if (remainingAmount > 0) {
            require(
                mneeToken.transfer(owner(), remainingAmount),
                "Refund failed"
            );
        }
        
        status = FlowStatus.Cancelled;
        remainingAmount = 0;
        emit FlowCancelled();
    }

    function getMilestoneCount() external view returns (uint256) {
        return milestones.length;
    }

    function getSplitCount() external view returns (uint256) {
        return splits.length;
    }
}
