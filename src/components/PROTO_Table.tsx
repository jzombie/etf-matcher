import React, { useMemo, useState } from "react";
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

import { RustServiceCacheDetail } from "@src/store";
import useStoreStateReader from "@hooks/useStoreStateReader";

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

// Main sortable table component
const SortableTable: React.FC = () => {
  const { cacheDetails: rows } = useStoreStateReader("cacheDetails");

  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<keyof RustServiceCacheDetail>("key");

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof RustServiceCacheDetail
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const stableSort = (
    array: RustServiceCacheDetail[],
    comparator: (a: RustServiceCacheDetail, b: RustServiceCacheDetail) => number
  ) => {
    const stabilizedThis = array.map(
      (el, index) => [el, index] as [RustServiceCacheDetail, number]
    );
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  };

  const getComparator = (
    order: "asc" | "desc",
    orderBy: keyof RustServiceCacheDetail
  ) => {
    return order === "desc"
      ? (a: RustServiceCacheDetail, b: RustServiceCacheDetail) =>
          descendingComparator(a, b, orderBy)
      : (a: RustServiceCacheDetail, b: RustServiceCacheDetail) =>
          -descendingComparator(a, b, orderBy);
  };

  const descendingComparator = (
    a: RustServiceCacheDetail,
    b: RustServiceCacheDetail,
    orderBy: keyof RustServiceCacheDetail
  ) => {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  };

  // Dynamically generate head cells based on the keys of the first object
  const headCells: { id: keyof RustServiceCacheDetail; label: string }[] =
    useMemo(
      () =>
        rows.length > 0
          ? Object.keys(rows[0]).map((key) => ({
              id: key as keyof RustServiceCacheDetail,
              label: key
                .replace(/_/g, " ")
                .replace(/\b\w/g, (char) => char.toUpperCase()),
            }))
          : [],
      [rows]
    );

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {headCells.map((headCell) => (
              <StyledTableHeadCell key={headCell.id} align="left">
                <TableSortLabel
                  active={orderBy === headCell.id}
                  direction={orderBy === headCell.id ? order : "asc"}
                  onClick={(event) => handleRequestSort(event, headCell.id)}
                  style={{ color: "white" }}
                >
                  {headCell.label}
                </TableSortLabel>
              </StyledTableHeadCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {stableSort(rows, getComparator(order, orderBy)).map((row, index) => (
            <StyledTableRow key={index}>
              {headCells.map((headCell) => (
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
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SortableTable;
