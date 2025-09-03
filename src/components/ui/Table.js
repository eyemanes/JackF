import React from 'react';

const Table = ({ 
  children, 
  className = '',
  sticky = false,
  compact = false
}) => {
  const baseClasses = 'w-full border-collapse';
  const stickyClasses = sticky ? 'sticky top-0 z-10' : '';
  const compactClasses = compact ? 'text-sm' : '';
  
  return (
    <div className="overflow-x-auto rounded-xl border border-white/5 bg-gray-900/50 backdrop-blur-sm">
      <table className={`${baseClasses} ${compactClasses} ${className}`}>
        {children}
      </table>
    </div>
  );
};

const TableHeader = ({ children, className = '', sticky = false }) => {
  const stickyClasses = sticky ? 'sticky top-0 z-10' : '';
  
  return (
    <thead className={`bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-b border-blue-500/20 ${stickyClasses} ${className}`}>
      {children}
    </thead>
  );
};

const TableBody = ({ children, className = '' }) => {
  return (
    <tbody className={`divide-y divide-blue-500/10 ${className}`}>
      {children}
    </tbody>
  );
};

const TableRow = ({ 
  children, 
  className = '', 
  hover = true,
  zebra = false,
  index = 0
}) => {
  const hoverClasses = hover ? 'hover:bg-blue-600/5 transition-all duration-200' : '';
  const zebraClasses = zebra ? (index % 2 === 0 ? 'bg-gray-900/30' : 'bg-gray-900/10') : '';
  
  return (
    <tr className={`group ${hoverClasses} ${zebraClasses} ${className}`}>
      {children}
    </tr>
  );
};

const TableCell = ({ 
  children, 
  className = '', 
  align = 'left',
  padding = 'p-4'
}) => {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };
  
  return (
    <td className={`${padding} ${alignClasses[align]} ${className}`}>
      {children}
    </td>
  );
};

const TableHeaderCell = ({ 
  children, 
  className = '', 
  align = 'left',
  padding = 'p-4'
}) => {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };
  
  return (
    <th className={`${padding} text-blue-300 font-semibold text-sm uppercase tracking-wider ${alignClasses[align]} ${className}`}>
      {children}
    </th>
  );
};

Table.Header = TableHeader;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Cell = TableCell;
Table.HeaderCell = TableHeaderCell;

export default Table;
