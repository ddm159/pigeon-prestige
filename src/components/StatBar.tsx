import React from 'react';

interface StatBarProps {
  value: number;
  max: number;
  label: string;
}

const StatBar: React.FC<StatBarProps> = ({ value, max, label }) => (
  <div className="flex items-center space-x-2">
    <div className="w-24 text-xs text-gray-700">{label}</div>
    <div className="flex-1 h-3 bg-gray-200 rounded">
      <div
        className="h-3 rounded bg-primary-500"
        style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
      ></div>
    </div>
    <div className="w-10 text-xs text-right text-gray-600">{value.toFixed(2)}</div>
  </div>
);

export default StatBar; 