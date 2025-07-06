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

const ediElementDictionary = {
  default: 'No description available.',
  ISA: {
    '01': 'Authorization Information Qualifier', '02': 'Authorization Information', '03': 'Security Information Qualifier', '04': 'Security Information', '05': 'Interchange ID Qualifier', '06': 'Interchange Sender ID', '07': 'Interchange ID Qualifier', '08': 'Interchange Receiver ID', '09': 'Interchange Date (YYMMDD)', '10': 'Interchange Time (HHMM)', '11': 'Repetition Separator', '12': 'Interchange Control Version Number', '13': 'Interchange Control Number', '14': 'Acknowledgement Requested', '15': 'Usage Indicator (P/T/I)', '16': 'Component Element Separator',
  },
  GS: {
    '01': 'Functional Identifier Code', '02': 'Application Sender\'s Code', '03': 'Application Receiver\'s Code', '04': 'Date (CCYYMMDD)', '05': 'Time (HHMM)', '06': 'Group Control Number', '07': 'Responsible Agency Code', '08': 'Version / Release / Industry Identifier Code',
  },
  ST: { '01': 'Transaction Set Identifier Code', '02': 'Transaction Set Control Number' },
  BSN: { '01': 'Transaction Set Purpose Code', '02': 'Shipment Identification', '03': 'Date (CCYYMMDD)', '04': 'Time (HHMMSS)' },
  HL: { '01': 'Hierarchical ID Number', '02': 'Hierarchical Parent ID Number', '03': 'Hierarchical Level Code' },
  DTM: { '01': 'Date/Time Qualifier', '02': 'Date (CCYYMMDD)', '03': 'Time (HHMM)' },
  N1: { '01': 'Entity Identifier Code', '02': 'Name', '03': 'Identification Code Qualifier', '04': 'Identification Code' },
  CTT: { '01': 'Number of Line Items' },
  SE: { '01': 'Number of Included Segments', '02': 'Transaction Set Control Number' },
  GE: { '01': 'Number of Transaction Sets Included', '02': 'Group Control Number' },
  IEA: { '01': 'Number of Included Functional Groups', '02': 'Interchange Control Number' },
  REF: { '01': 'Reference Identification Qualifier', '02': 'Reference Identification', '03': 'Description' },
  MAN: { '01': 'Marks and Numbers Qualifier', '02': 'Marks and Numbers', '03': 'Marks and Numbers' },
};

// --- Helper Functions ---
const getEdiSegmentDescription = (segmentName) => {
  return ediSegmentDescriptions[segmentName.toUpperCase()] || ediSegmentDescriptions.default;
};

const getEdiElementDescription = (segment, elementIndex) => {
  const segmentDict = ediElementDictionary[segment.toUpperCase()];
  if (!segmentDict) return ediElementDictionary.default;
  const key = String(elementIndex).padStart(2, '0');
  return segmentDict[key] || ediElementDictionary.default;
};

// --- Components ---
const LookupTooltip = ({ segment, element, value, children }) => {
  const [meaning, setMeaning] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  // Only lookup if all are non-empty strings
  const valid = [segment, element, value].every(x => typeof x === 'string' && x.length > 0);

  const fetchMeaning = async () => {
    if (!valid) return;
    setLoading(true);
    try {
      const res = await fetch(`/lookup/${segment}/${element}/${value}`);
      const data = await res.json();
      setMeaning(data.found ? data.meaning : 'Not found');
    } catch {
      setMeaning('Not found');
    } finally {
      setLoading(false);
    }
  };

  if (!valid) return <span>{children}</span>;

  return (
    <Tippy
      content={
        <div className="text-left p-1 min-w-[180px]">
          <div className="font-bold">{segment} {element} = {value}</div>
          <div className="text-xs text-muted-foreground">
            {/* Always show static element description */}
            <div>{getEdiElementDescription(segment, element)}</div>
            {/* Show dynamic value meaning if found */}
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div>{meaning && meaning !== 'Not found' ? meaning : 'No code description'}</div>
            )}
          </div>
        </div>
      }
      animation="scale"
      duration={200}
      allowHTML={true}
      onShow={fetchMeaning}
    >
      <span className={"px-1 rounded cursor-pointer transition-colors hover:bg-blue-100 hover:text-blue-700"}>
        {children}
      </span>
    </Tippy>
  );
};

