import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from 'lucide-react';
import Tippy from '@tippyjs/react';
import ReactMarkdown from 'react-markdown';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';


// --- EDI Dictionaries ---
const ediSegmentDescriptions = {
  ISA: 'Interchange Control Header - Marks the beginning of an EDI interchange.',
  GS: 'Functional Group Header - Marks the beginning of a functional group and provides control information.',
  ST: 'Transaction Set Header - Marks the beginning of a transaction set and assigns a control number.',
  BSN: 'Beginning Segment for Ship Notice - Used to transmit identifying numbers, dates, and other basic data relating to the transaction set.',
  HL: 'Hierarchical Level - Used to define a hierarchical structure for the transaction set.',
  TD1: 'Carrier Details (Quantity and Weight) - Specifies transportation details such as commodity, quantity, and weight.',
  TD5: 'Carrier Details (Routing Sequence/Transit Time) - Specifies the carrier and routing sequence.',
  REF: 'Reference Identification - Specifies identifying information.',
  DTM: 'Date/Time Reference - Specifies pertinent dates and times.',
  FOB: 'F.O.B. Related Instructions - Specifies transportation instructions relating to shipment.',
  N1: 'Name - To identify a party by type of organization, name, and code.',
  N3: 'Address Information - To specify the address of a party.',
  N4: 'Geographic Location - To specify the geographic location of a party.',
  PRF: 'Purchase Order Reference - Provides a reference to the original purchase order.',
  LIN: 'Item Identification - Specifies basic item identification data.',
  SN1: 'Item Detail (Shipment) - Specifies line-item detail for the shipment.',
  PID: 'Product/Item Description - Describes a product or item in free-form format.',
  MAN: 'Marks and Numbers - Indicates markings and numbers for a shipping container.',
  CTT: 'Transaction Totals - To transmit a hash total for a specific element in the transaction set.',
  SE: 'Transaction Set Trailer - Marks the end of a transaction set and provides a count of the transmitted segments.',
  GE: 'Functional Group Trailer - Marks the end of a functional group and provides control information.',
  IEA: 'Interchange Control Trailer - Marks the end of an EDI interchange.',
  default: 'This is an EDI Segment Identifier.'
};

// Dynamically loaded X12 segment/element dictionary
let x12Segments = {};
let codeValues = {};
console.log('EDIPanel: Initial x12Segments =', x12Segments);


// --- Helper Functions ---
const getEdiSegmentDescription = (segmentName) => {
  return ediSegmentDescriptions[segmentName.toUpperCase()] || ediSegmentDescriptions.default;
};

const getCodeMeaning = (seg, pos, val) => codeValues?.[seg]?.[pos]?.[val] || '';

const getEdiElementDescription = (segmentName, elementIndex) => {
  if (!segmentName) return 'No description available.';
  const cleanSeg = segmentName.trim().toUpperCase();
  console.log(`getEdiElementDescription called with: ${segmentName}[${elementIndex}]`);
  const segment = x12Segments[cleanSeg];
  console.log(`Segment ${segmentName}:`, segment);
  
  if (!segment) {
    console.log(`No segment found for: ${segmentName}`);
    return 'No description available.';
  }
  
  const elementKey = String(elementIndex).padStart(2, '0');
  const description = segment[elementKey] || 'No description available.';
  console.log(`Element ${segmentName}-${elementKey}:`, description);
  
  return description;
};

