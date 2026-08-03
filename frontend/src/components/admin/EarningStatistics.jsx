"use client";



import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign } from 'lucide-react';
import styles from './EarningStatistics.module.css';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        <div className={styles.tooltipItem}>
          <span className={`${styles.dot} ${styles.dotInHouse}`}></span>
          <span>In-house: ₹{payload[0]?.value?.toLocaleString() || 0}</span>
        </div>
        <div className={styles.tooltipItem}>
          <span className={`${styles.dot} ${styles.dotSeller}`}></span>
          <span>Seller: ₹{payload[1]?.value?.toLocaleString() || 0}</span>
        </div>
        <div className={styles.tooltipItem}>
          <span className={`${styles.dot} ${styles.dotCommission}`}></span>
          <span>Commission: ₹{payload[2]?.value?.toLocaleString() || 0}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function EarningStatistics({ data }) {
  const [activeTab, setActiveTab] = useState('This Year');

  let displayData = [];

  // Check if data is passed as an object containing { yearly, monthly, weekly }
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    if (activeTab === 'This Year') {
      displayData = data.yearly || [];
    } else if (activeTab === 'This Month') {
      displayData = data.monthly || [];
    } else if (activeTab === 'This Week') {
      displayData = data.weekly || [];
    }
  } else if (Array.isArray(data)) {
    // Fallback if legacy array is provided
    const baseMonths = [
      { name: 'Jan', inHouse: 0, seller: 0, commission: 0 },
      { name: 'Feb', inHouse: 0, seller: 0, commission: 0 },
      { name: 'Mar', inHouse: 0, seller: 0, commission: 0 },
      { name: 'Apr', inHouse: 0, seller: 0, commission: 0 },
      { name: 'May', inHouse: 0, seller: 0, commission: 0 },
      { name: 'Jun', inHouse: 0, seller: 0, commission: 0 },
      { name: 'Jul', inHouse: 0, seller: 0, commission: 0 },
      { name: 'Aug', inHouse: 0, seller: 0, commission: 0 },
      { name: 'Sep', inHouse: 0, seller: 0, commission: 0 },
      { name: 'Oct', inHouse: 0, seller: 0, commission: 0 },
      { name: 'Nov', inHouse: 0, seller: 0, commission: 0 },
      { name: 'Dec', inHouse: 0, seller: 0, commission: 0 },
    ];
    displayData = baseMonths.map(month => {
      const found = data.find(d => d.name && d.name.startsWith(month.name));
      return found ? { ...month, inHouse: found.revenue || found.inHouse || 0 } : month;
    });
  } else {
    displayData = [
      { name: 'Jan', inHouse: 0, seller: 0, commission: 0 },
      { name: 'Feb', inHouse: 0, seller: 0, commission: 0 },
      { name: 'Mar', inHouse: 0, seller: 0, commission: 0 },
      { name: 'Apr', inHouse: 0, seller: 0, commission: 0 },
      { name: 'May', inHouse: 0, seller: 0, commission: 0 },
      { name: 'Jun', inHouse: 0, seller: 0, commission: 0 },
      { name: 'Jul', inHouse: 0, seller: 0, commission: 0 },
      { name: 'Aug', inHouse: 0, seller: 0, commission: 0 },
      { name: 'Sep', inHouse: 0, seller: 0, commission: 0 },
      { name: 'Oct', inHouse: 0, seller: 0, commission: 0 },
      { name: 'Nov', inHouse: 0, seller: 0, commission: 0 },
      { name: 'Dec', inHouse: 0, seller: 0, commission: 0 },
    ];
  }

  const yAxisTickFormatter = (value) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k ₹`;
    }
    return `${value} ₹`;
  };

  return (
    <div className={styles.cardContainer}>
      {/* Header */}
      <div className={styles.header}>
        <h5 className={styles.title}>
          <span className="text-warning">💰</span> Sales Overview
        </h5>
        <div className={styles.buttonGroup}>
          {['This Year', 'This Month', 'This Week'].map(tab => (
            <button 
              key={tab}
              className={`${styles.btn} ${activeTab === tab ? styles.active : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className={styles.legendContainer}>
        <div className={styles.legendItem}>
          <div className={`${styles.legendBox} ${styles.inHouseBox}`}></div>
          <span>In-house</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendBox} ${styles.sellerBox}`}></div>
          <span>Seller</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendBox} ${styles.commissionBox}`}></div>
          <span>Commission</span>
        </div>
      </div>

      {/* Chart */}
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={displayData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorInHouse" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorSeller" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#007bff" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#007bff" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorCommission" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fca311" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#fca311" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#6c757d', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#6c757d', fontSize: 12 }} 
              tickFormatter={yAxisTickFormatter}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="inHouse" 
              stroke="#82ca9d" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorInHouse)" 
            />
            <Area 
              type="monotone" 
              dataKey="seller" 
              stroke="#007bff" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorSeller)" 
            />
            <Area 
              type="monotone" 
              dataKey="commission" 
              stroke="#fca311" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorCommission)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
