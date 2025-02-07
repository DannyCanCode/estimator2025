import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface PricingItem {
  id: string;
  name: string;
  retail: number;
  unit: string;
}

const initialPricingData: PricingItem[] = [
  { id: '1', name: 'Remove, Haul and dispose of existing material', retail: 0.00, unit: 'SQ' },
  { id: '2', name: 'Re-Nail the decking and trusses Per FL Building Code', retail: 0.00, unit: 'EA' },
  { id: '3', name: 'GAF Timberline HDZ SG', retail: 152.10, unit: 'SQ' },
  { id: '4', name: 'GAF Seal-A-Ridge (25\')', retail: 66.41, unit: 'BD' },
  { id: '5', name: 'GAF ProStart Starter Shingle Strip (120\')', retail: 63.25, unit: 'BD' },
  { id: '6', name: 'GAF Weatherwatch Ice & Water Shield (2sq)', retail: 117.50, unit: 'EA' },
  { id: '7', name: 'GAF FeltBuster Synthetic Underlayment (10 sq)', retail: 104.94, unit: 'RL' },
];

export default function PricingList() {
  const [pricingData, setPricingData] = useState<PricingItem[]>(initialPricingData);
  const [newItem, setNewItem] = useState<Omit<PricingItem, 'id'>>({
    name: '',
    retail: 0,
    unit: '',
  });

  const handlePriceChange = (id: string, newPrice: number) => {
    setPricingData(pricingData.map(item => 
      item.id === id ? { ...item, retail: newPrice } : item
    ));
  };

  const handleAddItem = () => {
    const id = (pricingData.length + 1).toString();
    setPricingData([...pricingData, { ...newItem, id }]);
    setNewItem({ name: '', retail: 0, unit: '' });
  };

  const handleDeleteItem = (id: string) => {
    setPricingData(pricingData.filter(item => item.id !== id));
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Pricing List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left">Item</th>
                  <th className="py-2 text-right">Retail Price</th>
                  <th className="py-2 text-center">Unit</th>
                  <th className="py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pricingData.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-2">{item.name}</td>
                    <td className="py-2">
                      <Input
                        type="number"
                        value={item.retail}
                        onChange={(e) => handlePriceChange(item.id, parseFloat(e.target.value))}
                        className="w-32 text-right"
                        step="0.01"
                      />
                    </td>
                    <td className="py-2 text-center">{item.unit}</td>
                    <td className="py-2 text-center">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid grid-cols-4 gap-4">
            <Input
              placeholder="Item Name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Retail Price"
              value={newItem.retail}
              onChange={(e) => setNewItem({ ...newItem, retail: parseFloat(e.target.value) })}
              step="0.01"
            />
            <Input
              placeholder="Unit"
              value={newItem.unit}
              onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
            />
            <Button onClick={handleAddItem}>Add Item</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 