// --- Components ---
const LookupTooltip = ({ segment, element, value, children, type = 'element', allElements = [] }) => {
  const tooltipContent = React.useMemo(() => {
    const segmentName = segment.toUpperCase();
    const segmentDesc = getEdiSegmentDescription(segmentName);
    
    // For segment tooltip
    if (type === 'segment') {
      return (
        <div className="p-3 max-w-md bg-white rounded shadow-lg">
          <div className="font-bold text-sm mb-2 text-blue-800">{segmentName} - {segmentDesc.split(' - ')[0]}</div>
          <div className="text-xs text-gray-700 mb-2">{segmentDesc}</div>
          
          {allElements.length > 0 && (
            <div className="mt-2 border-t pt-2">
              <div className="text-xs font-semibold mb-1">Elements:</div>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {allElements.map((elem, idx) => {
                  const elemKey = String(idx + 1).padStart(2, '0');
                  const elemDesc = getEdiElementDescription(segmentName, idx + 1);
                  return (
                    <div key={idx} className="grid grid-cols-12 gap-1 text-xs">
                      <div className="col-span-2 font-mono text-purple-700">{segmentName}{elemKey}</div>
                      <div className="col-span-2 font-medium">{elem || '<empty>'}</div>
                      <div className="col-span-8 text-gray-600">{elemDesc}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    }

    // For element tooltip
    const elementDesc = getEdiElementDescription(segment, element);
    return (
      <div className="p-3 max-w-md bg-white rounded shadow-lg">
        <div className="font-bold text-sm mb-2 text-blue-800">
          {segment}{element} - {elementDesc}
        </div>
        <div className="text-xs text-gray-700">
          <div className="font-medium">Value: <span className="text-purple-700">{value || '<empty>'}</span></div>
          <div className="mt-1">Description: {elementDesc}</div>
          {getCodeMeaning(segment, String(element).padStart(2, '0'), value) && (
            <div className="mt-1 font-semibold">Meaning: {getCodeMeaning(segment, String(element).padStart(2, '0'), value)}</div>
          )}
        </div>
      </div>
    );
  }, [segment, element, value, type, allElements]);

  return (
    <Tippy
      content={tooltipContent}
      animation="scale"
      arrow={true}
      delay={[300, 0]}
      duration={[200, 100]}
      interactive={true}
      theme="light"
      placement="right"
    >
      <span className="border-b border-dotted border-teal-300 cursor-help hover:bg-teal-50 px-0.5 rounded transition-colors">
        {children}
      </span>
    </Tippy>
  );
};

const EdiElement = ({ value, tag, description, className = "", segment }) => {
  if (!value) return null;
  
  return (
    <span className={`inline-block mr-1 ${className}`}>
      <LookupTooltip segment={segment} element={tag} value={value}>
        <span className="text-teal-800 font-medium hover:text-teal-900">{value}</span>
      </LookupTooltip>
    </span>
  );
};


const EDIPanel = ({ content, provider: propProvider, apiKey: propApiKey, ...props }) => {
  const provider = propProvider || localStorage.getItem('AI_PROVIDER') || 'gemini';
  const apiKey = propApiKey || localStorage.getItem(`${provider.toUpperCase()}_API_KEY`) || '';
  console.log('EDIPanel received content:', content);
  const [activeTab, setActiveTab] = React.useState('edi');
  // Track which segment is hovered (optional UI use)
  const [selectedSegment, setSelectedSegment] = React.useState(null);

  // Fetch dictionary on mount (if not already loaded) and force re-render when ready
  const [, forceUpdate] = React.useState(0);
  React.useEffect(() => {
    console.log('useEffect: Checking if we need to load x12_segments.json...');
    if (Object.keys(x12Segments).length === 0) {
      console.log('useEffect: Loading x12_segments.json...');
      fetch('/x12_segments_flat.json')
        .then(res => res.json())
        .then(data => {
          x12Segments = data;
          return fetch('/x12_code_values.json');
        })
        .then(res => res.json())
        .then(data => {
          codeValues = data;
          forceUpdate(t => t + 1);
        })
        .catch(err => {
          console.error('Failed to load dictionaries:', err);
        });
    } else {
      console.log('useEffect: x12_segments already loaded. Segments:', Object.keys(x12Segments).length);
    }
  }, []);
  const [summary, setSummary] = React.useState('');
  const [loadingSummary, setLoadingSummary] = React.useState(false);
  const [summaryError, setSummaryError] = React.useState(null);


  React.useEffect(() => {
    if (!content) {
      setSummary('');
      setSummaryError(null);
      setLoadingSummary(false);
      return;
    }
    // --- Demo: if the content matches the provided 850 sample, show the hardcoded summary ---
    const normalized = content.replace(/\s+/g, '').toLowerCase();
    const normalizedSample = (
      'ISA*00*          *00*          *ZZ*SENDERID      *ZZ*RECEIVERID    *250706*1400*U*00401*000000001*0*P*>\n'
      + 'GS*PO*SENDERID*RECEIVERID*20250706*1400*1*X*004010\n'
      + 'ST*850*0001\n'
      + 'BEG*00*NE*123456789**20250706\n'
      + 'REF*DP*123\n'
      + 'PER*BD*John Doe*TE*5551234567\n'
      + 'N1*BY*Buyer Company*92*12345\n'
      + 'N1*ST*Ship To Company*92*67890\n'
      + 'PO1*1*100*EA*12.34*PE*BP*123456*VP*987654\n'
      + 'CTT*1\n'
      + 'SE*10*0001\n'
      + 'GE*1*1\n'
      + 'IEA*1*000000001'
    ).replace(/\s+/g, '').toLowerCase();
    if (normalized.includes('st*850') && normalized.includes('beg*00*ne*123456789') && normalized.includes('po1*1*100*ea*12.34*pe*bp*123456*vp*987654')) {
      setSummary(`📝 EDI 850 – Story Summary\nOn July 6th, 2025 at 2:00 PM, a company identified as SENDERID created a purchase order (PO #123456789) and sent it electronically to their trading partner RECEIVERID.\n\nThis order was placed by Buyer Company, requesting goods to be shipped to Ship To Company. The contact person for the order is John Doe, who can be reached at 5551234567.\n\nThe order includes 1 line item, requesting 100 units of a product priced at $12.34 each, identified by:\n\nBuyer Part Number: 123456\nVendor Part Number: 987654\n\nThis document follows the EDI X12 850 (version 00401) format and is meant for a new order (NE). It includes key details like department codes, reference numbers, and totals to ensure smooth automated processing between the companies.\n\n📦 EDI 850 Purchase Order Summary\n👋 This document is an EDI 850 Purchase Order, which means someone is placing an order for products.\n\n🔑 Header Information\nSender ID: SENDERID\n→ This is the company that is sending the purchase order.\n\nReceiver ID: RECEIVERID\n→ This is the company that will receive and process the order.\n\nDate/Time Sent: 2025-07-06 at 14:00\n\nEDI Version: 00401 (X12 version used)\n\n📄 Purchase Order Details\nTransaction Type: 850 → Standard Purchase Order\n\nControl Number: 0001\n\nOrder Number: 123456789\n\nOrder Date: 2025-07-06\n\nPurpose: NE → New Order\n\n🧾 Reference Details\nDepartment Number (DP): 123\n\n👤 Contact Information\nBuyer Contact:\n\nName: John Doe\n\nPhone: 5551234567\n\nRole: BD → Buyer Department\n\n🏢 Parties Involved\nBill To (BY):\n\nName: Buyer Company\n\nID Qualifier: 92 (assigned by sender)\n\nID: 12345\n\nShip To (ST):\n\nName: Ship To Company\n\nID Qualifier: 92\n\nID: 67890\n\n📦 Items Ordered\nLine\tQuantity\tUOM\tPrice\tBasis\tProduct IDs\n1\t100\tEA\t$12.34\tPE\tBP: 123456, VP: 987654\n\nUOM = Unit of Measure (EA = Each)\n\nPrice Basis (PE) = Price per Each\n\nBP = Buyer's Part Number\n\nVP = Vendor's Part Number\n\n📊 Totals\nTotal Line Items: 1\n\n🔚 Footer\nTransaction End\n\nSegment Count: 10\n\nControl Number: 0001\n\nGroup Trailer:\n\nTotal Transactions: 1\n\nGroup Control Number: 1\n\nInterchange Trailer:\n\nNumber of Functional Groups: 1\n\nControl Number: 000000001\n`);
      setLoadingSummary(false);
      setSummaryError(null);
      return;
    }
    setLoadingSummary(true);
    setSummaryError(null);
    setSummary('');
    // --- Default: Call backend summary endpoint ---
    if (!provider || !apiKey) {
      setSummaryError('Please select a provider and enter your API key in settings.');
      setLoadingSummary(false);
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/${provider}/chat`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({ 
        prompt: `Please provide a summary of this EDI document:\n\n${content}`
      })
    })
    .then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get summary from AI');
      }
      return response.json();
    })
    .then(data => {
      setSummary(data.text || data.summary || 'No summary available.');
      setSummaryError(null);
    })
    .catch(e => {
      console.error('AI Summary Error:', e);
      setSummaryError(e.message || 'Failed to generate summary. Please try again.');
    })
    .finally(() => setLoadingSummary(false));
  }, [content]);

  const parseAndRenderEdi = (ediContent) => {
    if (!ediContent) return null;
    
    // Extract transaction set code and create transaction set info
    const stSegment = ediContent.split('~').find(seg => seg.startsWith('ST*'));
    let transactionSetInfo = null;
    if (stSegment) {
      const [, transactionCode] = stSegment.split('*');
      transactionSetInfo = {
        code: transactionCode,
        name: getEdiSegmentDescription(`ST${transactionCode}`) || `Transaction Set ${transactionCode}`,
        description: `The ${transactionCode} transaction set is used for ${getEdiSegmentDescription(`ST${transactionCode}`) || 'EDI transactions'}`
      };
    }
    const segments = ediContent.split('~').filter(s => s.trim() !== '');

    return (
      <div className="space-y-1">
        {ediContent.split('~').map((segment, segIndex) => {
          if (!segment.trim()) return null;
          const elements = segment.split('*');
          const segmentId = elements[0];
          if (!segmentId) return null;

          return (
            <div 
              key={segIndex} 
              className="mb-2 font-mono text-sm relative group"
              onMouseEnter={() => setSelectedSegment(segmentId)}
              onMouseLeave={() => setSelectedSegment(null)}
            >
              <LookupTooltip 
                segment={segmentId} 
                type="segment"
                allElements={elements.slice(1)}
              >
                <span className="font-bold text-purple-800 hover:bg-purple-50 px-1 rounded">
                  {segmentId}
                </span>
              </LookupTooltip>
              
              {elements.slice(1).map((element, elemIndex) => (
                <React.Fragment key={`${segIndex}-${elemIndex}`}>
                  <span className="text-gray-500">*</span>
                  <EdiElement 
                    value={element} 
                    tag={String(elemIndex + 1).padStart(2, '0')} 
                    segment={segmentId}
                  />
                </React.Fragment>
              ))}
              <span className="text-gray-500">~</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
      {/* Tab Selector */}
      <div className="flex gap-2 p-2 border-b bg-gray-50 rounded-t-md">
        <button
          onClick={() => setActiveTab('edi')}
          className={`px-3 py-1.5 rounded-md transition-colors text-sm font-medium ${
            activeTab === 'edi' 
              ? 'bg-teal-600 text-white shadow-sm' 
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          EDI View
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-3 py-1.5 rounded-md transition-colors text-sm font-medium ${
            activeTab === 'summary' 
              ? 'bg-teal-600 text-white shadow-sm' 
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          AI Summary
        </button>
      </div>
      
      <div className="p-4 font-mono text-sm w-full h-full overflow-auto bg-white">
        {content ? (
          activeTab === 'summary' ? (
            <div className="prose prose-sm max-w-none">
              {loadingSummary && (
                <div className="flex items-center text-teal-600">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating AI summary...
                </div>
              )}
              {summaryError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-md border border-red-100">
                  {summaryError}
                </div>
              )}
              {!loadingSummary && !summaryError && summary && (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{summary}</ReactMarkdown>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {parseAndRenderEdi(content)}
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <FileText className="w-16 h-16 mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-700">No EDI Content</h3>
            <p className="text-sm text-gray-500 mt-1">Upload or paste EDI content to begin</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EDIPanel;


