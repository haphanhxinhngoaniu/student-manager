'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { Download, FileSpreadsheet, Upload, CheckCircle2, AlertTriangle } from 'lucide-react';
import {
  parseImportedRows,
  toSpreadsheetRows,
  type ImportedRowResult,
  type Student,
} from '@/lib/students';

interface ImportExportViewProps {
  students: Student[];
  onImportStudents: (newStudents: Student[]) => void;
}

export default function ImportExportView({
  students,
  onImportStudents,
}: ImportExportViewProps) {
  const [fileName, setFileName] = useState<string>('');
  const [previewResults, setPreviewResults] = useState<ImportedRowResult[]>([]);
  const [importStatus, setImportStatus] = useState<string>('');
  const [parseError, setParseError] = useState<string>('');

  const handleExportWorkbook = () => {
    const rows = toSpreadsheetRows(students);
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    XLSX.writeFile(workbook, 'student-roster.xlsx');
  };

  const handleDownloadTemplate = () => {
    const templateRows = [
      {
        'Student Code': 'SE202610',
        'Full Name': 'Nguyen Hoang Nam',
        Email: 'nam.nh202610@campus.edu',
        Cohort: '2026',
        Major: 'Computer Science',
        GPA: 3.6,
        'Attendance (%)': 94,
        Status: 'Active',
        Notes: 'Transfer orientation completed',
      },
    ];
    const worksheet = XLSX.utils.json_to_sheet(templateRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    XLSX.writeFile(workbook, 'student-import-template.xlsx');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setParseError('');
    setImportStatus('');

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheet = workbook.SheetNames[0];
      if (!firstSheet) {
        setParseError('The uploaded workbook contains no worksheets.');
        setPreviewResults([]);
        return;
      }
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
        workbook.Sheets[firstSheet],
        { defval: '' }
      );
      if (rows.length === 0) {
        setParseError('No student rows were detected in the first worksheet.');
        setPreviewResults([]);
        return;
      }
      const results = parseImportedRows(rows, students);
      setPreviewResults(results);
    } catch {
      setParseError('Unable to read spreadsheet. Upload a valid .xlsx, .xls, or .csv file.');
      setPreviewResults([]);
    }
  };

  const validStudents = previewResults
    .map((r) => r.student)
    .filter((s): s is Student => s !== null);
  const invalidCount = previewResults.length - validStudents.length;

  const handleCommitImport = () => {
    if (validStudents.length === 0) return;
    onImportStudents(validStudents);
    setImportStatus(`Imported ${validStudents.length} student record(s) into the roster.`);
    setPreviewResults([]);
    setFileName('');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                className="text-base font-semibold text-slate-900"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Export Academic Roster
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Download the current roster ({students.length} students) as a formatted Excel
                workbook or grab a clean import template.
              </p>
            </div>
            <FileSpreadsheet className="w-5 h-5 text-slate-400 shrink-0" />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleExportWorkbook}
              disabled={students.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              Export Roster (.xlsx)
            </button>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              Download Template
            </button>
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                className="text-base font-semibold text-slate-900"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Import Students from Spreadsheet
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Upload an .xlsx, .xls, or .csv sheet. Rows are validated for unique Student Code,
                GPA (0–4), and Attendance (0–100%).
              </p>
            </div>
            <Upload className="w-5 h-5 text-slate-400 shrink-0" />
          </div>

          <div className="pt-2">
            <label
              htmlFor="spreadsheet-upload"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-800 bg-slate-50 border border-slate-300 rounded-md hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <Upload className="w-4 h-4" />
              {fileName ? `Selected: ${fileName}` : 'Choose Excel or CSV File'}
            </label>
            <input
              id="spreadsheet-upload"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="sr-only"
            />
          </div>

          {parseError && (
            <p className="text-sm text-rose-700 flex items-center gap-2" role="alert">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {parseError}
            </p>
          )}

          {importStatus && (
            <p className="text-sm text-emerald-700 flex items-center gap-2" role="status">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {importStatus}
            </p>
          )}
        </section>
      </div>

      {previewResults.length > 0 && (
        <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Import Preview</h3>
              <p className="text-xs text-slate-600 font-mono tabular-nums">
                {validStudents.length} valid · {invalidCount} skipped due to validation errors
              </p>
            </div>
            <button
              type="button"
              onClick={handleCommitImport}
              disabled={validStudents.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              Import {validStudents.length} Valid Student(s)
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-600">
                  <th className="py-2.5 px-4">Row</th>
                  <th className="py-2.5 px-4">Student Code</th>
                  <th className="py-2.5 px-4">Full Name</th>
                  <th className="py-2.5 px-4">Major</th>
                  <th className="py-2.5 px-4 text-right">GPA</th>
                  <th className="py-2.5 px-4">Validation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {previewResults.map((row) => (
                  <tr key={row.rowIndex} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono tabular-nums text-slate-500">
                      {row.rowIndex}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-900">
                      {row.student ? row.student.studentCode : '—'}
                    </td>
                    <td className="py-2.5 px-4 text-slate-900">
                      {row.student ? row.student.fullName : '—'}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">
                      {row.student ? row.student.major : '—'}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-900">
                      {row.student ? row.student.gpa.toFixed(2) : '—'}
                    </td>
                    <td className="py-2.5 px-4 text-xs">
                      {row.student ? (
                        <span className="text-emerald-700 font-medium">Ready to import</span>
                      ) : (
                        <span className="text-rose-700">{row.error}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
