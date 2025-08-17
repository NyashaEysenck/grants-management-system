import { apiClient } from '../../../lib/api';
import { ResearcherBiodata } from '../types';
import { handleBiodataError } from '../utils/errorHandling';

/**
 * Save biodata for the current user
 */
export const saveBiodata = async (email: string, biodata: ResearcherBiodata): Promise<void> => {
  try {
    console.log('Saving biodata for user:', email, biodata);
    
    await apiClient.put('/users/me/biodata', biodata);
    
    console.log('Biodata saved successfully');
  } catch (error) {
    handleBiodataError(error);
  }
};

/**
 * Get biodata for the current user
 */
export const getBiodata = async (email: string): Promise<ResearcherBiodata | null> => {
  try {
    console.log('Getting biodata for user:', email);
    
    const response = await apiClient.get('/users/me/biodata');
    console.log('Biodata retrieved successfully:', response);
    
    return response.biodata || null;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null; // No biodata found
    }
    
    handleBiodataError(error);
  }
};
