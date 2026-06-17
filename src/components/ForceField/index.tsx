import { debugLog } from '../../logger';
import React from "react";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { IconButton } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import FolderCopyIcon from "@mui/icons-material/FolderCopy";

import { Container, Typography } from "@material-ui/core";
import { Marger /*notifyError*/ } from "../../helpers";
import { SERVER_ROOT } from "../../constants";
import Settings from "../../Settings";
import { ForceFieldMetadata } from "../../types/settings";

export default function ForceField() {
  debugLog(Settings.martinize_variables.force_fields_info);
  const ff_data = Object.entries(Settings.martinize_variables.force_fields_info)
    .filter((x) => {
      const [_, ffInfo] = x;
      return ffInfo.downloadable;
    })
    .map((x) => {
      const [ff, ff_info] = x;
      return [ff, ff_info?.metadata];
    });
  const vlib_data = Object.entries(
    Settings.martinize_variables.vermouth_libs_info,
  ).map((x) => {
    const [vlib, vlib_info] = x;
    return [vlib, vlib_info?.metadata];
  });

  return (
    <Container style={{ paddingTop: 10 }}>
      <Typography variant="h4" className="page-title">
        Martini force field parameters and extensions
      </Typography>

      <Marger size={14} />

      {ff_data && (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ minWidth: "15em" }}>
                  Force field parameters (.itp)
                </TableCell>
                <TableCell align="center">Files</TableCell>
                <TableCell align="center">Descriptions</TableCell>
                <TableCell align="center">Publications</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ff_data.map((row) => (
                <TableRow
                  key={row[0] as string}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row[0]}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      component="a"
                      href={
                        SERVER_ROOT + "api/force_fields/download?name=" + row[0]
                      }
                      download
                    >
                      <DownloadIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell align="left">
                    {row[1] && (row[1] as ForceFieldMetadata).comments}
                  </TableCell>
                  <TableCell align="center">
                    {row[1] && (
                      <a href={(row[1] as ForceFieldMetadata).cite}>
                        <span style={{ color: "#483D8B" }}> Cite </span>
                      </a>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {vlib_data && (
        <TableContainer component={Paper} style={{ marginTop: "0.5em" }}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ maxWidth: "10.5em" }}>
                  Force field extensions (.ff)
                </TableCell>
                <TableCell align="center"> </TableCell>
                <TableCell align="center"> </TableCell>
                <TableCell align="center"> </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vlib_data.map((row) => (
                <TableRow
                  key={row[0] as string}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row[0]}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      component="a"
                      href={
                        SERVER_ROOT + "api/force_fields/download?name=" + row[0]
                      }
                      download
                    >
                      <DownloadIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell align="left">
                    {row[1] && (row[1] as ForceFieldMetadata).comments}
                  </TableCell>
                  <TableCell align="left">
                    {row[1] && (
                      <a href={(row[1] as ForceFieldMetadata).cite}>
                        <span style={{ color: "#483D8B" }}> Cite </span>
                      </a>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/*!available && (
        <Box textAlign="center">
          <Marger size="3rem" />
          <CircularProgress size={56} />
        </Box>
      )
      */}
      <Marger size={10} />
      <List disablePadding>
        <ListItem disablePadding sx={{ pl: 0, color: "#483D8B" }}>
          <ListItemButton
            component="a"
            href="https://cgmartini.nl/docs/downloads/"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ pl: 0, alignItems: "center" }}
          >
            <ListItemIcon>
              <FolderCopyIcon sx={{ color: "#483D8B" }} />
            </ListItemIcon>
            <ListItemText primary="Get more files at the Martini Force Field Initiative" />
          </ListItemButton>
        </ListItem>
      </List>
    </Container>
  );
}
