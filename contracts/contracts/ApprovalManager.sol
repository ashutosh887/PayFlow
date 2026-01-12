pragma solidity ^0.8.20;

contract ApprovalManager {
    struct Approval {
        uint256 approvalId;
        address[] approvers;
        uint256 requiredApprovals;
        mapping(address => bool) hasApproved;
        uint256 approvalCount;
        bool isApproved;
    }

    mapping(uint256 => Approval) public approvals;
    uint256 public nextApprovalId;

    event ApprovalCreated(uint256 indexed approvalId, address[] approvers, uint256 requiredApprovals);
    event ApprovalGiven(uint256 indexed approvalId, address approver);
    event ApprovalThresholdMet(uint256 indexed approvalId);

    function createApproval(
        address[] memory _approvers,
        uint256 _requiredApprovals
    ) external returns (uint256) {
        require(_approvers.length > 0, "No approvers provided");
        require(_requiredApprovals > 0, "Required approvals must be > 0");
        require(_requiredApprovals <= _approvers.length, "Required approvals exceed approvers");

        uint256 approvalId = nextApprovalId++;
        Approval storage approval = approvals[approvalId];
        approval.approvalId = approvalId;
        approval.approvers = _approvers;
        approval.requiredApprovals = _requiredApprovals;
        approval.approvalCount = 0;
        approval.isApproved = false;

        emit ApprovalCreated(approvalId, _approvers, _requiredApprovals);
        return approvalId;
    }

    function approve(uint256 _approvalId) external {
        Approval storage approval = approvals[_approvalId];
        require(!approval.isApproved, "Already approved");
        require(!approval.hasApproved[msg.sender], "Already approved by this address");

        bool isApprover = false;
        for (uint256 i = 0; i < approval.approvers.length; i++) {
            if (approval.approvers[i] == msg.sender) {
                isApprover = true;
                break;
            }
        }
        require(isApprover, "Not an approver");

        approval.hasApproved[msg.sender] = true;
        approval.approvalCount++;

        emit ApprovalGiven(_approvalId, msg.sender);

        if (approval.approvalCount >= approval.requiredApprovals) {
            approval.isApproved = true;
            emit ApprovalThresholdMet(_approvalId);
        }
    }

    function isApproved(uint256 _approvalId) external view returns (bool) {
        return approvals[_approvalId].isApproved;
    }

    function getApprovalStatus(uint256 _approvalId) external view returns (
        uint256 approvalCount,
        uint256 requiredApprovals,
        bool isApprovedStatus
    ) {
        Approval storage approval = approvals[_approvalId];
        return (
            approval.approvalCount,
            approval.requiredApprovals,
            approval.isApproved
        );
    }

    function resetApproval(uint256 _approvalId) external {
        Approval storage approval = approvals[_approvalId];
        require(approval.isApproved, "Not approved yet");
        
        approval.approvalCount = 0;
        approval.isApproved = false;
        
        for (uint256 i = 0; i < approval.approvers.length; i++) {
            approval.hasApproved[approval.approvers[i]] = false;
        }
    }
}
