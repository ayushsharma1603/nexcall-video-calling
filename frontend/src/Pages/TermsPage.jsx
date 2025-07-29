import React from "react";

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6">Terms of Service</h1>

        <p className="mb-4">
          Welcome to <strong>NexCall</strong>. By accessing or using our services,
          you agree to be bound by these Terms of Service. If you do not agree with any
          part of the terms, please do not use the service.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">1. Use of Service</h2>
        <p className="mb-4">
          You agree to use the platform responsibly and not to engage in any activity
          that may harm, disrupt, or misuse the service or other users.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">2. User Accounts</h2>
        <p className="mb-4">
          You are responsible for maintaining the confidentiality of your login credentials.
          You agree to notify us immediately of any unauthorized use of your account.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">3. Content</h2>
        <p className="mb-4">
          You retain ownership of any content you post but grant NexCall a non-exclusive
          license to use, display, and share it as necessary for the functioning of the service.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">4. Termination</h2>
        <p className="mb-4">
          We reserve the right to suspend or terminate your access to the service at any time,
          without notice, for behavior that violates these terms or is harmful to other users.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">5. Changes to Terms</h2>
        <p className="mb-4">
          We may update these Terms of Service from time to time. Continued use of the platform
          after such changes indicates your acceptance of the new terms.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">6. Contact Us</h2>
        

        <p className="text-sm text-gray-500 mt-10 text-right">
          Last updated: July 24, 2025
        </p>
      </div>
    </div>
  );
};

export default TermsPage;
