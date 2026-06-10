import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface RejectModalProps {
  open: boolean;
  doctorName: string;
  phase: 1 | 2;
  onConfirm: (reason: string) => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const RejectModal = ({
  open,
  doctorName,
  phase,
  onConfirm,
  onCancel,
  loading = false,
}: RejectModalProps) => {
  const [reason, setReason] = useState('');

  // Clear reason when modal opens/closes
  useEffect(() => {
    if (open) {
      setReason('');
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onConfirm(reason);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="rounded-2xl border border-zinc-200 bg-white max-w-[90vw] sm:max-w-md p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-zinc-900">
              Reject Dr. {doctorName}?
            </DialogTitle>
            <DialogDescription className="text-zinc-500 text-sm font-medium mt-1">
              Phase {phase} rejection — {phase === 1 ? 'Basic account review' : 'Credential verification'}
            </DialogDescription>
          </DialogHeader>

          <textarea
            rows={4}
            className="w-full p-3 border border-zinc-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white text-zinc-800 placeholder-zinc-400"
            placeholder={
              phase === 1
                ? 'e.g. Unable to verify your identity. Please re-register with correct details.'
                : 'e.g. License number is invalid. Please correct and re-submit.'
            }
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={loading}
            required
          />

          <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="w-full sm:flex-1 rounded-xl border-zinc-200 text-zinc-600 hover:bg-zinc-50 font-bold h-10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !reason.trim()}
              className="w-full sm:flex-1 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl font-bold h-10"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Rejecting...
                </>
              ) : (
                'Confirm Rejection'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
