import React, { useState, useEffect } from 'react';
import { useGetCompanySettings, useSaveCompanySettings } from '../hooks/useQueries';
import type { CompanySettings } from '../backend';

export default function CompanySettingsPage() {
  const { data: settings, isLoading } = useGetCompanySettings();
  const saveSettingsMutation = useSaveCompanySettings();

  const [companyAddress, setCompanyAddress] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [gstin, setGstin] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Pre-fill fields when settings load
  useEffect(() => {
    if (settings) {
      setCompanyAddress(settings.companyAddress || '');
      setAccountNumber(settings.accountNumber || '');
      setPanNumber(settings.panNumber || '');
      setGstin(settings.gstin || '');
      setIfscCode(settings.ifscCode || '');
      setBankName(settings.bankName || '');
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    const payload: CompanySettings = {
      companyAddress: companyAddress.trim(),
      accountNumber: accountNumber.trim(),
      panNumber: panNumber.trim(),
      gstin: gstin.trim(),
      ifscCode: ifscCode.trim(),
      bankName: bankName.trim(),
    };

    try {
      await saveSettingsMutation.mutateAsync(payload);
      setSuccessMsg('Settings saved successfully! Changes will appear on all invoices.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg || 'Failed to save settings. Please try again.');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">Company Settings</h1>
        <p className="text-gray-600 text-sm mt-1">
          Edit MANISH INFRATECH company details. These appear on all printed invoices.
        </p>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center text-gray-500">
          <div className="inline-block w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin mb-2"></div>
          <p>Loading settings...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          {/* Company Address */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              Company Address
            </label>
            <textarea
              value={companyAddress}
              onChange={e => setCompanyAddress(e.target.value)}
              placeholder="Enter full company address (e.g. 123, Main Road, City, State - PIN)"
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Displayed in the invoice header below MANISH INFRATECH</p>
          </div>

          {/* Bank Name */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              Bank Name
            </label>
            <input
              type="text"
              value={bankName}
              onChange={e => setBankName(e.target.value)}
              placeholder="e.g. State Bank of India"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            />
          </div>

          {/* Account Number */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              Account Number
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={e => setAccountNumber(e.target.value)}
              placeholder="e.g. 1234567890123"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            />
          </div>

          {/* IFSC Code */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              IFSC Code
            </label>
            <input
              type="text"
              value={ifscCode}
              onChange={e => setIfscCode(e.target.value)}
              placeholder="e.g. SBIN0001234"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            />
          </div>

          {/* PAN Number */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              PAN Number
            </label>
            <input
              type="text"
              value={panNumber}
              onChange={e => setPanNumber(e.target.value)}
              placeholder="e.g. ABCDE1234F"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            />
          </div>

          {/* GSTIN */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              GSTIN (Company GST Number)
            </label>
            <input
              type="text"
              value={gstin}
              onChange={e => setGstin(e.target.value)}
              placeholder="e.g. 27ABCDE1234F1Z5"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">This is MANISH INFRATECH's own GST number (shown in the bank details box on invoices)</p>
          </div>

          {/* Messages */}
          {successMsg && (
            <div className="bg-green-50 border border-green-300 text-green-800 rounded-lg px-4 py-3 font-medium text-sm flex items-center gap-2">
              <span className="text-green-600 text-lg">✓</span>
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="bg-red-50 border border-red-300 text-red-800 rounded-lg px-4 py-3 font-medium text-sm">
              {errorMsg}
            </div>
          )}

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={saveSettingsMutation.isPending}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors text-base"
            >
              {saveSettingsMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Saving...
                </span>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </form>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <div className="font-bold mb-1">📋 How these settings are used on invoices:</div>
        <ul className="space-y-1 text-xs list-disc list-inside text-blue-700">
          <li><strong>Company Address</strong> — shown in the invoice header below MANISH INFRATECH</li>
          <li><strong>Bank Name, Account No., IFSC Code</strong> — shown in the bottom-left box of the invoice</li>
          <li><strong>PAN Number &amp; GSTIN</strong> — shown in the bottom-left box of the invoice</li>
          <li>All settings are stored securely and sync across all devices automatically</li>
        </ul>
      </div>
    </div>
  );
}
