// import {
//   ProviderLicense,
//   useFetch_StatesQuery,
//   useUpdate_Doctor_Membership_Info_LicensesMutation,
//   ViewDoctorIncludesEnum,
// } from "@gogocode-package/graphql_code_generator";
import * as GoGQL from "@gogocode-package/graphql_code_generator";
import { UIModel, UIPrimaryButton, UITextField, useErrorNotification, useSnackbar } from "@gogocode-package/ui-web";
import { DatePicker, LocalizationProvider, MobileDatePicker } from "@mui/lab";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import { Autocomplete, Button, Grid, TextField, Typography, useTheme } from "@mui/material";
import { emptyCheck } from "@src/utils";
import { gql } from "@apollo/client";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { FETCH_LICENSES_DETAILS, UPDATE_LICENSES } from "./Licenses";
import { DOCTOR_MEMBERSHIP_UPDATE_SUCCESS_MSG } from "@src/../../Constants";
import { GET_UPDATE_STATUS } from "../GetUpdateStatus";

type Props = {
  isOpen: boolean;
  onClose?: () => void;
  type: "Add" | "Edit";
  licenses: GoGQL.ProviderLicense[];
  currentLicense: GoGQL.ProviderLicense;
};

const FETCH_STATES = gql`
  query fech_states($state: String) {
    fetch_states(state: $state) {
      state_name
      state_id
    }
  }
`;

const MedicalLicenseModal = (props: Props) => {
  const theme = useTheme();
  const { isOpen, onClose, type, licenses, currentLicense } = props;
  const [state, setState] = useState<string>("");
  const [licenseNo, setLicenseNo] = useState<string>();
  const [year, setYear] = useState<Date>(null);
  const [error, setError] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const StateResponse = GoGQL.useFetch_StatesQuery(FETCH_STATES, {
    variables: {
      state,
    },
  });

  const [updateLicensesRequest, updateLicensesResponse] = GoGQL.useUpdate_Doctor_Membership_Info_LicensesMutation(
    UPDATE_LICENSES,
    {
      refetchQueries: [
        {
          query: FETCH_LICENSES_DETAILS,
          variables: {
            includes: [GoGQL.ViewDoctorIncludesEnum.License],
          },
        },
        {
          query: GET_UPDATE_STATUS,
          variables: {
            section: GoGQL.ViewDoctorIncludesEnum.License,
          },
        },
      ],
    }
  );

  useEffect(() => {
    if (props?.currentLicense) {
      setState(currentLicense?.state);
      setLicenseNo(String(currentLicense?.license_no || ""));
      setYear(new Date(currentLicense?.year));
    }
  }, [props?.currentLicense]);

  const resetFields = () => {
    setState("");
    setLicenseNo("");
    setYear(null);
  };
  const isValid = () => {
    const error_msg = emptyCheck([
      { name: "State", value: state },
      { name: "License No", value: licenseNo },
      { name: "Year ", value: year },
    ]);
    if (error_msg.length >= 2) {
      enqueueSnackbar("Fields should not be empty", { variant: "error" });
      return false;
    } else if (error_msg.length > 0) {
      error_msg.map((error) => {
        enqueueSnackbar(error, { variant: "error" });
      });
      return false;
    } else return true;
  };

  const addRequest = () => {
    let filteredLicenses = [];
    if (licenses.length > 0) {
      filteredLicenses = licenses.map((license) => _.omit(license, ["id", "__typename"]));
    }
    filteredLicenses.push({
      license_no: licenseNo,
      state,
      year: String(year.getFullYear()),
    });
    return filteredLicenses;
  };

  const editRequest = () => {
    return licenses?.map((license) => {
      let value;
      if (license?.id == currentLicense?.id) {
        value = {
          license_no: licenseNo,
          state,
          year: String(year.getFullYear()),
        };
      } else {
        value = _.omit(license, ["id", "__typename"]);
      }
      return value;
    });
  };

  const onSave = async () => {
    if (isValid() && !error) {
      // let data;
      // if (type == "Add") {
      //   data = addRequest();
      // } else if (type == "Edit") {
      //   data = editRequest();
      // }
      let data = {
        license_no: licenseNo,
        state,
        year: String(year.getFullYear()),
      };
      const response = await updateLicensesRequest({
        variables: {
          input: data,
          operation: props?.type == "Add" ? GoGQL.DbOperation.Add : GoGQL.DbOperation.Edit,
          row_id: props?.type == "Add" ? null : Number(props?.currentLicense?.id),
        },
      });
      if (response?.data?.update_doctor_membership_info_licenses) {
        enqueueSnackbar(DOCTOR_MEMBERSHIP_UPDATE_SUCCESS_MSG, { variant: "success" });
      }
      resetFields();
      onClose();
    }
  };

  useErrorNotification([updateLicensesResponse?.error]);

  const isValidInput = (value: string, length: number) => {
    if (String(value).length > length) {
      // enqueueSnackbar(`Input is too larger than ${length}`, { variant: "error" });
      return false;
    }
    return true;
  };
  return (
    <UIModel
      isOpen={isOpen}
      disableEscapeKeyDown
      hideCancel
      onClose={(event, reason) => {
        if (reason !== "backdropClick") {
          resetFields();
          props.onClose();
        }
      }}
      maxWidth="lg"
      style={{}}
      action={
        <UIPrimaryButton
          variant="contained"
          style={{ display: "flex", justifySelf: "center", margin: 10 }}
          onClick={onSave}
          loading={updateLicensesResponse?.loading}
          disabled={error}
        >
          Save
        </UIPrimaryButton>
      }
      title={`${type || ""} Certification`}
      titleStyle={{ color: theme.palette.primary.main }}
    >
      <div style={{ width: "80%", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography>State </Typography>
          <Grid xs={6}>
            <Autocomplete
              disablePortal
              style={{ backgroundColor: "white" }}
              id="state"
              value={state}
              options={
                StateResponse?.data?.fetch_states.map((item) => ({
                  label: item.state_name,
                  id: item.state_id,
                })) || []
              }
              onInputChange={(_, stateValue) => {
                setState(stateValue);
              }}
              sx={{ width: "100%" }}
              renderInput={(params) => (
                <UITextField
                  required
                  onChange={() => {}}
                  {...params} //label="State"
                />
              )}
            />
          </Grid>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography>License No.</Typography>
          <Grid xs={6}>
            <UITextField
              fullWidth
              label="License No."
              id={"license"}
              // className={classes.textfield}
              value={licenseNo}
              onChange={(event) => {
                !isNaN(Number(event.target.value)) &&
                  isValidInput(event.target.value, 15) &&
                  setLicenseNo(event.target.value);
              }}
              required
            />
          </Grid>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography>Year</Typography>

          <Grid xs={6} style={{ marginTop: "1%" }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <MobileDatePicker
                disableFuture
                views={["year"]}
                label="Year Licensed"
                value={year}
                okText=""
                disableCloseOnSelect={false}
                onError={(error) => setError(error)}
                onChange={(value) => {
                  setYear(value);
                }}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
        </div>
      </div>
    </UIModel>
  );
};

export default MedicalLicenseModal;
