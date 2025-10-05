-- CreateTable
CREATE TABLE "public"."subscription_payments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionTier" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "paymentPeriod" INTEGER NOT NULL DEFAULT 1,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'COMPLETED',
    "stripeSessionId" TEXT,
    "stripeCustomerId" TEXT,
    "stripePaymentIntentId" TEXT,
    "transactionId" TEXT,
    "description" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscription_payments_stripeSessionId_key" ON "public"."subscription_payments"("stripeSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_payments_stripePaymentIntentId_key" ON "public"."subscription_payments"("stripePaymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_payments_transactionId_key" ON "public"."subscription_payments"("transactionId");

-- AddForeignKey
ALTER TABLE "public"."subscription_payments" ADD CONSTRAINT "subscription_payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscription_payments" ADD CONSTRAINT "subscription_payments_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "public"."transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
