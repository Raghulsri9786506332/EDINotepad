#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import https from 'https';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const OUTPUT_JSON = path.join(__dirname, '..', 'public', 'x12_segments.json');

async function downloadDictionary() {
  try {
    // Download from a reliable source containing comprehensive X12 segment definitions
    try {
      const options = {
        hostname: 'raw.githubusercontent.com',
        path: '/Stedi/edi-schemas/main/edi-schemas/x12-005010.json',
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      };

      const req = https.request(options, (res) => {
        if (res.statusCode !== 200) {
          console.error(`Failed to download dictionary: ${res.statusCode} ${res.statusMessage}`);
          process.exit(1);
        }

        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            // Parse and transform the dictionary
            const dictionary = JSON.parse(data);
            const transformedDictionary = transformDictionary(dictionary);
            
            // Write to file
            fs.writeFileSync(OUTPUT_JSON, JSON.stringify(transformedDictionary, null, 2));
            console.log(`Successfully downloaded and transformed X12 dictionary with ${Object.keys(transformedDictionary).length} segments.`);
            console.log(`Dictionary written to ${OUTPUT_JSON}`);
          } catch (error) {
            console.error('Error processing dictionary:', error);
            process.exit(1);
          }
        });
      });

      req.on('error', (error) => {
        console.error('Error downloading dictionary:', error);
        process.exit(1);
      });

      req.end();
    } catch (error) {
      console.error('Error in request:', error);
      process.exit(1);
    }
  } catch (error) {
    console.error('Error downloading X12 dictionary:', error);
    process.exit(1);
  }
}

function transformDictionary(dict) {
  // This function transforms the downloaded dictionary into our expected format
  // where segment → element → description
  const transformed = {};
  
  // Add default fallback
  transformed.default = { '00': 'No description available.' };
  
  // Add common segments
  const commonSegments = {
    'ISA': {
      '01': 'Authorization Information Qualifier',
      '02': 'Authorization Information',
      '03': 'Security Information Qualifier',
      '04': 'Security Information',
      '05': 'Interchange ID Qualifier (Sender)',
      '06': 'Interchange Sender ID',
      '07': 'Interchange ID Qualifier (Receiver)',
      '08': 'Interchange Receiver ID',
      '09': 'Interchange Date (YYMMDD)',
      '10': 'Interchange Time (HHMM)',
      '11': 'Interchange Control Standards Identifier',
      '12': 'Interchange Control Version Number',
      '13': 'Interchange Control Number',
      '14': 'Acknowledgment Requested (0=No, 1=Yes)',
      '15': 'Usage Indicator (P=Production, T=Test)',
      '16': 'Component Element Separator'
    },
    'IEA': {
      '01': 'Number of Included Functional Groups',
      '02': 'Interchange Control Number'
    },
    'GS': {
      '01': 'Functional Identifier Code',
      '02': 'Application Sender\'s Code',
      '03': 'Application Receiver\'s Code',
      '04': 'Date (CCYYMMDD)',
      '05': 'Time (HHMM)',
      '06': 'Group Control Number',
      '07': 'Responsible Agency Code (X=Accredited Standards Committee X12)',
      '08': 'Version/Release/Industry Identifier Code'
    },
    'GE': {
      '01': 'Number of Transaction Sets Included',
      '02': 'Group Control Number'
    },
    'ST': {
      '01': 'Transaction Set Identifier Code',
      '02': 'Transaction Set Control Number',
      '03': 'Implementation Convention Reference (optional)'
    },
    'SE': {
      '01': 'Number of Included Segments',
      '02': 'Transaction Set Control Number (should match ST02)'
    }
  };
  
  // Merge common segments first
  Object.assign(transformed, commonSegments);
  
  // Add all segments from the downloaded dictionary
  Object.entries(dict).forEach(([segment, elements]) => {
    if (!transformed[segment]) {
      transformed[segment] = {};
    }
    
    Object.entries(elements).forEach(([position, description]) => {
      // Ensure position is always 2 digits
      const pos = position.padStart(2, '0');
      transformed[segment][pos] = description;
    });
  });
  
  return transformed;
}

// Run the download
downloadDictionary();
