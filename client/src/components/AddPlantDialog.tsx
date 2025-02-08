import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AddPlantDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AddPlantDialog({ open, onClose }: AddPlantDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Plant</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p className="text-sm text-muted-foreground">
            The “Add Plant” functionality is not yet implemented.
          </p>
          <Button onClick={onClose} className="mt-4">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
