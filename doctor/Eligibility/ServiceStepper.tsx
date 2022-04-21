import { gql } from "@apollo/client";
import {
  Autocomplete,
  IconButton,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import * as GoGQL from "@gogocode-package/graphql_code_generator";
import { StyledTableCell } from "@src/components/dashboard/StyledTableComponents";
import { DeleteOutlined } from "@mui/icons-material";
import * as PullState from "../../../DataPullState";
const FETCH_SERVICES = gql`
  query get_services($input: GetServicesInput!) {
    get_services(input: $input) {
      id
      description
      code
    }
  }
`;

const ServiceStepper = () => {
  const theme = useTheme();
  const services = PullState.ServiceStepperInputs.useState((s) => s.services);
  const [autoCompleteOpen, setAutoCompleteOpen] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [fetchServicesRequest, fetchServicesResponse] = GoGQL.useGet_ServicesLazyQuery(FETCH_SERVICES, {
    fetchPolicy: "network-only",
  });
  useEffect(() => {
    fetchServicesRequest({ variables: { input: { search_text: "" } } });
  }, []);

  useEffect(() => {
    console.log("services", services);
  }, [services]);
  const handleChange = (service) => {
    PullState.ServiceStepperInputs.update((s) => {
      s.services = [...s.services, service];
    });
  };
  return (
    <div>
      <div style={{ margin: "1% 0%" }}>
        <Autocomplete
          open={autoCompleteOpen}
          onOpen={() => {
            if (inputValue) {
              setAutoCompleteOpen(true);
            }
          }}
          onClose={() => setAutoCompleteOpen(false)}
          inputValue={inputValue}
          options={fetchServicesResponse?.data?.get_services || []}
          onInputChange={(_, value) => {
            setInputValue(value);
            setAutoCompleteOpen(true);
            if (!value) {
              setAutoCompleteOpen(false);
            }
            fetchServicesRequest({ variables: { input: { search_text: value } } });
          }}
          onChange={(_, value: GoGQL.Services) => {
            console.log("value", value);
            handleChange(value);
          }}
          renderInput={(params) => (
            <TextField {...params} label="Services" placeholder="Select Services" value={null} />
          )}
          getOptionLabel={(option) => `${option?.description}, ${option?.code}`}
          renderOption={(props, option) => {
            return (
              <li {...props}>
                {option?.description}, ({option?.code})
              </li>
            );
          }}
        />
      </div>
      {services?.length ? (
        <div style={{ margin: "1% 0%", height: 350, overflow: "scroll" }}>
          <TableContainer style={{ display: "flex", justifyContent: "center" }}>
            <Table sx={{ minWidth: "5%", maxWidth: "75%" }}>
              <TableHead style={{ backgroundColor: theme.palette.primary.main }}>
                <TableRow>
                  <StyledTableCell align="center" style={{ color: "white" }}>
                    Code
                  </StyledTableCell>
                  <StyledTableCell align="center" style={{ color: "white", minWidth: "80%" }}>
                    Description
                  </StyledTableCell>
                  <StyledTableCell align="center" style={{ color: "white" }}>
                    Action
                  </StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {services?.map((service) => (
                  <TableRow key={service?.id}>
                    <StyledTableCell align="center">{service?.code}</StyledTableCell>
                    <StyledTableCell align="center">{service?.description}</StyledTableCell>
                    <StyledTableCell align="center">
                      {
                        <IconButton
                          onClick={() => {
                            console.log("services", service.code);
                            PullState.ServiceStepperInputs.update((s) => {
                              s.services = s.services.filter((ser) => ser.id != service.id);
                            });
                          }}
                        >
                          <DeleteOutlined />
                        </IconButton>
                      }
                    </StyledTableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography>Select Services above</Typography>
        </div>
      )}
    </div>
  );
};

export default ServiceStepper;
