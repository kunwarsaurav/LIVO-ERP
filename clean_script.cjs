const fs = require('fs');

function cleanPOS() {
  const file = 'src/components/billing/POSBillingModule.tsx';
  let content = fs.readFileSync(file, 'utf8');
  
  const startRegex = /\{\/\*\s*=========================================================================\s*\*\/\}\s*\{\/\*\s*5\. EMPLOYEE ATTENDANCE TAB\s*\*\/\}/;
  const endRegex = /\{\/\*\s*=========================================================================\s*\*\/\}\s*\{\/\*\s*MODAL: Create Quotation\s*\*\/\}/;
  
  const startMatch = content.match(startRegex);
  const endMatch = content.match(endRegex);
  
  if (startMatch && endMatch) {
    content = content.substring(0, startMatch.index) + content.substring(endMatch.index);
    fs.writeFileSync(file, content);
    console.log('Cleaned POSBillingModule');
  } else {
    console.log('Could not find indices in POSBillingModule');
  }
}

function cleanHR() {
  const file = 'src/components/billing/HRPayrollModule.tsx';
  let content = fs.readFileSync(file, 'utf8');
  
  const startRegex = /\{\/\*\s*=========================================================================\s*\*\/\}\s*\{\/\*\s*1\. POS \/ BILLING TAB\s*\*\/\}/;
  const endRegex = /\{\/\*\s*=========================================================================\s*\*\/\}\s*\{\/\*\s*5\. EMPLOYEE ATTENDANCE TAB\s*\*\/\}/;
  
  const startMatch = content.match(startRegex);
  const endMatch = content.match(endRegex);
  
  if (startMatch && endMatch) {
    content = content.substring(0, startMatch.index) + content.substring(endMatch.index);
    fs.writeFileSync(file, content);
    console.log('Cleaned HRPayrollModule');
  } else {
    console.log('Could not find indices in HRPayrollModule');
  }
}

cleanPOS();
cleanHR();
