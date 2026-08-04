import crypto from 'crypto';

const workingKey = '12B296D95F2DD84AA39EA54B5D2411C9';
const plainText = 'merchant_id=12345&order_id=60d5ec49&currency=INR&amount=100.00&';

// Method 1: Current implementation
const encrypt1 = (plainText, workingKey) => {
  const m = crypto.createHash('md5');
  m.update(workingKey);
  const key = m.digest();
  const iv = '\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f';
  const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
  let encoded = cipher.update(plainText, 'utf8', 'hex');
  encoded += cipher.final('hex');
  return encoded;
};

// Method 2: Alternate implementation using Buffer IV
const encrypt2 = (plainText, workingKey) => {
  const m = crypto.createHash('md5');
  m.update(workingKey);
  const key = m.digest();
  const iv = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f]);
  const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
  let encoded = cipher.update(plainText, 'utf8', 'hex');
  encoded += cipher.final('hex');
  return encoded;
};

console.log("Current (String IV):", encrypt1(plainText, workingKey));
console.log("Alternate (Buffer IV):", encrypt2(plainText, workingKey));
