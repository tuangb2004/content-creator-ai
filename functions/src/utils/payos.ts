import * as functions from 'firebase-functions';

// PayOS configuration
const payOSClientId = functions.config().payos?.client_id || process.env.PAYOS_CLIENT_ID;
const payOSApiKey = functions.config().payos?.api_key || process.env.PAYOS_API_KEY;
const payOSChecksumKey = functions.config().payos?.checksum_key || process.env.PAYOS_CHECKSUM_KEY;

// Test mode: Set PAYOS_TEST_MODE=true to use mock responses (for local testing without internet)
const PAYOS_TEST_MODE = process.env.PAYOS_TEST_MODE === 'true';

// Validate PayOS credentials
function validatePayOSCredentials(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  
  if (!payOSClientId) missing.push('PAYOS_CLIENT_ID');
  if (!payOSApiKey) missing.push('PAYOS_API_KEY');
  if (!payOSChecksumKey) missing.push('PAYOS_CHECKSUM_KEY');
  
  if (missing.length > 0) {
    console.warn(`[PayOS] Missing credentials: ${missing.join(', ')}. PayOS API will not be available.`);
    console.warn('[PayOS] Configure credentials via:');
    console.warn('  1. Firebase config: firebase functions:config:set payos.client_id="..." payos.api_key="..." payos.checksum_key="..."');
    console.warn('  2. Environment variables: PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY');
    console.warn('  3. .env file in functions directory (for local development)');
  }
  
  return { valid: missing.length === 0, missing };
}

// Validate on module load
const credentialsCheck = validatePayOSCredentials();
if (!credentialsCheck.valid) {
  console.warn(`[PayOS] Credentials validation failed. Missing: ${credentialsCheck.missing.join(', ')}`);
}

/**
 * PayOS Payment Link Request
 */
