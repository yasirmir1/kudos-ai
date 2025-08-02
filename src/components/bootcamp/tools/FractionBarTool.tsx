import React, { useState } from 'react';
import { Plus, Minus, Grid, Trash2 } from 'lucide-react';

export const FractionBarTool = () => {
  const [fractions, setFractions] = useState([
    { id: 1, numerator: 1, denominator: 2, color: '#8B5CF6' },
    { id: 2, numerator: 1, denominator: 4, color: '#3B82F6' }
  ]);
  const [showGrid, setShowGrid] = useState(true);
  const [selectedFraction, setSelectedFraction] = useState(null);

  const addFraction = () => {
    const newFraction = {
      id: Date.now(),
      numerator: 1,
      denominator: 2,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`
    };
    setFractions([...fractions, newFraction]);
  };

  const updateFraction = (id: number, field: string, value: string) => {
    setFractions(fractions.map(f => 
      f.id === id ? { ...f, [field]: parseInt(value) || 1 } : f
    ));
  };

  const removeFraction = (id: number) => {
    setFractions(fractions.filter(f => f.id !== id));
  };

  const FractionBar = ({ fraction, isSelected, onSelect }: any) => {
    const segments = [];
    for (let i = 0; i < fraction.denominator; i++) {
      segments.push(
        <div
          key={i}
          className={`flex-1 border border-gray-300 transition-all ${
            i < fraction.numerator ? 'opacity-100' : 'opacity-20'
          }`}
          style={{ backgroundColor: i < fraction.numerator ? fraction.color : '#f3f4f6' }}
        />
      );
    }

    return (
      <div
        className={`mb-4 p-4 bg-white rounded-lg shadow-sm cursor-pointer transition-all ${
          isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'
        }`}
        onClick={() => onSelect(fraction.id)}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <input
                type="number"
                value={fraction.numerator}
                onChange={(e) => updateFraction(fraction.id, 'numerator', e.target.value)}
                className="w-12 text-center border-b border-gray-300 focus:border-primary outline-none"
                min="0"
                max={fraction.denominator}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="border-t-2 border-gray-400 my-1" />
              <input
                type="number"
                value={fraction.denominator}
                onChange={(e) => updateFraction(fraction.id, 'denominator', e.target.value)}
                className="w-12 text-center border-b border-gray-300 focus:border-primary outline-none"
                min="1"
                max="12"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <span className="text-lg font-medium text-gray-700">
              = {((fraction.numerator / fraction.denominator) * 100).toFixed(0)}%
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeFraction(fraction.id);
            }}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <Trash2 className="h-4 w-4 text-gray-500" />
          </button>
        </div>
        <div className="flex h-12 gap-1 rounded overflow-hidden">
          {segments}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-muted rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Fraction Bar Tool</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded-lg transition-colors ${
              showGrid ? 'bg-primary text-primary-foreground' : 'bg-background'
            }`}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={addFraction}
            className="flex items-center space-x-1 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm">Add Fraction</span>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {fractions.map(fraction => (
          <FractionBar
            key={fraction.id}
            fraction={fraction}
            isSelected={selectedFraction === fraction.id}
            onSelect={setSelectedFraction}
          />
        ))}
      </div>

      {fractions.length > 1 && (
        <div className="mt-6 p-4 bg-primary/5 rounded-lg">
          <h4 className="font-medium text-primary mb-2">Compare Fractions</h4>
          <p className="text-sm text-muted-foreground">
            Click on fractions to compare them. Notice how different denominators affect the size of each part.
          </p>
        </div>
      )}
    </div>
  );
};