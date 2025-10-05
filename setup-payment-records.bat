@echo off
echo Starting setup for payment records implementation...

echo 1. Replacing API route files...
move /y "e:\Projects\NextJs\sendmame\app\api\verify-payment\route.ts.new" "e:\Projects\NextJs\sendmame\app\api\verify-payment\route.ts"
move /y "e:\Projects\NextJs\sendmame\app\api\stripe\webhook\route.ts.new" "e:\Projects\NextJs\sendmame\app\api\stripe\webhook\route.ts"

echo 2. Running Prisma database push...
npx prisma db push

echo 3. Regenerating Prisma client...
npx prisma generate

echo 4. Uncommenting SubscriptionPayment creation in API routes...
echo NOTE: You need to manually uncomment the SubscriptionPayment creation code in:
echo - app/api/verify-payment/route.ts
echo - app/api/stripe/webhook/route.ts
echo - app/api/payments/history/route.ts
echo - app/api/payments/[paymentId]/route.ts
echo - app/api/admin/payments/route.ts

echo 5. Setup complete! You can now use the payment records functionality.