export interface PayOSCreatePaymentLinkRequest {
  orderCode: number;
  amount: number; // Amount in VND
  description: string;
  cancelUrl: string;
  returnUrl: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

/**
 * PayOS Payment Link Response
 */
export interface PayOSCreatePaymentLinkResponse {
  error: number;
  message: string;
  data?: {
    bin: string;
    accountNumber: string;
    accountName: string;
    amount: number;
    description: string;
    orderCode: number;
    currency: string;
    paymentLinkId: string;
    qrCode: string;
    checkoutUrl: string;
  };
}

/**
 * PayOS Webhook Data
 */
export interface PayOSWebhookData {
  code: string;
  desc: string;
  data: {
    orderCode: number;
    amount: number;
    description: string;
    accountNumber: string;
    reference: string;
    transactionDateTime: string;
    currency: string;
    paymentLinkId: string;
    code: string;
    desc: string;
    counterAccountBankId: string | null;
    counterAccountBankName: string | null;
    counterAccountName: string | null;
    counterAccountNumber: string | null;
    virtualAccountName: string | null;
    virtualAccountNumber: string | null;
  };
  signature: string;
}

/**
 * Create HMAC SHA256 signature for PayOS
 */
function createSignature(data: string): string {
  if (!payOSChecksumKey) {
    throw new Error('PAYOS_CHECKSUM_KEY is not configured');
  }
  
  const crypto = require('crypto');
  return crypto
    .createHmac('sha256', payOSChecksumKey)
    .update(data)
    .digest('hex');
}

/**
 * Verify PayOS webhook signature
 * 
 * According to PayOS documentation, the signature is calculated as:
 * HMAC-SHA256(JSON.stringify({ code, desc, data }), CHECKSUM_KEY)
 * 
 * @param data - Webhook data from PayOS
 * @returns true if signature is valid, false otherwise
 * @throws Error if CHECKSUM_KEY is not configured
 */
export function verifyWebhookSignature(data: PayOSWebhookData): boolean {
  if (!payOSChecksumKey) {
    throw new Error('PAYOS_CHECKSUM_KEY is not configured. Cannot verify webhook signature.');
  }

  if (!data || !data.signature) {
    console.error('[verifyWebhookSignature] Webhook data or signature is missing');
    return false;
  }

  try {
    const { code, desc, data: webhookData } = data;
    
    // Create the data string exactly as PayOS does
    // PayOS uses JSON.stringify with specific order: code, desc, data
    const dataString = JSON.stringify({ code, desc, data: webhookData });
    const calculatedSignature = createSignature(dataString);
    
    const isValid = calculatedSignature === data.signature;
    
    if (!isValid) {
      console.error('[verifyWebhookSignature] Signature mismatch');
      console.error('[verifyWebhookSignature] Expected:', data.signature);
      console.error('[verifyWebhookSignature] Calculated:', calculatedSignature);
      console.error('[verifyWebhookSignature] Data string:', dataString);
    } else {
      console.log('[verifyWebhookSignature] Signature verified successfully');
    }
    
    return isValid;
  } catch (error: any) {
    console.error('[verifyWebhookSignature] Error verifying signature:', error);
    return false;
  }
}

/**
 * Create PayOS payment link
 */
export async function createPaymentLink(
  request: PayOSCreatePaymentLinkRequest
): Promise<PayOSCreatePaymentLinkResponse> {
  if (!payOSClientId || !payOSApiKey) {
    const errorMsg = 'PayOS credentials are not configured. Set PAYOS_CLIENT_ID and PAYOS_API_KEY in .env or Firebase config';
    console.error(`[createPaymentLink] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  // Validate request
  if (!request.orderCode || request.orderCode <= 0) {
    throw new Error('Invalid orderCode: must be a positive number');
  }
  if (!request.amount || request.amount <= 0) {
    throw new Error('Invalid amount: must be greater than 0');
  }
  if (!request.description) {
    throw new Error('Description is required');
  }
  if (!request.cancelUrl || !request.returnUrl) {
    throw new Error('cancelUrl and returnUrl are required');
  }

  // Test mode: Return mock response for local testing
  if (PAYOS_TEST_MODE) {
    console.log('[createPaymentLink] ⚠️ TEST MODE: Using mock PayOS response');
    console.log('[createPaymentLink] Mock payment link request:', JSON.stringify(request, null, 2));
    
    // Generate mock payment link ID
    const mockPaymentLinkId = `test_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    // In test mode, return a local URL or skip redirect
    // Frontend should handle test mode differently
    const mockCheckoutUrl = `http://localhost:5173/dashboard?payment=test&paymentLinkId=${mockPaymentLinkId}&amount=${request.amount}`;
    const mockQrCode = `https://img.vietqr.io/image/970415-2154048326-compact2.png?amount=${request.amount}&addInfo=${encodeURIComponent(request.description)}`;
    
    const mockResponse: PayOSCreatePaymentLinkResponse = {
      error: 0,
      message: 'Success (TEST MODE)',
      data: {
        bin: '970415',
        accountNumber: '2154048326',
        accountName: 'LUONG GIA TUAN',
        amount: request.amount,
        description: request.description,
        orderCode: request.orderCode,
        currency: 'VND',
        paymentLinkId: mockPaymentLinkId,
        qrCode: mockQrCode,
        checkoutUrl: mockCheckoutUrl,
      }
    };
    
    console.log('[createPaymentLink] Mock response:', JSON.stringify(mockResponse, null, 2));
    return mockResponse;
  }

  const apiUrl = 'https://api.payos.vn/v2/payment-requests';

  try {
    console.log('[createPaymentLink] Creating PayOS payment link with request:', JSON.stringify(request, null, 2));
    
    // Add timeout for fetch request (30 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': payOSClientId,
          'x-api-key': payOSApiKey,
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

    console.log('[createPaymentLink] PayOS API response status:', response.status, response.statusText);

    if (!response.ok) {
      let errorData: any;
      try {
        errorData = await response.json();
      } catch (parseError) {
        const text = await response.text();
        console.error('[createPaymentLink] PayOS API error - failed to parse response:', text);
        throw new Error(`PayOS API error: ${response.status} ${response.statusText} - ${text}`);
      }
      
      console.error('[createPaymentLink] PayOS API error response:', JSON.stringify(errorData, null, 2));
      throw new Error(`PayOS API error: ${response.status} - ${errorData.message || JSON.stringify(errorData)}`);
    }

    const result: PayOSCreatePaymentLinkResponse = await response.json();
    console.log('[createPaymentLink] PayOS API response:', JSON.stringify(result, null, 2));
    
    if (result.error !== 0) {
      console.error('[createPaymentLink] PayOS error in response:', result.error, result.message);
      throw new Error(`PayOS error: ${result.message || 'Unknown error'}`);
    }

    if (!result.data) {
      console.error('[createPaymentLink] PayOS response missing data field:', JSON.stringify(result, null, 2));
      throw new Error('PayOS response missing data field');
    }

    // Validate required fields in data
    if (!result.data.paymentLinkId) {
      throw new Error('PayOS response missing paymentLinkId');
    }
    if (!result.data.checkoutUrl) {
      throw new Error('PayOS response missing checkoutUrl');
    }

    console.log(`[createPaymentLink] Successfully created payment link: ${result.data.paymentLinkId}`);
      return result;
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      // Handle network errors
      if (fetchError.name === 'AbortError') {
        throw new Error('PayOS API request timeout. Please check your internet connection and try again.');
      }
      
      if (fetchError.code === 'ENOTFOUND' || fetchError.cause?.code === 'ENOTFOUND') {
        throw new Error('Cannot connect to PayOS API. Please check your internet connection. Error: DNS lookup failed for api.payos.vn');
      }
      
      if (fetchError.cause) {
        throw fetchError;
      }
      
      throw fetchError;
    }
  } catch (error: any) {
    console.error('[createPaymentLink] Failed to create PayOS payment link:', error);
    console.error('[createPaymentLink] Error stack:', error.stack);
    console.error('[createPaymentLink] Error cause:', error.cause);
    console.error('[createPaymentLink] Error code:', error.code);
    
    // Provide user-friendly error messages
    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      throw new Error('PayOS API request timeout. Please check your internet connection and try again.');
    }
    
    if (error.code === 'ENOTFOUND' || error.cause?.code === 'ENOTFOUND' || error.message?.includes('ENOTFOUND') || error.message?.includes('DNS')) {
      throw new Error('Cannot connect to PayOS API. Please check your internet connection, VPN, and ensure api.payos.vn is accessible.');
    }
    
    if (error.message?.includes('fetch failed') || error.cause?.code === 'ECONNREFUSED') {
      throw new Error('Cannot connect to PayOS API. Please check your internet connection and VPN settings.');
    }
    
    // Re-throw with more context if it's not already an Error
    if (error instanceof Error) {
      // Include original error message for debugging
      const errorMsg = error.message || 'Unknown error';
      throw new Error(`Failed to create PayOS payment link: ${errorMsg}`);
    }
    throw new Error(`Failed to create PayOS payment link: ${String(error)}`);
  }
}

