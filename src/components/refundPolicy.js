import React from "react";
import { Link } from "react-router-dom";

import styles from "./termsAndConditions.module.css";

const RefundPolicy = () => {
  return (
    <div className={styles.termsAndConditionsContainer}>
      <div className={styles.termsAndConditions}>
        <h1>Refund Policy</h1>
        <p>Last updated: April 6, 2026</p>
        <p>
          This Refund Policy describes how BitLion, LLC (&quot;Mostlink,&quot;
          &quot;we,&quot; &quot;us&quot;) handles payments and refunds for the
          Mostlink service. If you have questions, contact us via{" "}
          <Link to="/support">Support</Link>.
        </p>

        <h2>1. Subscriptions and billing</h2>
        <p>
          Paid plans are billed in advance for each billing period (for example,
          monthly or annually, depending on what you choose at checkout). By
          subscribing, you authorize us to charge your payment method on a
          recurring basis until you cancel.
        </p>

        <h2>2. Cancellation</h2>
        <p>
          You may cancel your subscription at any time from your account or
          billing settings. When you cancel, you typically keep access to paid
          features until the end of the period you already paid for. We do not
          charge you again after cancellation unless you resubscribe.
        </p>

        <h2>3. Refunds</h2>
        <p>
          <strong>Mostlink usually does not issue refunds for paid plans.</strong>{" "}
          Fees you pay for a subscription are <strong>non-refundable</strong>,
          except where applicable law does not allow that limitation. If you
          cancel after you have been charged, you will not receive money back
          for the current billing period simply because you stopped using the
          service early.
        </p>
        <p>
          <strong>Limited exception (first 72 hours).</strong> We may, in our
          sole discretion, make an exception and refund or partially refund a
          charge if you cancel the paid plan within{" "}
          <strong>seventy-two (72) hours</strong> of that charge (for example,
          right after you first upgrade or renew). This is not a guarantee. If
          you believe you qualify, reach out through our{" "}
          <Link to="/support">Support</Link> page or email{" "}
          <a href="mailto:grant@mostlink.co">grant@mostlink.co</a>.
        </p>

        <h2>4. Legal rights</h2>
        <p>
          If applicable consumer protection laws in your jurisdiction give you
          refund rights that cannot be waived, those rights apply in addition
          to (not instead of) this policy.
        </p>

        <h2>5. Changes</h2>
        <p>
          We may update this Refund Policy from time to time. The &quot;Last
          updated&quot; date at the top will change when we do. Continued use of
          the service after changes means you accept the updated policy, except
          where a stricter legal rule applies.
        </p>
      </div>
    </div>
  );
};

export default RefundPolicy;
