'use client';

import { useState } from 'react';
import { FileText, Table, Calendar, Download, FileSpreadsheet } from 'lucide-react';

export default function AdminReportsPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const handleExportPDF = () => {
    let url = `${process.env.NEXT_PUBLIC_API_URL || 'https://www.maxglowon.com/api'}/reports/export/pdf`;
    const params = [];
    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    window.open(url, '_blank');
  };

  const handleExportExcel = () => {
    let url = `${process.env.NEXT_PUBLIC_API_URL || 'https://www.maxglowon.com/api'}/reports/export/excel`;
    const params = [];
    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    window.open(url, '_blank');
  };

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold m-0 display-font">Reports Center</h1>
          <p className="text-muted m-0">Generate, filter, and download spreadsheet logs or formal PDFs.</p>
        </div>
      </div>

      <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
        <Calendar size={18} className="text-brand" /> Filter Reporting Window
      </h5>
      
      <div className="card shadow-sm p-4 border-0 rounded-4 bg-white mb-5">
        <div className="row g-4">
          <div className="col-md-6">
            <label className="fw-medium mb-2 fs-7 text-muted">Start Date</label>
            <input
              type="date"
              className="form-control form-control-lg fs-6 bg-light border-0 rounded-3 px-3 py-2"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          
          <div className="col-md-6">
            <label className="fw-medium mb-2 fs-7 text-muted">End Date</label>
            <input
              type="date"
              className="form-control form-control-lg fs-6 bg-light border-0 rounded-3 px-3 py-2"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
        <FileSpreadsheet size={18} className="text-info" /> Export Documents
      </h5>
      
      <div className="row g-4">
        
        {/* PDF Card */}
        <div className="col-md-6 col-lg-6">
          <div className="card shadow-sm p-4 border-0 rounded-4 bg-white h-100 d-flex flex-column hover-shadow transition-all">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="rounded-circle p-3 bg-danger bg-opacity-10 text-danger">
                <FileText size={28} />
              </div>
              <div>
                <h5 className="fw-bold m-0 text-dark">PDF Executive Report</h5>
                <span className="text-muted fs-8">Formal Document</span>
              </div>
            </div>
            
            <p className="text-muted fs-7 mb-4 flex-grow-1">
              A formal sales breakdown document featuring company metrics, gross sales summaries, and itemized customer transactions.
            </p>
            
            <button 
              onClick={handleExportPDF}
              className="btn btn-danger py-3 w-100 d-flex align-items-center justify-content-center gap-2 fw-bold rounded-3"
            >
              <Download size={18} /> Export PDF Document
            </button>
          </div>
        </div>

        {/* Excel Card */}
        <div className="col-md-6 col-lg-6">
          <div className="card shadow-sm p-4 border-0 rounded-4 bg-white h-100 d-flex flex-column hover-shadow transition-all">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="rounded-circle p-3 bg-success bg-opacity-10 text-success">
                <Table size={28} />
              </div>
              <div>
                <h5 className="fw-bold m-0 text-dark">Excel Transaction Ledger</h5>
                <span className="text-muted fs-8">Spreadsheet Data</span>
              </div>
            </div>
            
            <p className="text-muted fs-7 mb-4 flex-grow-1">
              A tabular spreadsheet compatible with Microsoft Excel, featuring granular data formulas, coupon deductions, taxes, and net profit margins.
            </p>
            
            <button 
              onClick={handleExportExcel}
              className="btn btn-success py-3 w-100 d-flex align-items-center justify-content-center gap-2 fw-bold rounded-3"
            >
              <Download size={18} /> Export Excel Ledger
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
