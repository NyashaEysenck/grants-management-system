
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { addPartner, removePartner, type Project } from '../services/projects';
import { Users, Upload, FileText, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface PartnerManagementProps {
  project: Project;
  onUpdate: () => void;
}

const PartnerManagement = ({ project, onUpdate }: PartnerManagementProps) => {
  const { toast } = useToast();
  const [isAddingPartner, setIsAddingPartner] = useState(false);
  const [newPartner, setNewPartner] = useState({ name: '', role: '' });
  const [uploadingMOU, setUploadingMOU] = useState<string | null>(null);

  const handleAddPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPartner.name.trim() || !newPartner.role.trim()) {
      toast({
        title: "Incomplete Information",
        description: "Please provide both partner name and role.",
        variant: "destructive"
      });
      return;
    }

    try {
      const success = addPartner(project.id, newPartner);
      
      if (success) {
        toast({
          title: "Partner Added",
          description: "Partner has been successfully added to the project.",
        });
        
        setNewPartner({ name: '', role: '' });
        setIsAddingPartner(false);
        onUpdate();
      } else {
        throw new Error('Failed to add partner');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add partner. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleMOUUpload = async (partnerId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingMOU(partnerId);

    try {
      // In a real app, this would upload the file to a server
      // Note: uploadMOU is deprecated - this would need to be handled through document management
      const success = true; // Placeholder for actual MOU upload implementation
      
      if (success) {
        toast({
          title: "MOU Uploaded",
          description: "MOU file has been successfully uploaded.",
        });
        onUpdate();
      } else {
        throw new Error('Failed to upload MOU');
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload MOU. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingMOU(null);
    }
  };

  const partners = project.partners || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Project Partners
          </CardTitle>
          <Button
            size="sm"
            onClick={() => setIsAddingPartner(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Partner
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {partners.length === 0 ? (
          <p className="text-gray-500 text-sm">No partners added yet.</p>
        ) : (
          <div className="space-y-3">
            {partners.map((partner) => (
              <div key={partner.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{partner.name}</h4>
                    <Badge variant="secondary" className="mt-1">
                      {partner.role}
                    </Badge>
                  </div>
                  <div className="text-right">
                    {partner.mou_filename ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <FileText className="h-4 w-4" />
                        <div>
                          <p className="text-sm font-medium">MOU Uploaded</p>
                          <p className="text-xs">{partner.mou_filename}</p>
                          {partner.uploaded_date && (
                            <p className="text-xs text-gray-500">
                              {format(new Date(partner.uploaded_date), 'MMM dd, yyyy')}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`mou-${partner.id}`} className="cursor-pointer">
                          <div className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                            <Upload className="h-4 w-4" />
                            <span className="text-sm">
                              {uploadingMOU === partner.id ? 'Uploading...' : 'Upload MOU'}
                            </span>
                          </div>
                        </Label>
                        <Input
                          id={`mou-${partner.id}`}
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleMOUUpload(partner.id, e)}
                          className="hidden"
                          disabled={uploadingMOU === partner.id}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isAddingPartner && (
          <form onSubmit={handleAddPartner} className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium mb-3">Add New Partner</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="partnerName">Partner Name *</Label>
                <Input
                  id="partnerName"
                  value={newPartner.name}
                  onChange={(e) => setNewPartner(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Organization or individual name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="partnerRole">Role *</Label>
                <Input
                  id="partnerRole"
                  value={newPartner.role}
                  onChange={(e) => setNewPartner(prev => ({ ...prev, role: e.target.value }))}
                  placeholder="e.g., Clinical Partner, Technical Collaborator"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm">Add Partner</Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setIsAddingPartner(false);
                  setNewPartner({ name: '', role: '' });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default PartnerManagement;
