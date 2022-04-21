import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import { UIPrimaryButton, useSuccessNotification } from "@src/../../packages/ui/src";
import AddIcon from "@mui/icons-material/Add";
import React, { useState } from "react";
import { makeStyles } from "@mui/styles";
import AddSecretaryModal from "./AddSecretaryModal";
import { gql } from "@apollo/client";
import * as GoGQL from "@gogocode-package/graphql_code_generator";
import { useGet_SecretariesQuery } from "@src/../../packages/graphql_code_generator/src";
import { StyledTableCell } from "@src/components/dashboard/StyledTableComponents";
import { DeleteOutlined } from "@mui/icons-material";

export const GET_SECRETARIES = gql`
  query get_secretaries {
    get_secretaries {
      id
      provider_id
      User {
        first_name
        email
      }
    }
  }
`;

const DELETE_SECRETARY = gql`
  mutation delete_secretaries($secretary_id: Float!) {
    delete_secretaries(secretary_id: $secretary_id)
  }
`;

const SecretaryDetails = () => {
  const styles = useStyles();
  const theme = useTheme();
  const [isopen, setIsopen] = useState<boolean>(false);
  const { data, loading, error } = useGet_SecretariesQuery(GET_SECRETARIES);
  const [deleteSecretary, setDeleteSecretary] = useState<string>("");

  const [deleteSecretariesRequest, deleteSecretariesResponse] = GoGQL.useDelete_SecretariesMutation(DELETE_SECRETARY, {
    refetchQueries: [
      {
        query: GET_SECRETARIES,
      },
    ],
    fetchPolicy: "no-cache",
  });
  useSuccessNotification([deleteSecretariesResponse?.data?.delete_secretaries]);

  const onDelete = (id: string) => {
    deleteSecretariesRequest({
      variables: {
        secretary_id: Number(id),
      },
    });
  };

  return (
    <>
      <Paper className={styles.paper} style={{ padding: "1%" }}>
        <Typography variant="h5" color={theme.palette.primary.main} style={{ margin: "1%" }}>
          Secretary List
        </Typography>
        <TableContainer
          style={{
            borderRadius: 10,
            marginTop: 30,
            width: "100%",
          }}
          component={Paper}
        >
          <Table aria-label="simple table">
            {data?.get_secretaries?.length > 0 && (
              <TableHead>
                <TableRow style={{ backgroundColor: theme.palette.primary.main }}>
                  <StyledTableCell style={{ minWidth: "20%", fontSize: 18, fontWeight: 600, color: "white" }}>
                    Name
                  </StyledTableCell>
                  <StyledTableCell
                    align="center"
                    style={{ minWidth: "20%", fontSize: 18, fontWeight: 600, color: "white" }}
                  >
                    Email Id
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: "5%", fontSize: 18, fontWeight: 600, color: "white" }}>
                    Action
                  </StyledTableCell>
                </TableRow>
              </TableHead>
            )}
            <TableBody>
              {data?.get_secretaries?.map((secretary, index) => {
                return (
                  <>
                    <TableRow key={index}>
                      <StyledTableCell component="th">{secretary?.User?.first_name}</StyledTableCell>
                      <StyledTableCell align="center">{secretary?.User?.email}</StyledTableCell>
                      <StyledTableCell align="center">
                        {
                          <IconButton
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              setDeleteSecretary(secretary?.id);
                              onDelete(secretary?.id);
                            }}
                          >
                            <DeleteOutlined htmlColor={theme.palette.primary.main} />
                          </IconButton>
                        }
                      </StyledTableCell>
                    </TableRow>
                  </>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        {data?.get_secretaries?.length == 0 && (
          <Typography style={{ textAlign: "center" }}>No secretaries found</Typography>
        )}
        <div style={{ display: "flex", justifyContent: "center", marginTop: "2%" }}>
          <UIPrimaryButton
            onClick={() => {
              setIsopen(true);
            }}
          >
            <AddIcon />
            Add
          </UIPrimaryButton>
        </div>
      </Paper>
      <AddSecretaryModal
        isOpen={isopen}
        onClose={() => {
          setIsopen(false);
        }}
      />
    </>
  );
};

const useStyles = makeStyles({
  paper: {
    justifySelf: "center",
    margin: "5%",
    width: "90%",
    borderRadius: 5,
    border: "1px solid #E0E0E0",
  },
});

export default SecretaryDetails;
