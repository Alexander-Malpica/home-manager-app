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
        const params = new URLSearchParams({
          page: (page + 1).toString(),
        });

        const res = await fetch(`/api/audit-log?${params}`);
        const data = await res.json();

        if (Array.isArray(data.logs)) {
          setLogs(data.logs);
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

  const handleExportCSV = () => {
    const csv = [
      ["Time", "User", "Action", "Type", "Item Name"],
      ...filteredLogs.map((log) => [
        new Date(log.createdAt).toLocaleString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        log.userName,
        log.action,
        log.itemType,
        log.itemName,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "audit-logs.csv");
  };

  const columns: GridColDef[] = [
    // {
    //   field: "createdAt",
    //   headerName: "Time",
    //   width: 180,
    //   valueFormatter: ({ value }) => {
    //     console.log("createdAt raw value:", value);
    //     const date = new Date(String(value));
    //     return isNaN(date.getTime())
    //       ? "Invalid Date"
    //       : date.toLocaleString("en-US", {
    //           year: "numeric",
    //           month: "2-digit",
    //           day: "2-digit",
    //           hour: "2-digit",
    //           minute: "2-digit",
    //           second: "2-digit",
    //         });
    //   },
    // },
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
        <Typography variant="h6" fontWeight="bold" component="span">
          🧾 Audit Logs
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Stack direction="row" spacing={2} my={2} alignItems="center">
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
            sx={{ textWrap: "nowrap" }}
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
            pagination
            paginationMode="server"
            sortingMode="client"
            autoHeight
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
