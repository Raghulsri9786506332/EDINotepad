#!/usr/bin/env node
/**
 * generate_x12_segments.js
 * -------------------------------------
 * Fetches a complete, pre-generated x12_segments.json file and writes it
 * to the public directory. This avoids the complexity and potential for error
 * of building it from individual schemas.
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This URL points to a complete, pre-generated dictionary file.
const DICTIONARY_URL = 'https://raw.githubusercontent.com/a-type/x12-standard/main/x12.json';
const OUTPUT_JSON = path.join(__dirname, '..', 'public', 'x12_segments.json');

async function main() {
  try {
    console.log(`Fetching complete X12 dictionary from ${DICTIONARY_URL}...`);
    
    const response = await fetch(DICTIONARY_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch dictionary: ${response.status} ${response.statusText}`);
    }
    
    const dictionary = await response.json();
    
    console.log(`Successfully fetched dictionary with ${Object.keys(dictionary).length} segments.`);
    
    // Write the dictionary to the output file
    fs.writeFileSync(OUTPUT_JSON, JSON.stringify(dictionary, null, 2));
    
    console.log(`✅ Successfully wrote X12 dictionary to ${OUTPUT_JSON}`);

  } catch (error) {
    console.error('Error generating X12 segment dictionary:', error.message);
    process.exit(1);
  }
}

main();
