import { Application } from './types';

export const mapApplicationResponse = (src: any): Application => {
  return {
    id: src.id,
    grantId: src.grantId,
    applicantName: src.applicantName,
    email: src.email,
    proposalTitle: src.proposalTitle,
    status: src.status || 'submitted',
    submissionDate: src.submissionDate || new Date().toISOString(),
    reviewComments: src.reviewComments || '',
    biodata: src.biodata,
    deadline: src.deadline,
    isEditable: src.isEditable || false,
    reviewHistory: src.reviewHistory || [],
    revisionNotes: src.revisionNotes || [],
    signOffApprovals: src.signOffApprovals || [],
    awardAmount: src.awardAmount,
    contractFileName: src.contractFileName,
    awardLetterGenerated: src.awardLetterGenerated || false,
    revisionCount: src.revisionCount || 0,
    originalSubmissionDate: src.originalSubmissionDate,
    proposalFileName: src.proposalFileName,
  };
};

export const mapApplicationsList = (list: any[]): Application[] => {
  return list.map(mapApplicationResponse);
};
