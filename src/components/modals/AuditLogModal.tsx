"use client";

import {
  Box,
  Typography,
  TextField,
  CircularProgress,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridSortModel,
  GridToolbarColumnsButton,
  GridToolbarContainer,
} from "@mui/x-data-grid";
import { useEffect, useState, useMemo } from "react";
import { saveAs } from "file-saver";
import CloseIcon from "@mui/icons-material/Close";

interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  itemType: string;
  itemName: string;
  createdAt: string;
}

interface AuditLogsModalProps {
  open: boolean;
  onClose: () => void;
}

const toPascalCase = (input: string) =>
  input
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

export default function AuditLogsModal({ open, onClose }: AuditLogsModalProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: "createdAt", sort: "desc" },
  ]);

  useEffect(() => {
    if (!open) return;

    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/audit-log?page=${page + 1}`);
        const data = await res.json();

        if (Array.isArray(data.logs)) {
          const formattedLogs = data.logs.map((log: AuditLogEntry) => ({
            ...log,
            userName: toPascalCase(log.userName),
            itemType: toPascalCase(log.itemType),
          }));

          setLogs(formattedLogs);
          setTotal(data.total);
        }
      } catch (err) {
        console.error("Failed to fetch logs:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [open, page, pageSize]);

  const filteredLogs = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return logs.filter(
      (log) =>
        log.userName.toLowerCase().includes(term) ||
        log.action.toLowerCase().includes(term) ||
        log.itemType.toLowerCase().includes(term) ||
        log.itemName.toLowerCase().includes(term)
    );
  }, [logs, searchTerm]);

  const handleExportCSV = async () => {
    try {
      const res = await fetch("/api/audit-log?all=true");
      const data = await res.json();

      const escapeCSV = (value: string) => `"${value.replace(/"/g, '""')}"`;

      const csv = [
        ["User", "Action", "Type", "Item Name"],
        ...data.logs.map((log: AuditLogEntry) => [
          escapeCSV(toPascalCase(log.userName)),
          escapeCSV(log.action),
          escapeCSV(toPascalCase(log.itemType)),
          escapeCSV(log.itemName),
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, "audit-logs.csv");
    } catch (err) {
      console.error("Failed to download logs:", err);
    }
  };

  const columns: GridColDef[] = [
    { field: "userName", headerName: "User", width: 160 },
    { field: "action", headerName: "Action", flex: 1 },
    { field: "itemType", headerName: "Type", width: 120 },
    { field: "itemName", headerName: "Item Name", flex: 1.5 },
  ];

  const CustomToolbar = () => (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
    </GridToolbarContainer>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography component="span" variant="h6" fontWeight="bold">
          🧾 Audit Logs
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          my={2}
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          <TextField
            fullWidth
            size="small"
            label="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button
            onClick={handleExportCSV}
            variant="outlined"
            fullWidth
            sx={{ whiteSpace: "nowrap" }}
          >
            Download CSV
          </Button>
        </Stack>

        {isLoading ? (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={filteredLogs}
            columns={columns}
            rowCount={total}
            autoHeight
            pagination
            paginationMode="server"
            sortingMode="client"
            disableRowSelectionOnClick
            getRowId={(row) => row.id}
            paginationModel={{ page, pageSize }}
            onPaginationModelChange={(model) => {
              setPage(model.page);
              setPageSize(model.pageSize);
            }}
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            slots={{ toolbar: CustomToolbar }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
