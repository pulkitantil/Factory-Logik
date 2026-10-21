import 'dotenv/config';
import Razorpay from 'razorpay';

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  throw new Error(
    'RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be configured in server/.env'
  );
}

if (!keyId.startsWith('rzp_test_') && !keyId.startsWith('rzp_live_')) {
  throw new Error('Invalid Razorpay Key ID format.');
}

const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

export default razorpay;
