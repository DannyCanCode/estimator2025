import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2, Save, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { PricingTemplate, pricingTemplateService } from '@/services/pricingTemplateService';

export default function Settings() {
  const [templates, setTemplates] = useState<PricingTemplate[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<PricingTemplate | null>(null);
  const [newMaterialName, setNewMaterialName] = useState('');
  const [newMaterialRetailPrice, setNewMaterialRetailPrice] = useState('');
  const [newMaterialOurCost, setNewMaterialOurCost] = useState('');
  const [newMaterialUnit, setNewMaterialUnit] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const data = await pricingTemplateService.getTemplates();
      setTemplates(data);
    } catch (error) {
      toast.error('Failed to load templates');
      console.error('Error loading templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      const newTemplate = await pricingTemplateService.createTemplate({
        name: `Template ${templates.length + 1}`,
        materials: {}
      });
      setTemplates([newTemplate, ...templates]);
      setCurrentTemplate(newTemplate);
      toast.success('Template created successfully');
    } catch (error) {
      toast.error('Failed to create template');
      console.error('Error creating template:', error);
    }
  };

  const handleAddMaterial = () => {
    if (!currentTemplate || !newMaterialName || !newMaterialRetailPrice || !newMaterialOurCost || !newMaterialUnit) return;

    const updatedTemplate = {
      ...currentTemplate,
      materials: {
        ...currentTemplate.materials,
        [newMaterialName]: {
          name: newMaterialName,
          retailPrice: parseFloat(newMaterialRetailPrice),
          ourCost: parseFloat(newMaterialOurCost),
          unit: newMaterialUnit
        }
      }
    };

    setCurrentTemplate(updatedTemplate);
    setIsEditing(true);
    
    // Reset form
    setNewMaterialName('');
    setNewMaterialRetailPrice('');
    setNewMaterialOurCost('');
    setNewMaterialUnit('');
  };

  const handleRemoveMaterial = (materialName: string) => {
    if (!currentTemplate) return;

    const { [materialName]: removed, ...remainingMaterials } = currentTemplate.materials;
    const updatedTemplate = {
      ...currentTemplate,
      materials: remainingMaterials
    };

    setCurrentTemplate(updatedTemplate);
    setIsEditing(true);
  };

  const handleSaveTemplate = async () => {
    if (!currentTemplate) return;

    try {
      await pricingTemplateService.updateTemplate(currentTemplate.id, {
        materials: currentTemplate.materials
      });
      
      setTemplates(templates.map(t => 
        t.id === currentTemplate.id ? currentTemplate : t
      ));
      
      setIsEditing(false);
      toast.success('Template saved successfully');
    } catch (error) {
      toast.error('Failed to save template');
      console.error('Error saving template:', error);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      await pricingTemplateService.deleteTemplate(templateId);
      setTemplates(templates.filter(t => t.id !== templateId));
      if (currentTemplate?.id === templateId) {
        setCurrentTemplate(null);
      }
      toast.success('Template deleted successfully');
    } catch (error) {
      toast.error('Failed to delete template');
      console.error('Error deleting template:', error);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Templates List */}
        <Card className="md:col-span-1">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Pricing Templates</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCreateTemplate}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                New Template
              </Button>
            </div>
            <div className="space-y-2">
              {isLoading ? (
                <div className="text-center py-4 text-gray-500">Loading templates...</div>
              ) : templates.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No templates yet</div>
              ) : (
                templates.map(template => (
                  <div
                    key={template.id}
                    className={`p-3 rounded-lg cursor-pointer ${
                      currentTemplate?.id === template.id
                        ? 'bg-blue-100 border border-blue-300'
                        : 'hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div onClick={() => setCurrentTemplate(template)}>
                        <span className="font-medium">{template.name}</span>
                        <span className="text-sm text-gray-500 block">
                          {Object.keys(template.materials).length} materials
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Template Editor */}
        {currentTemplate && (
          <Card className="md:col-span-2">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">Edit Template: {currentTemplate.name}</h2>
                  {isEditing && (
                    <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      Unsaved changes
                    </span>
                  )}
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSaveTemplate}
                  disabled={!isEditing}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>

              {/* Add New Material Form */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="col-span-2 md:col-span-1">
                  <Label htmlFor="materialName">Material Name</Label>
                  <Input
                    id="materialName"
                    value={newMaterialName}
                    onChange={(e) => setNewMaterialName(e.target.value)}
                    placeholder="Name"
                  />
                </div>
                <div>
                  <Label htmlFor="retailPrice">Retail Price</Label>
                  <Input
                    id="retailPrice"
                    type="number"
                    value={newMaterialRetailPrice}
                    onChange={(e) => setNewMaterialRetailPrice(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="ourCost">Our Cost</Label>
                  <Input
                    id="ourCost"
                    type="number"
                    value={newMaterialOurCost}
                    onChange={(e) => setNewMaterialOurCost(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={newMaterialUnit}
                    onChange={(e) => setNewMaterialUnit(e.target.value)}
                    placeholder="EA/SQ/etc"
                  />
                </div>
                <div className="col-span-2 md:col-span-5">
                  <Button
                    onClick={handleAddMaterial}
                    className="w-full"
                    disabled={!newMaterialName || !newMaterialRetailPrice || !newMaterialOurCost || !newMaterialUnit}
                  >
                    Add Material
                  </Button>
                </div>
              </div>

              {/* Materials List */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Material</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Retail Price</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Our Cost</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Unit</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(currentTemplate.materials).map(([key, material]) => (
                      <tr key={key}>
                        <td className="px-4 py-3 text-sm">{material.name}</td>
                        <td className="px-4 py-3 text-sm">${material.retailPrice.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm">${material.ourCost.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm">{material.unit}</td>
                        <td className="px-4 py-3 text-sm">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMaterial(material.name)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 