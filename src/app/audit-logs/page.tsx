"use client";

import {
  Box,
  Typography,
  TextField,
  CircularProgress,
  Stack,
  Button,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarExport,
  GridSortModel,
  GridPaginationModel,
} from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { saveAs } from "file-saver";

// Audit log type
interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  itemType: string;
  itemName: string;
  createdAt: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [filterUser, setFilterUser] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 5,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: "createdAt", sort: "desc" },
  ]);

  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: (paginationModel.page + 1).toString(), // API expects 1-based
          user: filterUser,
          action: filterAction,
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

    if (isLoaded && isSignedIn) fetchLogs();
  }, [paginationModel, filterUser, filterAction, isLoaded, isSignedIn]);

  const handleExportCSV = () => {
    const csv = [
      ["Time", "User", "Action", "Type", "Item Name"],
      ...logs.map((log) => [
        new Date(log.createdAt).toLocaleString(),
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
    {
      field: "createdAt",
      headerName: "Time",
      width: 180,
      valueFormatter: ({ value }) => new Date(value).toLocaleString(),
    },
    { field: "userName", headerName: "User", width: 160 },
    { field: "action", headerName: "Action", flex: 1 },
    { field: "itemType", headerName: "Type", width: 120 },
    { field: "itemName", headerName: "Item Name", flex: 1.5 },
  ];

  const CustomToolbar = () => (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarExport csvOptions={{ disableToolbarButton: true }} />
      <Button onClick={handleExportCSV}>Export CSV</Button>
    </GridToolbarContainer>
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        🧾 Audit Logs
      </Typography>

      <Stack direction="row" spacing={2} my={2} flexWrap="wrap">
        <TextField
          size="small"
          label="Filter by User"
          value={filterUser}
          onChange={(e) => {
            setPaginationModel((prev) => ({ ...prev, page: 0 }));
            setFilterUser(e.target.value);
          }}
        />
        <TextField
          size="small"
          label="Filter by Action"
          value={filterAction}
          onChange={(e) => {
            setPaginationModel((prev) => ({ ...prev, page: 0 }));
            setFilterAction(e.target.value);
          }}
        />
      </Stack>

      {isLoading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <DataGrid
          rows={logs}
          columns={columns}
          rowCount={total}
          pagination
          paginationMode="server"
          sortingMode="client"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25, 50]}
          autoHeight
          disableRowSelectionOnClick
          getRowId={(row) => row.id}
          slots={{ toolbar: CustomToolbar }}
          sortModel={sortModel}
          onSortModelChange={setSortModel}
        />
      )}
    </Box>
  );
}
