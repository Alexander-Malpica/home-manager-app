import { Dialog, DialogTitle, DialogContent, Typography } from "@mui/material";

interface HouseholdModalProps {
  open: boolean;
  onClose: () => void;
}

export default function HouseholdModal({ open, onClose }: HouseholdModalProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Household Settings</DialogTitle>
      <DialogContent sx={{ minWidth: 300 }}>
        <Typography>This is your household settings modal.</Typography>
        {/* Add your form or content here */}
      </DialogContent>
    </Dialog>
  );
}
