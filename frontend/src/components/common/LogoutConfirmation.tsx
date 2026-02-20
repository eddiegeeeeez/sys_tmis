import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { LogOut } from 'lucide-react';

interface LogoutConfirmationProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const LogoutConfirmation: React.FC<LogoutConfirmationProps> = ({
    isOpen,
    onClose,
    onConfirm
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                        <LogOut className="h-5 w-5 text-zinc-500" />
                        Confirm Logout
                    </DialogTitle>
                    <DialogDescription className="pt-2 text-zinc-600 dark:text-zinc-400">
                        Are you sure you want to log out of TradeMatrix? You will need to sign in again to access the system.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="pt-4 flex sm:justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white">
                        Log Out
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
