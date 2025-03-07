import React from 'react';
import { useApp } from '../context/AppContext';

function DataGrid() {
  const { selectedProperties, setMapFocus } = useApp();

  const handleRowClick = (property: any) => {
    setMapFocus({
      longitude: property.longitude,
      latitude: property.latitude,
      zoom: 15,
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 px-6 py-3 border-b border-red-900/30">
        <h2 className="text-lg font-semibold text-red-500">
          Selected Properties ({selectedProperties.length})
        </h2>
        <div className="text-sm text-gray-400">
          Total Value: ${selectedProperties.reduce((sum, p) => sum + p.value, 0).toLocaleString()}
        </div>
      </div>
      <div className="overflow-auto flex-1 border border-red-900/30 bg-black/30 backdrop-blur-sm rounded-xl">
        <table className="min-w-full divide-y divide-red-900/30">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider">
                Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider">
                Cluster
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-red-900/30">
            {selectedProperties.map((property) => (
              <tr
                key={property.id}
                onClick={() => handleRowClick(property)}
                className="hover:bg-red-500/10 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {property.address}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  ${property.value.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {property.cluster}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataGrid;