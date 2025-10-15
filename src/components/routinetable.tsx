import React, { useEffect, useState } from 'react';

// Type definitions
type Subject = string;
type ClassName = string;
type DateString = string;

interface ClassSchedule {
  name: ClassName;
  subjects: Subject[];
}

interface ScheduleData {
  dates: DateString[];
  classes: ClassSchedule[];
}

interface ClassScheduleProps {
  data?: ScheduleData;
  title?: string;
  compact?: boolean;
  editable?: boolean;
  onDataChange?: (data: ScheduleData) => void;
}

interface EditingCell {
  type: 'date' | 'className' | 'subject';
  rowIndex?: number;
  colIndex?: number;
  value: string;
}

interface Class {
  _id: string;
  name: string;
  sections: string[];
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  count: number;
  data: Class[];
}

/**
 * Universal Class Schedule Component with Multiple Export Options
 */
const UniversalExportClassSchedule: React.FC<ClassScheduleProps> = ({ 
  data, 
  title = "First terminal exam routine",
  compact = false,
  editable = true,
  onDataChange
}) => {
  const [fetchClasses, setFetchClasses] = useState<Class[]>([]);
  const [scheduleData, setScheduleData] = useState<ScheduleData>(data || {
    dates: [''],
    classes: [{ name: '', subjects: [''] }]
  });
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchClass = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/class-sections');
      if (!response.ok) throw new Error('Failed to fetch classes');
      
      const result: ApiResponse = await response.json();
      console.log('API Response:', result);
      
      if (result.success && result.data) {
        setFetchClasses(result.data);
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.log('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClass();
  }, []);

  useEffect(() => {
    console.log('Fetched classes:', fetchClasses);
    console.log('Current data prop:', data);
    
    // Only initialize if no data prop provided AND we have fetched classes
    if (!data && fetchClasses.length > 0) {
      console.log('Initializing schedule data with fetched classes');
      const initializedData: ScheduleData = {
        dates: ['Select Date'],
        classes: fetchClasses.map((cls) => ({
          name: cls.name,
          subjects: ['']
        }))
      };
      console.log('Initialized data:', initializedData);
      setScheduleData(initializedData);
      
      if (onDataChange) {
        onDataChange(initializedData);
      }
    }
  }, [fetchClasses, data, onDataChange]);

  // Handle cell click to start editing
  const handleCellClick = (type: 'date' | 'className' | 'subject', rowIndex?: number, colIndex?: number, currentValue: string = '') => {
    if (editable) {
      setEditingCell({ type, rowIndex, colIndex, value: currentValue });
      setEditValue(currentValue);
    }
  };

  // Handle input change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(event.target.value);
  };

  // Save the edited value
  const handleSave = () => {
    if (editingCell) {
      const { type, rowIndex, colIndex } = editingCell;
      const updatedData = { ...scheduleData };

      switch (type) {
        case 'date':
          if (colIndex !== undefined) {
            updatedData.dates = [...scheduleData.dates];
            updatedData.dates[colIndex] = editValue;
          }
          break;

        case 'className':
          if (rowIndex !== undefined) {
            updatedData.classes = [...scheduleData.classes];
            updatedData.classes[rowIndex] = {
              ...scheduleData.classes[rowIndex],
              name: editValue
            };
          }
          break;

        case 'subject':
          if (rowIndex !== undefined && colIndex !== undefined) {
            updatedData.classes = [...scheduleData.classes];
            updatedData.classes[rowIndex] = {
              ...scheduleData.classes[rowIndex],
              subjects: [...scheduleData.classes[rowIndex].subjects]
            };
            updatedData.classes[rowIndex].subjects[colIndex] = editValue;
          }
          break;
      }

      setScheduleData(updatedData);
      
      if (onDataChange) {
        onDataChange(updatedData);
      }
      
      setEditingCell(null);
      setEditValue('');
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  // Handle key press (Enter to save, Escape to cancel)
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSave();
    } else if (event.key === 'Escape') {
      handleCancel();
    }
  };

  // Handle input blur (click outside)
  const handleBlur = () => {
    handleSave();
  };

  // Add new class row
  const handleAddClass = () => {
    const newClass: ClassSchedule = {
      name: `Class ${scheduleData.classes.length + 1}`,
      subjects: Array(scheduleData.dates.length).fill('')
    };
    
    const updatedData = {
      ...scheduleData,
      classes: [...scheduleData.classes, newClass]
    };
    
    setScheduleData(updatedData);
    
    if (onDataChange) {
      onDataChange(updatedData);
    }
  };

  // Add new date column
  const handleAddDate = () => {
    const newDate = `Date ${scheduleData.dates.length + 1}`;
    
    const updatedData = {
      dates: [...scheduleData.dates, newDate],
      classes: scheduleData.classes.map(cls => ({
        ...cls,
        subjects: [...cls.subjects, '']
      }))
    };
    
    setScheduleData(updatedData);
    
    if (onDataChange) {
      onDataChange(updatedData);
    }
  };

  // Delete date column
  const handleDeleteDate = (colIndex: number) => {
    const updatedData = {
      dates: scheduleData.dates.filter((_, index) => index !== colIndex),
      classes: scheduleData.classes.map(cls => ({
        ...cls,
        subjects: cls.subjects.filter((_, index) => index !== colIndex)
      }))
    };
    
    setScheduleData(updatedData);
    
    if (onDataChange) {
      onDataChange(updatedData);
    }
  };

  // Delete class row
  const handleDeleteClass = (rowIndex: number) => {
    const updatedData = {
      ...scheduleData,
      classes: scheduleData.classes.filter((_, index) => index !== rowIndex)
    };
    
    setScheduleData(updatedData);
    
    if (onDataChange) {
      onDataChange(updatedData);
    }
  };

  // Export functions (same as before)
  const exportToDOC = () => {
    const docContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office'
      xmlns:w='urn:schemas-microsoft-com:office:word'
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
    <meta charset="utf-8">
    <title>${title}</title>
    <xml>
        <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
    </xml>
    <style>
        @page {
            size: A4;
            margin: 2cm;
            mso-page-orientation: portrait;
        }
        body {
            font-family: "Arial", sans-serif;
            margin: 0;
            padding: 0;
            line-height: 1.6;
            color: #000000;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
        }
        h1 {
            font-size: 24pt;
            color: #2c3e50;
            margin: 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            border: 1px solid #000000;
            mso-border-alt: solid windowtext .5pt;
        }
        th, td {
            border: 1px solid #000000;
            padding: 12px;
            text-align: center;
            mso-border-alt: solid windowtext .5pt;
        }
        th {
            background-color: #f5f5f5;
            font-weight: bold;
            font-size: 12pt;
            mso-pattern: solid #F5F5F5;
        }
        .class-name {
            background-color: #e8f4f8;
            font-weight: bold;
            mso-pattern: solid #E8F4F8;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 10pt;
            border-top: 1px solid #ccc;
            padding-top: 10px;
        }
        .document-info {
            font-size: 9pt;
            color: #888;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${title}</h1>
    </div>
    
    <table>
        <thead>
            <tr>
                <th>Class / Date</th>
                ${scheduleData.dates.map(date => `<th>${date}</th>`).join('')}
            </tr>
        </thead>
        <tbody>
            ${scheduleData.classes.map(classItem => `
            <tr>
                <td class="class-name">${classItem.name}</td>
                ${classItem.subjects.map(subject => `<td>${subject || '-'}</td>`).join('')}
            </tr>
            `).join('')}
        </tbody>
    </table>
    
    <div class="footer">
        <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        <div class="document-info">
            Document: ${title} | Total Classes: ${scheduleData.classes.length} | Total Dates: ${scheduleData.dates.length}
        </div>
    </div>
</body>
</html>`;

    const blob = new Blob([docContent], { 
        type: 'application/msword;charset=utf-8' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToHTML = () => {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 40px;
            line-height: 1.6;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: center;
        }
        th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
        .class-name {
            background-color: #f9f9f9;
            font-weight: bold;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${title}</h1>
    </div>
    
    <table>
        <thead>
            <tr>
                <th>Class / Date</th>
                ${scheduleData.dates.map(date => `<th>${date}</th>`).join('')}
            </tr>
        </thead>
        <tbody>
            ${scheduleData.classes.map(classItem => `
            <tr>
                <td class="class-name">${classItem.name}</td>
                ${classItem.subjects.map(subject => `<td>${subject || '-'}</td>`).join('')}
            </tr>
            `).join('')}
        </tbody>
    </table>
    
    <div class="footer">
        Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
    </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToText = () => {
    let textContent = `${title}\n`;
    textContent += '='.repeat(title.length) + '\n\n';
    
    const classColWidth = Math.max(12, ...scheduleData.classes.map(c => c.name.length));
    const subjectColWidth = Math.max(8, ...scheduleData.classes.flatMap(c => c.subjects.map(s => s.length)));
    
    textContent += 'Class / Date'.padEnd(classColWidth) + ' | ';
    textContent += scheduleData.dates.map(date => date.padEnd(subjectColWidth)).join(' | ');
    textContent += '\n';
    
    textContent += '-'.repeat(classColWidth) + '-+-';
    textContent += scheduleData.dates.map(() => '-'.repeat(subjectColWidth)).join('-+-');
    textContent += '\n';
    
    scheduleData.classes.forEach(classItem => {
      textContent += classItem.name.padEnd(classColWidth) + ' | ';
      textContent += classItem.subjects.map(subject => 
        (subject || '-').padEnd(subjectColWidth)
      ).join(' | ');
      textContent += '\n';
    });
    
    textContent += `\nExported on: ${new Date().toLocaleDateString()}`;
    
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    let csvContent = '"Class Schedule"\n\n';
    
    csvContent += '"Class / Date"';
    scheduleData.dates.forEach(date => {
      csvContent += `,"${date}"`;
    });
    csvContent += '\n';
    
    scheduleData.classes.forEach(classItem => {
      csvContent += `"${classItem.name}"`;
      classItem.subjects.forEach(subject => {
        csvContent += `,"${subject.replace(/"/g, '""') || ''}"`;
      });
      csvContent += '\n';
    });
    
    csvContent += `\n"Exported on: ${new Date().toLocaleDateString()}"`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const printSchedule = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${title}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { text-align: center; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #000; padding: 10px; text-align: center; }
                th { background-color: #f0f0f0; }
                .class-cell { background-color: #f9f9f9; font-weight: bold; }
                @media print {
                    body { margin: 0; }
                    table { font-size: 12px; }
                }
            </style>
        </head>
        <body>
            <h1>${title}</h1>
            <table>
                <tr>
                    <th>Class / Date</th>
                    ${scheduleData.dates.map(date => `<th>${date}</th>`).join('')}
                </tr>
                ${scheduleData.classes.map(classItem => `
                <tr>
                    <td class="class-cell">${classItem.name}</td>
                    ${classItem.subjects.map(subject => `<td>${subject || '-'}</td>`).join('')}
                </tr>
                `).join('')}
            </table>
            <p style="text-align: center; margin-top: 20px;">
                Generated on ${new Date().toLocaleDateString()}
            </p>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.onafterprint = () => printWindow.close();
    }
  };

  const copyFormattedText = async () => {
    let textContent = `📚 ${title}\n\n`;
    
    textContent += '┌' + '─'.repeat(12) + '┬';
    textContent += scheduleData.dates.map(() => '─'.repeat(15)).join('┬') + '┐\n';
    
    textContent += '│ Class/Date  │ ';
    textContent += scheduleData.dates.map(date => date.padEnd(14)).join(' │ ') + ' │\n';
    
    textContent += '├' + '─'.repeat(12) + '┼';
    textContent += scheduleData.dates.map(() => '─'.repeat(15)).join('┼') + '┤\n';
    
    scheduleData.classes.forEach(classItem => {
      textContent += `│ ${classItem.name.padEnd(10)} │ `;
      textContent += classItem.subjects.map(subject => 
        (subject || '-').padEnd(14)
      ).join(' │ ') + ' │\n';
    });
    
    textContent += '└' + '─'.repeat(12) + '┴';
    textContent += scheduleData.dates.map(() => '─'.repeat(15)).join('┴') + '┘\n';
    
    try {
      await navigator.clipboard.writeText(textContent);
      alert('Schedule copied to clipboard! You can paste it anywhere.');
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = textContent;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Schedule copied to clipboard!');
    }
  };

  // Render editable content
  const renderEditableContent = (
    type: 'date' | 'className' | 'subject',
    value: string,
    rowIndex?: number,
    colIndex?: number
  ) => {
    const isEditing = 
      editingCell?.type === type && 
      editingCell?.rowIndex === rowIndex && 
      editingCell?.colIndex === colIndex;

    if (isEditing) {
      return (
        <input
          type="text"
          value={editValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          onBlur={handleBlur}
          className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
          autoFocus
        />
      );
    }

    const displayValue = value || (editable ? 'Click to edit' : '-');
    const clickableClass = editable ? 'cursor-text hover:bg-blue-50 transition-colors' : '';

    return (
      <div 
        className={`w-full h-full min-h-[2rem] flex items-center justify-center ${clickableClass}`}
        onClick={() => handleCellClick(type, rowIndex, colIndex, value)}
      >
        {displayValue}
        {editable && type === 'date' && scheduleData.dates.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteDate(colIndex!);
            }}
            className="ml-2 text-red-500 hover:text-red-700 text-xs"
            title="Delete date"
          >
            ×
          </button>
        )}
        {editable && type === 'className' && scheduleData.classes.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClass(rowIndex!);
            }}
            className="ml-2 text-red-500 hover:text-red-700 text-xs"
            title="Delete class"
          >
            ×
          </button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-5 font-sans max-w-full flex justify-center items-center">
        <div className="text-lg">Loading classes...</div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="p-4 font-mono max-w-full overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <div className="flex flex-wrap gap-2">
            {editable && (
              <>
                <button
                  onClick={handleAddClass}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                >
                  Add Class
                </button>
                <button
                  onClick={handleAddDate}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  Add Date
                </button>
              </>
            )}
            <button
              onClick={copyFormattedText}
              className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
            >
              Copy Text
            </button>
            <button
              onClick={exportToDOC}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Export DOC
            </button>
            <button
              onClick={exportToHTML}
              className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-sm"
            >
              Export HTML
            </button>
            <button
              onClick={printSchedule}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
            >
              Print
            </button>
          </div>
        </div>
        
        <table className="min-w-full border-collapse border border-gray-400">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-400 px-3 py-2 text-left text-sm">
                {renderEditableContent('className', 'Class / Date')}
              </th>
              {scheduleData.dates.map((date: DateString, colIndex: number) => (
                <th 
                  key={colIndex} 
                  className="border border-gray-400 px-3 py-2 text-center text-sm"
                >
                  {renderEditableContent('date', date, undefined, colIndex)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scheduleData.classes.map((classItem: ClassSchedule, rowIndex: number) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-gray-400 px-3 py-2 text-sm font-medium bg-gray-100 min-w-[100px]">
                  {renderEditableContent('className', classItem.name, rowIndex)}
                </td>
                {classItem.subjects.map((subject: Subject, colIndex: number) => (
                  <td 
                    key={colIndex} 
                    className="border border-gray-400 px-3 py-2 text-sm text-center min-w-[100px]"
                  >
                    {renderEditableContent('subject', subject, rowIndex, colIndex)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={exportToCSV}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
          >
            Export CSV
          </button>
          <button
            onClick={exportToText}
            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
          >
            Export Text
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 font-sans max-w-full overflow-x-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <div className="flex flex-wrap gap-3">
          {editable && (
            <>
              <button
                onClick={handleAddClass}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Add Class
              </button>
              <button
                onClick={handleAddDate}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add Date
              </button>
            </>
          )}
          <button
            onClick={copyFormattedText}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Copy as Text
          </button>
          <button
            onClick={exportToDOC}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Export DOC
          </button>
          <button
            onClick={exportToHTML}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            Export HTML
          </button>
          <button
            onClick={printSchedule}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Print
          </button>
        </div>
      </div>
      
      <div className="overflow-hidden rounded-lg shadow-md border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 min-w-[120px]">
                {renderEditableContent('className', 'Class / Date')}
              </th>
              {scheduleData.dates.map((date: DateString, colIndex: number) => (
                <th 
                  key={colIndex} 
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0 min-w-[120px]"
                >
                  {renderEditableContent('date', date, undefined, colIndex)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {scheduleData.classes.map((classItem: ClassSchedule, rowIndex: number) => (
              <tr 
                key={rowIndex} 
                className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200 bg-gray-50 min-w-[120px]">
                  {renderEditableContent('className', classItem.name, rowIndex)}
                </td>
                {classItem.subjects.map((subject: Subject, colIndex: number) => (
                  <td 
                    key={colIndex} 
                    className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center border-r border-gray-200 last:border-r-0 min-w-[120px]"
                  >
                    {renderEditableContent('subject', subject, rowIndex, colIndex)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-center gap-4">
        <button
          onClick={exportToCSV}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Export CSV
        </button>
        <button
          onClick={exportToText}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Export Text File
        </button>
      </div>

      {editable && (
        <div className="mt-4 text-sm text-gray-600 space-y-1">
          <p>💡 Click on any cell to edit. Press Enter to save or Escape to cancel.</p>
          <p>💡 Click the × button to delete dates or classes (minimum 1 required).</p>
          <p>💡 Use export buttons to download in universal formats that work everywhere.</p>
          <p>💡 DOC export creates Microsoft Word compatible documents.</p>
        </div>
      )}
    </div>
  );
};

export default UniversalExportClassSchedule;