const EdiElement = ({ value, tag, description, className = "" }) => {
  // Defensive: tag must be a string and at least 4 chars (e.g. N101)
  if (typeof tag !== 'string' || tag.length < 4) {
    return <span className={`px-1 rounded cursor-pointer ${className}`}>{value}</span>;
  }
  const segment = tag.substring(0, 3);
  const element = tag.substring(3);
  return (
    <LookupTooltip segment={segment} element={element} value={value}>
      <span className={`px-1 rounded cursor-pointer ${className}`}>{value}</span>
    </LookupTooltip>
  );
};


const EDIPanel = ({ content, provider: propProvider, apiKey: propApiKey, ...props }) => {
  const provider = propProvider || localStorage.getItem('AI_PROVIDER') || 'gemini';
  const apiKey = propApiKey || localStorage.getItem(`${provider.toUpperCase()}_API_KEY`) || '';
  console.log('EDIPanel received content:', content);
  const [activeTab, setActiveTab] = React.useState('edi');
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

    fetch('/api/edi/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, provider, apiKey })
    })
    .then(r => r.ok ? r.json() : r.json().then(e => { throw new Error(e.error || e.detail || 'AI error'); }))
    .then(data => setSummary(data.summary || data.text || 'No summary available.'))
    .catch(e => setSummaryError(e.message))
    .finally(() => setLoadingSummary(false));
  }, [content]);

  const parseAndRenderEdi = (ediContent) => {
    if (!ediContent) return null;
    const segments = ediContent.split('~').filter(s => s.trim() !== '');

    return segments.map((segment, segIndex) => {
      const elements = segment.trim().split('*');
      const segmentName = elements[0] || 'SEG';
      const segmentDescription = getEdiSegmentDescription(segmentName);

      return (
        <div key={segIndex} className="flex items-center flex-wrap mb-1">
          <span className="text-muted-foreground mr-4 select-none">{String(segIndex + 1).padStart(3, '0')}</span>
          
          <Tippy
            content={
              <div className="text-left p-1 max-w-xs">
                <div className="font-bold">{segmentName}</div>
                <div className="text-xs text-muted-foreground">{segmentDescription}</div>
              </div>
            }
            animation="scale"
            duration={200}
            allowHTML={true}
          >
            <span className="font-bold text-edi-segment mr-2 cursor-pointer hover:bg-edi-segment-hover transition-colors duration-150 rounded px-1">
              {segmentName}
            </span>
          </Tippy>

          {elements.slice(1).map((element, elIndex) => {
            const tag = `${segmentName}${String(elIndex + 1).padStart(2, '0')}`;
            const description = getEdiElementDescription(segmentName, elIndex + 1);
            return (
              <React.Fragment key={elIndex}>
                <EdiElement
                  value={element}
                  tag={tag}
                  description={description}
                  className="font-semibold text-edi-element hover:bg-edi-element-hover transition-colors duration-150"
                />
                {elIndex < elements.length - 2 && <span className="text-muted-foreground mx-0.5">*</span>}
              </React.Fragment>
            );
          })}
        </div>
      );
    });
  };

  return (
    <Card className="h-full w-full overflow-auto bg-background rounded-md">
      {/* Tab Selector */}
      <div className="flex gap-2 p-2 border-b bg-muted rounded-t-md">
        <button
          onClick={() => setActiveTab('edi')}
          className={`px-3 py-1 rounded transition-colors ${activeTab === 'edi' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
        >EDI View</button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-3 py-1 rounded transition-colors ${activeTab === 'summary' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
        >Summary</button>
      </div>
      <CardContent className="p-4 font-mono text-sm w-full h-full overflow-auto">
        {content ? (
          activeTab === 'summary' ? (
            <div className="prose prose-sm max-w-none">

              {loadingSummary && <div className="text-blue-500">Generating summary...</div>}
              {summaryError && <div className="text-red-500">{summaryError}</div>}
              {!loadingSummary && !summaryError && summary && (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{summary}</ReactMarkdown>
                </div>
              )}
            </div>
          ) : (
            <div>
              {console.log('Rendering EDI content:', content)}
              {parseAndRenderEdi(content)}
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <FileText className="w-16 h-16 mb-4" />
            <h3 className="text-xl font-semibold">Select a file to view</h3>
            <p className="text-sm">Click on a file in the sidebar to display its content here.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EDIPanel;


