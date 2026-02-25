import React, { useState } from 'react';
import { useSavePartyAddress, useSavePartyGstNumber } from '../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface AddPartyModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddPartyModal({ open, onClose }: AddPartyModalProps) {
  const [partyName, setPartyName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const saveGstMutation = useSavePartyGstNumber();
  const saveAddressMutation = useSavePartyAddress();

  const isPending = saveGstMutation.isPending || saveAddressMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!partyName.trim()) {
      setError('Party name is required');
      return;
    }

    try {
      if (gstNumber.trim()) {
        await saveGstMutation.mutateAsync({ partyName: partyName.trim(), gstNumber: gstNumber.trim() });
      }
      if (address.trim()) {
        await saveAddressMutation.mutateAsync({ partyName: partyName.trim(), address: address.trim() });
      }
      if (!gstNumber.trim() && !address.trim()) {
        // Save with empty values to create the party profile
        await saveAddressMutation.mutateAsync({ partyName: partyName.trim(), address: '' });
      }
      setSuccess(`Party "${partyName}" added successfully!`);
      setTimeout(() => {
        setPartyName('');
        setGstNumber('');
        setAddress('');
        setSuccess('');
        onClose();
      }, 1200);
    } catch (err: any) {
      setError('Failed to add party. Please try again.');
    }
  };

  const handleClose = () => {
    setPartyName('');
    setGstNumber('');
    setAddress('');
    setError('');
    setSuccess('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Add New Party</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Party Name *</label>
            <input
              type="text"
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              placeholder="Enter party / company name"
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
            <input
              type="text"
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value)}
              placeholder="e.g. 27AABCU9603R1ZX"
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Party address"
              rows={3}
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-3 py-2 rounded">
              {success}
            </div>
          )}

          <DialogFooter>
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-brand-red hover:bg-red-700 text-white font-semibold rounded transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {isPending && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
              {isPending ? 'Saving...' : 'Add Party'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
