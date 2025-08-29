
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, Download, Upload, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { getSignOffStatus, type Application, type SignOffApproval } from '../services/applications';
import AwardDocumentUpload from './AwardDocumentUpload';
import AwardAcceptanceDialog from './AwardAcceptanceDialog';

interface SignOffStatusCardProps {
  application: Application;
  userRole: string;
  onContractUpload?: (applicationId: string) => void;
  onUpdate?: () => void;
}

const SignOffStatusCard = ({ application, userRole, onContractUpload, onUpdate }: SignOffStatusCardProps) => {
  const signOffStatus = getSignOffStatus(application);
  const [showAcceptanceDialog, setShowAcceptanceDialog] = React.useState(false);

  const getStatusIcon = (status: SignOffApproval['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: SignOffApproval['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const canDownloadAwardLetter = application.status === 'signoff_approved' && application.awardLetterGenerated;
  const canUploadContract = application.status === 'signoff_approved';
  const showContractStatus = application.status === 'contract_pending' || application.status === 'contract_received';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Institutional Sign-off Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {application.awardAmount && (
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-green-800">
              <span className="font-medium">Award Amount:</span> ${application.awardAmount.toLocaleString()}
            </p>
          </div>
        )}

        {application.signOffApprovals && application.signOffApprovals.length > 0 ? (
          <>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-gray-600">
                  {signOffStatus.completed}/{signOffStatus.total} approved
                </span>
              </div>
              <Progress 
                value={(signOffStatus.completed / signOffStatus.total) * 100} 
                className="h-2"
              />
              <p className="text-sm text-gray-600">{signOffStatus.current}</p>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm">Approval Chain</h4>
              {application.signOffApprovals.map((approval) => (
                <div key={approval.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(approval.status)}
                    <div>
                      <p className="font-medium text-sm">{approval.role}</p>
                      <p className="text-xs text-gray-600">
                        {approval.approverName || approval.approverEmail}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(approval.status)}>
                      {approval.status}
                    </Badge>
                    {approval.approvedAt && (
                      <span className="text-xs text-gray-500">
                        {format(new Date(approval.approvedAt), 'MMM dd, yyyy')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {application.signOffApprovals.some(a => a.comments) && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Comments</h4>
                {application.signOffApprovals
                  .filter(a => a.comments)
                  .map((approval) => (
                    <div key={approval.id} className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-medium">{approval.role}:</p>
                      <p className="text-sm text-gray-700">{approval.comments}</p>
                    </div>
                  ))
                }
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-600">Sign-off workflow not yet initiated.</p>
        )}

        {/* Award Document Upload/Management */}
        {(application.status === 'signoff_approved' || application.status === 'award_pending_acceptance' || application.status === 'award_accepted') && (
          <AwardDocumentUpload 
            applicationId={application.id}
            userRole={userRole}
            onDocumentUploaded={onUpdate}
          />
        )}

        {/* Award Acceptance */}
        {application.status === 'award_pending_acceptance' && userRole.toLowerCase() === 'researcher' && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <FileText className="h-4 w-4 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800">Award Decision Required</p>
              <p className="text-xs text-blue-600">Please review and accept or reject your award.</p>
            </div>
            <Button size="sm" variant="default" onClick={() => setShowAcceptanceDialog(true)}>
              Make Decision
            </Button>
          </div>
        )}

        {showAcceptanceDialog && (
          <AwardAcceptanceDialog
            applicationId={application.id}
            applicationTitle={application.proposalTitle}
            awardAmount={application.awardAmount}
            isOpen={showAcceptanceDialog}
            onClose={() => setShowAcceptanceDialog(false)}
            onDecisionMade={() => onUpdate?.()}
          />
        )}

        {/* Contract Upload */}
        {canUploadContract && !showContractStatus && (
          <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
            <Upload className="h-4 w-4 text-orange-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-800">Contract Required</p>
              <p className="text-xs text-orange-600">Please upload your signed contract to complete the process.</p>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onContractUpload?.(application.id)}
            >
              Upload Contract
            </Button>
          </div>
        )}

        {/* Contract Status */}
        {showContractStatus && (
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
            <FileText className="h-4 w-4 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">
                Contract {application.status === 'contract_received' ? 'Received' : 'Submitted'}
              </p>
              <p className="text-xs text-green-600">
                {application.contractFileName}
                {application.status === 'contract_pending' && ' - Awaiting confirmation'}
              </p>
            </div>
            {application.status === 'contract_received' && (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SignOffStatusCard;