/**
 * Get payment link information
 */
export async function getPaymentLinkInfo(paymentLinkId: string): Promise<any> {
  if (!payOSClientId || !payOSApiKey) {
    throw new Error('PayOS credentials are not configured');
  }

  if (!paymentLinkId || typeof paymentLinkId !== 'string') {
    throw new Error('Invalid paymentLinkId: must be a non-empty string');
  }

  const apiUrl = `https://api.payos.vn/v2/payment-requests/${paymentLinkId}`;

  try {
    console.log(`[getPaymentLinkInfo] Fetching payment link info: ${paymentLinkId}`);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-client-id': payOSClientId,
        'x-api-key': payOSApiKey,
      },
    });

    console.log(`[getPaymentLinkInfo] PayOS API response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorData: any;
      try {
        errorData = await response.json();
      } catch (parseError) {
        const text = await response.text();
        console.error('[getPaymentLinkInfo] PayOS API error - failed to parse response:', text);
        throw new Error(`PayOS API error: ${response.status} ${response.statusText} - ${text}`);
      }
      
      console.error('[getPaymentLinkInfo] PayOS API error response:', JSON.stringify(errorData, null, 2));
      throw new Error(`PayOS API error: ${response.status} - ${errorData.message || JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    console.log(`[getPaymentLinkInfo] Successfully fetched payment link info: ${paymentLinkId}`);
    return result;
  } catch (error: any) {
    console.error(`[getPaymentLinkInfo] Failed to get PayOS payment link info for ${paymentLinkId}:`, error);
    console.error('[getPaymentLinkInfo] Error stack:', error.stack);
    
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to get PayOS payment link info: ${String(error)}`);
  }
}

