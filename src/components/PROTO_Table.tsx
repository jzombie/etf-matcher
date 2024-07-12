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

// Function to create data
const createData = (
  key: string,
  size: number,
  age: number,
  last_accessed: number,
  access_count: number
): Data => {
  return { key, size, age, last_accessed, access_count };
};

// Sample data
const rows: Data[] = [
  createData("/data/symbol_etf_holders.43.enc", 78092, 804727, 437279, 6),
  createData("/data/symbol_etf_holders.80.enc", 90309, 935205, 70073, 14),
  createData("/data/symbol_detail.0.enc", 56688, 851639, 849858, 3),
  createData("/data/symbol_etf_holders.34.enc", 88635, 686272, 686267, 2),
  createData("/data/symbol_etf_holders.42.enc", 81993, 64642, 64639, 2),
  // Add other rows here...
];

// Define the head cell type
interface HeadCell {
  id: keyof Data;
  label: string;
}

// Head cells definition
const headCells: HeadCell[] = [
  { id: "key", label: "Key" },
  { id: "size", label: "Size" },
  { id: "age", label: "Age" },
  { id: "last_accessed", label: "Last Accessed" },
  { id: "access_count", label: "Access Count" },
];

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
}

// Enhanced table head component
const EnhancedTableHead: React.FC<EnhancedTableHeadProps> = ({
  order,
  orderBy,
  onRequestSort,
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
        />
        <TableBody>
          {stableSort(rows, getComparator(order, orderBy)).map((row, index) => (
            <StyledTableRow key={index}>
              <StyledTableCell>{row.key}</StyledTableCell>
              <StyledTableCell className="numeric">{row.size}</StyledTableCell>
              <StyledTableCell className="numeric">{row.age}</StyledTableCell>
              <StyledTableCell className="numeric">
                {row.last_accessed}
              </StyledTableCell>
              <StyledTableCell className="numeric">
                {row.access_count}
              </StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SortableTable;
