import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
} from "@mui/material";
import { styled } from "@mui/system";

// Define the data type
interface Data {
  key: string;
  size: number;
  age: number;
  last_accessed: number;
  access_count: number;
}

// Define the head cell type
interface HeadCell {
  id: keyof Data;
  label: string;
}

// Combined data and head cells in a single object
const tableData = {
  rows: [
    {
      key: "/data/symbol_etf_holders.43.enc",
      size: 78092,
      age: 804727,
      last_accessed: 437279,
      access_count: 6,
    },
    {
      key: "/data/symbol_etf_holders.80.enc",
      size: 90309,
      age: 935205,
      last_accessed: 70073,
      access_count: 14,
    },
    {
      key: "/data/symbol_detail.0.enc",
      size: 56688,
      age: 851639,
      last_accessed: 849858,
      access_count: 3,
    },
    {
      key: "/data/symbol_etf_holders.34.enc",
      size: 88635,
      age: 686272,
      last_accessed: 686267,
      access_count: 2,
    },
    {
      key: "/data/symbol_etf_holders.42.enc",
      size: 81993,
      age: 64642,
      last_accessed: 64639,
      access_count: 2,
    },
    // Add other rows here...
  ],
  headCells: [
    { id: "key", label: "Key" },
    { id: "size", label: "Size" },
    { id: "age", label: "Age" },
    { id: "last_accessed", label: "Last Accessed" },
    { id: "access_count", label: "Access Count" },
  ] as HeadCell[],
};

// Styled components
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: "4px 8px",
  fontSize: "0.75rem",
  borderBottom: "1px solid rgba(224, 224, 224, 1)",
  color: "cyan",
  "&.numeric": {
    color: "#aeadd6", // Bright fluorescent purple
  },
}));

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  fontWeight: "bold",
  padding: "4px 8px",
  fontSize: "0.75rem",
  borderBottom: "2px solid rgba(224, 224, 224, 1)",
  color: "white",
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: "#0e0e0e",
  },
  "&:nth-of-type(even)": {
    backgroundColor: "#1e1e1e",
  },
  "&:hover": {
    backgroundColor: "#333",
  },
}));

// Enhanced table head component props type
interface EnhancedTableHeadProps {
  order: "asc" | "desc";
  orderBy: keyof Data;
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof Data
  ) => void;
  headCells: HeadCell[];
}

// Enhanced table head component
const EnhancedTableHead: React.FC<EnhancedTableHeadProps> = ({
  order,
  orderBy,
  onRequestSort,
  headCells,
}) => {
  const createSortHandler =
    (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <StyledTableHeadCell key={headCell.id} align="left">
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
              style={{ color: "white" }}
            >
              {headCell.label}
            </TableSortLabel>
          </StyledTableHeadCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

// Main sortable table component
const SortableTable: React.FC = () => {
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<keyof Data>("key");

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof Data
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const stableSort = (
    array: Data[],
    comparator: (a: Data, b: Data) => number
  ) => {
    const stabilizedThis = array.map(
      (el, index) => [el, index] as [Data, number]
    );
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  };

  const getComparator = (order: "asc" | "desc", orderBy: keyof Data) => {
    return order === "desc"
      ? (a: Data, b: Data) => descendingComparator(a, b, orderBy)
      : (a: Data, b: Data) => -descendingComparator(a, b, orderBy);
  };

  const descendingComparator = (a: Data, b: Data, orderBy: keyof Data) => {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  };

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <EnhancedTableHead
          order={order}
          orderBy={orderBy}
          onRequestSort={handleRequestSort}
          headCells={tableData.headCells}
        />
        <TableBody>
          {stableSort(tableData.rows, getComparator(order, orderBy)).map(
            (row, index) => (
              <StyledTableRow key={index}>
                {tableData.headCells.map((headCell) => (
                  <StyledTableCell
                    key={headCell.id}
                    className={
                      typeof row[headCell.id] === "number" ? "numeric" : ""
                    }
                  >
                    {row[headCell.id]}
                  </StyledTableCell>
                ))}
              </StyledTableRow>
            )
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SortableTable;
