import crypto from 'crypto';
import axios from 'axios';

/**
 * Generates an ICICI secureHash using SHA-256
 * 1. Excludes empty/null parameters and the 'secureHash' key itself
 * 2. Sorts parameter keys alphabetically
 * 3. Concatenates values without any separator
 * 4. Appends the ICICI_SECURE_HASH_KEY
 * 5. Hashes with SHA-256 and returns lowercase hex
 */
export const generateICICISecureHash = (params) => {
  const secretKey = process.env.ICICI_SECURE_HASH_KEY;
  if (!secretKey) {
    throw new Error('ICICI_SECURE_HASH_KEY is missing from environment variables');
  }

  // 1 & 2: Filter non-empty and sort keys
  const sortedKeys = Object.keys(params)
    .filter((key) => key !== 'secureHash' && params[key] !== null && params[key] !== undefined && params[key] !== '')
    .sort();

  // 3: Build the canonical concatenated string (only values)
  const canonicalString = sortedKeys.map((key) => params[key]).join('');

  // 4 & 5: Hash with HMAC-SHA256
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(canonicalString);
  return hmac.digest('hex').toLowerCase();
};

/**
 * Verifies the secureHash in an incoming ICICI callback/response
 */
export const verifyICICISecureHash = (responseParams) => {
  if (!responseParams || !responseParams.secureHash) return false;
  
  const generatedHash = generateICICISecureHash(responseParams);
  return generatedHash === responseParams.secureHash.toLowerCase();
};

/**
 * Initiates an ICICI Refund Request
 */
export const processICICIRefund = async (merchantTranId, refundAmount, originalTxnId) => {
  const merchantId = process.env.ICICI_MERCHANT_ID;
  const refundUrl = process.env.ICICI_REFUND_URL;
  if (!refundUrl) throw new Error('ICICI_REFUND_URL is missing from environment variables');
  
  // Construct Refund Payload based on typical ICICI Server-to-Server Refund API specs
  const refundPayload = {
    merchantId,
    merchantTranId, // Often a new unique ID for the refund transaction itself, but sometimes original
    originalMerchantTranId: merchantTranId, 
    originalTxnId,
    amount: Number(refundAmount).toFixed(2),
    transactionType: 'REFUND'
  };

  refundPayload.secureHash = generateICICISecureHash(refundPayload);

  try {
    const response = await axios.post(refundUrl, refundPayload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000 // 10 second timeout for external API
    });

    const data = response.data;
    
    // Validate response hash
    if (!verifyICICISecureHash(data)) {
      throw new Error('Invalid Secure Hash in ICICI Refund Response');
    }

    if (data.ResponseCode === '0000' || data.ResponseCode === '0') {
      return { success: true, refundId: data.refundId || data.txnId, data };
    } else {
      return { success: false, message: data.message || 'Refund rejected by ICICI', data };
    }
  } catch (error) {
    console.error('ICICI Refund Error:', error);
    return { success: false, message: error.message };
  }
};
