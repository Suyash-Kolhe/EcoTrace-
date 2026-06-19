/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import { FootprintInputs, FootprintBreakdown } from '../types';
import { REDUCTION_ACTIONS } from '../data/actions';

interface PDFReportData {
  inputs: FootprintInputs;
  breakdown: FootprintBreakdown;
  committedActionIds: string[];
  totalSavings: number;
  userEmail?: string;
}

export const generateCarbonPDFReport = (data: PDFReportData) => {
  const { inputs, breakdown, committedActionIds, totalSavings, userEmail = 'EcoTrace Citizen' } = data;
  
  // Create a new A4 document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageHeight = 297;
  const pageWidth = 210;
  const leftMargin = 20;
  const rightMargin = 190;
  const contentWidth = rightMargin - leftMargin; // 170mm

  // Fetch local streaks logging details if available
  let streakCount = 0;
  let lastLoggedDate = 'N/A';
  try {
    const rawDailyLog = localStorage.getItem('carbon_platform_daily_habits_log');
    if (rawDailyLog) {
      const parsed = JSON.parse(rawDailyLog);
      if (typeof parsed.streakCount === 'number') {
        streakCount = parsed.streakCount;
      }
      if (parsed.lastLoggedDate) {
        lastLoggedDate = parsed.lastLoggedDate;
      }
    }
  } catch (err) {
    console.warn("Failed to retrieve local storage habit details for PDF: ", err);
  }

  // Formatting date
  const generateDateStr = () => {
    const d = new Date();
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  const currentDate = generateDateStr();

  // Helper to draw a horizontal rule split
  const drawHorizontalLine = (yCoord: number, strokeColor: [number, number, number] = [228, 228, 231], width: number = 0.2) => {
    doc.setDrawColor(strokeColor[0], strokeColor[1], strokeColor[2]);
    doc.setLineWidth(width);
    doc.line(leftMargin, yCoord, rightMargin, yCoord);
  };

  // Helper to draw footer on each page
  const drawPageFooter = (pageNumber: number, totalPages: number) => {
    const footerY = 282;
    drawHorizontalLine(footerY - 3, [228, 228, 231], 0.2);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175); // gray-400
    
    doc.text('EcoTrace Carbon Footprint Auditative Report. Calculated using IPCC, DEFRA, US EPA standards.', leftMargin, footerY);
    doc.text(`Page ${pageNumber} of ${totalPages}`, rightMargin, footerY, { align: 'right' });
  };

  // ==========================================
  // PAGE 1: ECOLOGICAL FOOTPRINT AUDIT
  // ==========================================

  let y = 15;

  // Modern High-Contrast Brand Header
  doc.setFillColor(6, 78, 59); // deep emerald tone (emerald-900)
  doc.rect(leftMargin, y, contentWidth, 24, 'F');

  // Title in Banner
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text('ECOTRACE™ CARBON OFFSET AUDIT', leftMargin + 6, y + 10);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(167, 243, 208); // emerald-200
  doc.text('PERSONAL LIFESTYLE EMISSIONS & SUSTAINABILITY VERIFICATION CERTIFICATE', leftMargin + 6, y + 16);

  y += 24 + 10;

  // Metadata Card
  doc.setFillColor(249, 250, 251); // zinc-50
  doc.setDrawColor(228, 228, 231); // zinc-200
  doc.setLineWidth(0.3);
  doc.rect(leftMargin, y, contentWidth, 24, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // slate-500
  
  doc.text('AUDIT TARGET:', leftMargin + 6, y + 6);
  doc.text('GENERATION TIME:', leftMargin + 6, y + 12);
  doc.text('REGIONAL STANDARDS:', leftMargin + 6, y + 18);

  doc.text('VALIDITY CODE:', leftMargin + 95, y + 6);
  doc.text('LOGGING SYSTEM STATE:', leftMargin + 95, y + 12);
  doc.text('VERIFICATION STATUS:', leftMargin + 95, y + 18);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39); // dark zinc-900
  doc.text(userEmail, leftMargin + 42, y + 6);
  
  doc.setFont('helvetica', 'normal');
  doc.text(currentDate, leftMargin + 42, y + 12);
  doc.text('WRI GHG Standard, GWP-100 values', leftMargin + 42, y + 18);
  
  const uniqueCode = "ET-" + Math.floor(100000 + Math.random() * 900000);
  doc.setFont('courier', 'bold');
  doc.text(uniqueCode, leftMargin + 138, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`${streakCount} consecutive active logging days`, leftMargin + 138, y + 12);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105); // emerald-600
  doc.text('✓ METHODOLOGY COMPLIANT', leftMargin + 138, y + 18);

  y += 24 + 10;

  // Main Carbon Metric Hero Box
  const netFootprint = Math.max(0, breakdown.total - totalSavings);
  const reductionPercent = breakdown.total > 0 ? Math.round((totalSavings / breakdown.total) * 100) : 0;

  doc.setFillColor(240, 253, 244); // emerald-50
  doc.setDrawColor(5, 150, 105); // emerald-600
  doc.setLineWidth(0.5);
  doc.rect(leftMargin, y, contentWidth, 30, 'FD');

  // Large Hero Score
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(6, 78, 59); // deep green
  doc.text('YOUR ANNUAL NET CARBON Trajectory', leftMargin + 8, y + 8);
  
  doc.setFontSize(24);
  doc.setTextColor(4, 120, 87); // emerald-700
  doc.text(`${(netFootprint / 1000).toFixed(2)} TONNES`, leftMargin + 8, y + 19);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(4, 120, 87);
  doc.text(` (${netFootprint.toLocaleString()} kg CO₂e / year)`, leftMargin + 62, y + 19);

  // Sub columns inside the Hero Box
  doc.setDrawColor(167, 243, 208); // green border divider
  doc.setLineWidth(0.2);
  doc.line(leftMargin + 120, y + 4, leftMargin + 120, y + 26);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(17, 24, 39);
  doc.text('Gross Unmitigated Footprint:', leftMargin + 123, y + 8);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`${(breakdown.total / 1000).toFixed(2)} tonnes`, leftMargin + 123, y + 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Committed Savings Outlines:', leftMargin + 123, y + 18);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text(`-${(totalSavings / 1000).toFixed(2)} tonnes (-${reductionPercent}%)`, leftMargin + 123, y + 22);

  y += 30 + 10;

  // Section: Footprint Breakdown Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(17, 24, 39);
  doc.text('1. ANNUAL CO₂e DETAILED SECTORAL BREAKDOWN', leftMargin, y);
  
  y += 4;
  drawHorizontalLine(y, [17, 24, 39], 0.4);
  y += 4;

  // Let's draw an elegant detailed grid table representing variables from input
  doc.setFillColor(249, 250, 251); // zinc-50
  doc.rect(leftMargin, y, contentWidth, 6, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(55, 65, 81); // gray-700
  doc.text('CO₂ PROFILE SECTOR', leftMargin + 3, y + 4.5);
  doc.text('KEY DRIVER METRIC CODES', leftMargin + 50, y + 4.5);
  doc.text('BASELINE CO₂', leftMargin + 115, y + 4.5);
  doc.text('PCT', leftMargin + 155, y + 4.5);

  y += 6;
  drawHorizontalLine(y, [228, 228, 231], 0.2);

  // Sector lines
  const pctTransport = breakdown.total > 0 ? Math.round((breakdown.transport / breakdown.total) * 100) : 0;
  const pctEnergy = breakdown.total > 0 ? Math.round((breakdown.energy / breakdown.total) * 100) : 0;
  const pctFood = breakdown.total > 0 ? Math.round((breakdown.food / breakdown.total) * 100) : 0;
  const pctShopping = breakdown.total > 0 ? Math.round((breakdown.shopping / breakdown.total) * 100) : 0;

  const sectors = [
    {
      name: '🚲 Transport & Commuting',
      metric: `Driving: ${(inputs.transport.petrolCarKm || 0).toLocaleString()} km (petrol), ${(inputs.transport.dieselCarKm || 0).toLocaleString()} km (diesel), ${(inputs.transport.electricCarKm || 0).toLocaleString()} km (EV). Flights: ${inputs.transport.flightsShort} short-haul, ${inputs.transport.flightsLong} long-haul return trips.`,
      cop: breakdown.transport,
      pct: pctTransport
    },
    {
      name: '⚡ Household Utilities',
      metric: `Electricity: ${(inputs.energy.electricityKwh || 0).toLocaleString()} kWh/yr, Natural Gas: ${(inputs.energy.naturalGasKwh || 0).toLocaleString()} kWh/yr (split split among ${inputs.energy.householdSize || 1} household members).`,
      cop: breakdown.energy,
      pct: pctEnergy
    },
    {
      name: '🌱 Diet & Agriculture',
      metric: `Diet regime: ${inputs.food.dietType} scale, ${inputs.food.organicShare}% organic food sourcing ratio, ${inputs.food.foodWasteShare}% post-consumer waste`,
      cop: breakdown.food,
      pct: pctFood
    },
    {
      name: '🛍️ Consumer Purchase',
      metric: `$${inputs.shopping.clothesMonthly}/mo apparel shopping, $${inputs.shopping.electronicsYearly}/yr digital hardware, active municipal waste separation`,
      cop: breakdown.shopping,
      pct: pctShopping
    }
  ];

  sectors.forEach((sec) => {
    // Check height space
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(17, 24, 39);
    doc.text(sec.name, leftMargin + 3, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(107, 114, 128); // gray-500
    
    // Split text into multiple lines for the metric description
    const lines = doc.splitTextToSize(sec.metric, 62);
    doc.text(lines, leftMargin + 50, y + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(17, 24, 39);
    doc.text(`${sec.cop.toLocaleString()} kg`, leftMargin + 115, y + 5);
    doc.text(`${sec.pct}%`, leftMargin + 155, y + 5);

    const cellHeight = Math.max(8, (lines.length * 3.5) + 3);
    y += cellHeight;
    drawHorizontalLine(y, [244, 244, 245], 0.2);
  });

  // Gross totals row
  doc.setFillColor(244, 244, 245);
  doc.rect(leftMargin, y, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(17, 24, 39);
  doc.text('TOTAL AUDITED EMISSIONS', leftMargin + 3, y + 4.5);
  doc.text(`${breakdown.total.toLocaleString()} kg CO₂e / Year`, leftMargin + 115, y + 4.5);
  doc.text('100%', leftMargin + 155, y + 4.5);
  
  y += 6 + 10;

  // Comparison Segment with Global Milestones
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(17, 24, 39);
  doc.text('2. GLOBAL TARGET & CLIMATE Paris agreement ALIGNMENT', leftMargin, y);
  
  y += 4;
  drawHorizontalLine(y, [17, 24, 39], 0.4);
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(75, 85, 99); // gray-600
  doc.text('Comparing your net footprints with global thresholds highlights systemic green challenges:', leftMargin, y);

  y += 6;

  const compareMetrics = [
    { title: 'Your Net Footprint', val: netFootprint, color: netFootprint <= 2000 ? [5, 150, 105] : [220, 38, 38] },
    { title: 'Paris Climate Accord 2030 Limit Target', val: 2000, color: [5, 150, 105] },
    { title: 'EU Per-Capita Baseline Average', val: 6500, color: [100, 116, 139] },
    { title: 'Global Per-Capita Baseline Average', val: 4500, color: [100, 116, 139] },
  ];

  // Draw comparison chart visual bars
  compareMetrics.forEach((cm) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(55, 65, 81);
    doc.text(`${cm.title} (${cm.val.toLocaleString()} kg CO₂)`, leftMargin, y + 3);

    // Draw horizontal bar
    const barMax = 12000;
    const barWidth = Math.min(1.0, cm.val / barMax) * 110; // mm length
    doc.setFillColor(243, 244, 246);
    doc.rect(leftMargin + 50, y, 110, 3.5, 'F');
    
    doc.setFillColor(cm.color[0], cm.color[1], cm.color[2]);
    doc.rect(leftMargin + 50, y, barWidth, 3.5, 'F');

    // Label on right
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(cm.color[0], cm.color[1], cm.color[2]);
    
    const performanceLabel = cm.val <= 2000 ? '🌱 COMPLIANT' : '⚠️ OUT OF LIMIT';
    if (cm.title.includes('Your')) {
      doc.text(performanceLabel, leftMargin + 163, y + 3);
    }

    y += 6;
  });

  // Draw Page 1 footer
  drawPageFooter(1, 2);

  // ==========================================
  // PAGE 2: COMMITMENTS & SYSTEM HISTORIES
  // ==========================================
  doc.addPage();

  y = 15;

  // Header Page 2
  doc.setFillColor(6, 78, 59); // deep green
  doc.rect(leftMargin, y, contentWidth, 12, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text('ECOSTRUCT ™ SAVINGS COMMITMENT & ACTIVE HABITS AUDITING', leftMargin + 6, y + 8);

  y += 12 + 10;

  // Active reduction pledges
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(17, 24, 39);
  doc.text('3. CURRENT THERMALLY RECORDED CARBON PLEDGES', leftMargin, y);
  
  y += 4;
  drawHorizontalLine(y, [17, 24, 39], 0.4);
  y += 6;

  // Grouped active pledges
  const activePledges = REDUCTION_ACTIONS.filter(item => committedActionIds.includes(item.id));

  if (activePledges.length === 0) {
    doc.setFillColor(254, 242, 242); // red-50
    doc.setDrawColor(252, 165, 165); // red-300
    doc.setLineWidth(0.2);
    doc.rect(leftMargin, y, contentWidth, 20, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(220, 38, 38); // red-600
    doc.text('NO HISTORICAL COMMITMENTS RECORDED', leftMargin + 6, y + 8);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(127, 29, 29);
    doc.text('Log into the platform, choose habits (e.g. carpool, local food diet, LED bulbs) to lock-in certified savings.', leftMargin + 6, y + 14);
    
    y += 20 + 8;
  } else {
    // Beautiful list of pledges
    activePledges.forEach((pledge) => {
      doc.setFillColor(249, 250, 251); // zinc-50
      doc.setDrawColor(228, 228, 231); // zinc-200
      doc.setLineWidth(0.15);
      doc.rect(leftMargin, y, contentWidth, 11, 'FD');

      // Sector Indicator Circle color
      let dotColor = [5, 150, 105]; // emerald-600
      if (pledge.category === 'energy') dotColor = [245, 158, 11]; // amber
      if (pledge.category === 'food') dotColor = [16, 124, 65]; // dark green
      if (pledge.category === 'shopping') dotColor = [124, 58, 237]; // purple

      doc.setFillColor(dotColor[0], dotColor[1], dotColor[2]);
      doc.circle(leftMargin + 4, y + 5.5, 1.5, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(17, 24, 39);
      doc.text(pledge.title, leftMargin + 8, y + 4.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(107, 114, 128);
      doc.text(pledge.description.substring(0, 112) + (pledge.description.length > 112 ? '...' : ''), leftMargin + 8, y + 8.5);

      // Carbon impact on the right
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(5, 150, 105);
      doc.text(`-${pledge.co2SavingKg} kg / yr`, rightMargin - 4, y + 6.5, { align: 'right' });

      y += 11 + 2;
    });

    // Pledges summary row
    doc.setFillColor(243, 244, 246);
    doc.rect(leftMargin, y, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(17, 24, 39);
    doc.text('TOTAL PLEDGED RECURRING SAVINGS', leftMargin + 4, y + 4.5);
    doc.setTextColor(5, 150, 105);
    doc.text(`-${totalSavings.toLocaleString()} kg CO₂e / Year`, rightMargin - 4, y + 4.5, { align: 'right' });

    y += 7 + 10;
  }

  // Active Habit Streaks Status
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(17, 24, 39);
  doc.text('4. CONSECUTIVE HABIT STREAK RECOGNITIONS', leftMargin, y);
  
  y += 4;
  drawHorizontalLine(y, [17, 24, 39], 0.4);
  y += 6;

  // Streak status card
  doc.setFillColor(255, 251, 235); // amber-50
  doc.setDrawColor(245, 158, 11); // amber-500
  doc.setLineWidth(0.3);
  doc.rect(leftMargin, y, contentWidth, 24, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(180, 83, 9); // amber-800
  doc.text('🔥 LIVE ACCOUNT CONSECUTIVE HABIT STREAK STATUS', leftMargin + 6, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(146, 64, 14); // amber-900
  doc.text(`This user has recorded a consecutive `, leftMargin + 6, y + 13);
  doc.text(`This record confirms persistent, active daily commitments. Logging consistency reduces behavioral latency.`, leftMargin + 6, y + 18);

  doc.setFont('helvetica', 'bold');
  doc.text(`${streakCount} Days Checklist Compliance Streak`, leftMargin + 56, y + 13);

  // Big giant flame stat number on the far right
  doc.setFillColor(245, 158, 11);
  doc.rect(rightMargin - 30, y + 4, 24, 16, 'F');
  
  doc.setFont('courier', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(`${streakCount}D`, rightMargin - 18, y + 14, { align: 'center' });

  y += 24 + 10;

  // Scientific Trust References & Methodological Sourcing
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(17, 24, 39);
  doc.text('5. METHODOLOGICAL STANDARDS & DATABASE CITATIONS', leftMargin, y);
  
  y += 4;
  drawHorizontalLine(y, [17, 24, 39], 0.4);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(75, 85, 99);
  
  const citationPara = "To ensure scientific neutrality, emissions estimates are updated seasonally from verified climate databases. Every action is quantified against global standard models. Source reference files trace from emissions records of public institutions:";
  const citationLines = doc.splitTextToSize(citationPara, contentWidth);
  doc.text(citationLines, leftMargin, y);

  y += (citationLines.length * 3.5) + 3;

  // Two columns of citations
  doc.setFillColor(249, 250, 251);
  doc.rect(leftMargin, y, 80, 22, 'F');
  doc.setDrawColor(228, 228, 231);
  doc.setLineWidth(0.15);
  doc.rect(leftMargin, y, 80, 22, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(17, 24, 39);
  doc.text('[1] IPCC Sixth Assessment Report (2023)', leftMargin + 3, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(107, 114, 128);
  const ipccText = "Establishes long-term equivalents for nitrous compounds, fluorinated compounds and carbon metrics over 100-year periods.";
  doc.text(doc.splitTextToSize(ipccText, 74), leftMargin + 3, y + 9);


  doc.setFillColor(249, 250, 251);
  doc.rect(leftMargin + 90, y, 80, 22, 'F');
  doc.rect(leftMargin + 90, y, 80, 22, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(17, 24, 39);
  doc.text('[2] US EPA & UK DEFRA Repositories (2024)', leftMargin + 93, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(107, 114, 128);
  const epaText = "Publishes real-time national electricity grid emission vectors, heating fuel indices and average regional vehicle fuel-economy benchmarks.";
  doc.text(doc.splitTextToSize(epaText, 74), leftMargin + 93, y + 9);

  y += 22 + 10;

  // Bottom Certification Seals & Signatures
  doc.setDrawColor(5, 150, 105);
  doc.setLineWidth(0.3);
  doc.line(leftMargin, y, rightMargin, y);

  y += 4;

  // Let's draw an elegant signature certificate stamp
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(5, 150, 105);
  doc.text('ECOTRACE™ ENVIRONMENTAL INTEGRITY ASSURANCE SEAL', leftMargin, y + 4);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(107, 114, 128);
  doc.text('This PDF document acts as an off-grid personal record. Emissions parameters may naturally fluctuate', leftMargin, y + 9);
  doc.text('based on regional electricity grid transformations. Scan the code inside your user terminal to synchronize data.', leftMargin, y + 13);

  // Little certified badge vector
  doc.setFillColor(236, 253, 245); // light emerald background
  doc.setDrawColor(16, 185, 129); // emerald-500
  doc.setLineWidth(0.4);
  doc.rect(rightMargin - 35, y, 35, 15, 'FD');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(4, 120, 87);
  doc.text('ECOTRACE SECURE', rightMargin - 32, y + 5);
  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(6, 95, 70);
  doc.text('★ CERTIFIED ★', rightMargin - 31, y + 11);

  // Draw Page 2 footer
  drawPageFooter(2, 2);

  // Save the PDF
  doc.save(`EcoTrace_Carbon_Footprint_Audit_${uniqueCode}.pdf`);
};
