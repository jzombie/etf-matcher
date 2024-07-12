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

const createData = (key, size, age, last_accessed, access_count) => {
  return { key, size, age, last_accessed, access_count };
};

const rows = [
  createData("/data/symbol_etf_holders.43.enc", 78092, 804727, 437279, 6),
  createData("/data/symbol_etf_holders.80.enc", 90309, 935205, 70073, 14),
  createData("/data/symbol_detail.0.enc", 56688, 851639, 849858, 3),
  createData("/data/symbol_etf_holders.34.enc", 88635, 686272, 686267, 2),
  createData("/data/symbol_etf_holders.42.enc", 81993, 64642, 64639, 2),
  // Add other rows here...
];

const headCells = [
  { id: "key", label: "Key" },
  { id: "size", label: "Size" },
  { id: "age", label: "Age" },
  { id: "last_accessed", label: "Last Accessed" },
  { id: "access_count", label: "Access Count" },
];

const EnhancedTableHead = ({ order, orderBy, onRequestSort }) => {
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell key={headCell.id}>
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

export default function SortableTable() {
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("key");

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const stableSort = (array, comparator) => {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  };

  const getComparator = (order, orderBy) => {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const descendingComparator = (a, b, orderBy) => {
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
      <Table>
        <EnhancedTableHead
          order={order}
          orderBy={orderBy}
          onRequestSort={handleRequestSort}
        />
        <TableBody>
          {stableSort(rows, getComparator(order, orderBy)).map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.key}</TableCell>
              <TableCell>{row.size}</TableCell>
              <TableCell>{row.age}</TableCell>
              <TableCell>{row.last_accessed}</TableCell>
              <TableCell>{row.access_count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
