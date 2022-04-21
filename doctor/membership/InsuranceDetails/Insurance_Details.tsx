import { Paper, Typography, Autocomplete, Button, useTheme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { useEffect, useState } from "react";
import { ComponentWithLoader, UITextField, useErrorNotification, useSnackbar } from "@gogocode-package/ui-web";
import { gql } from "@apollo/client";
import * as GoGQL from "@gogocode-package/graphql_code_generator";
import { GetUpdateStatus, GET_UPDATE_STATUS } from "../GetUpdateStatus";
import { DOCTOR_MEMBERSHIP_UPDATE_SUCCESS_MSG, PENDING_STATUS_TEXT } from "@src/../../Constants";

const FETCH_APPLIED_INSURANCES = gql`
  query view_doctor_membership_info($includes: [ViewDoctorIncludesEnum!]!) {
    view_doctor_membership_info(includes: $includes) {
      id
      ProviderInsurances {
        name
      }
    }
  }
`;

const FETCH_INSURANCES = gql`
  query get_master_data($type: MasterType!) {
    get_master_data(type: $type) {
      label
      value
    }
  }
`;

const UPDATE_INSURANCES = gql`
  mutation update_doctor_membership_info_insurances($input: [ProviderInsuranceInput!]!, $operation: DBOperation!) {
    update_doctor_membership_info_insurances(input: $input, operation: $operation)
  }
`;

const InsuranceDetails = () => {
  const styles = useStyles();
  const theme = useTheme();
  const { data } = GoGQL.useGet_Master_DataQuery(FETCH_INSURANCES, {
    variables: {
      type: GoGQL.MasterType.Insurance,
    },
  });
  const appliedInsurances = GoGQL.useView_Doctor_Membership_InfoQuery(FETCH_APPLIED_INSURANCES, {
    variables: {
      includes: [GoGQL.ViewDoctorIncludesEnum.Insurance],
    },
    fetchPolicy: "no-cache",
  });
  const [selectedInsurances, setSelectedInsurances] = useState<GoGQL.MasterTableResponse[]>([]);
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [remainingOptions, setRemainingOptions] = useState([]);
  const [updateInsuranceRequest, updateInsuranceResponse] = GoGQL.useUpdate_Doctor_Membership_Info_InsurancesMutation(
    UPDATE_INSURANCES,
    {
      refetchQueries: [
        {
          query: GET_UPDATE_STATUS,
          variables: {
            section: GoGQL.ViewDoctorIncludesEnum.Insurance,
          },
        },
      ],
    }
  );
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (data && data?.get_master_data) {
      findRemainingOptions(selectedInsurances);
    }
  }, [data, selectedInsurances]);

  function findRemainingOptions(confirmedInsurances: GoGQL.MasterTableResponse[]) {
    if (confirmedInsurances.length === 0) {
      setRemainingOptions(data?.get_master_data);
    }
    setRemainingOptions(
      data?.get_master_data?.filter((insurance) => {
        if (
          !confirmedInsurances.some((selectedIns: GoGQL.MasterTableResponse) => selectedIns.label == insurance.label)
        ) {
          return insurance;
        }
      })
    );
  }

  useEffect(() => {
    if (updateInsuranceResponse?.data?.update_doctor_membership_info_insurances) {
      enqueueSnackbar(DOCTOR_MEMBERSHIP_UPDATE_SUCCESS_MSG, { variant: "success" });
    }
    // if (updateInsuranceResponse?.error) {
    //   enqueueSnackbar(updateInsuranceResponse?.error?.message, { variant: "error" });
    // }
  }, [updateInsuranceResponse?.data]);

  useErrorNotification([updateInsuranceResponse?.error]);

  useEffect(() => {
    if (appliedInsurances?.data)
      setSelectedInsurances(
        appliedInsurances?.data?.view_doctor_membership_info?.ProviderInsurances?.map((item) => {
          return { label: item?.name, value: item?.name };
        })
      );
  }, [appliedInsurances?.data]);

  return (
    <div style={{ justifyContent: "center", width: "92%" }}>
      <Paper className={styles.paper}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Typography variant="h5" color={theme.palette.primary.main} style={{ margin: "1%" }}>
            Insurance Accepted
          </Typography>
          <GetUpdateStatus pendingStatusText={PENDING_STATUS_TEXT} section={GoGQL.ViewDoctorIncludesEnum.Insurance} />
        </div>
        <ComponentWithLoader loading={appliedInsurances?.loading}>
          <Autocomplete
            disablePortal
            multiple
            filterSelectedOptions
            value={selectedInsurances}
            ListboxProps={{ style: { maxHeight: "15rem" } }}
            style={{ margin: "1%", width: "98%" }}
            id="insurance-accepted-auto-complete"
            options={remainingOptions || []}
            onChange={(_, newValues: { label: string; value: string }[]) => {
              setSelectedInsurances(newValues);
              findRemainingOptions(newValues);
              setButtonDisabled(false);
            }}
            renderInput={(params) => (
              <UITextField {...params} size="medium" label="Insurances" className={styles.textfield} />
            )}
          />
        </ComponentWithLoader>
        <Button
          disabled={(selectedInsurances.length != 0 && buttonDisabled) || appliedInsurances?.loading}
          variant="contained"
          style={{ display: "block", margin: "1% auto" }}
          onClick={() => {
            const selected = selectedInsurances.map((item) => ({ name: item.value }));
            updateInsuranceRequest({ variables: { input: selected, operation: GoGQL.DbOperation.Edit } });
            setButtonDisabled(true);
          }}
        >
          Save
        </Button>
      </Paper>
    </div>
  );
};

const useStyles = makeStyles(() => ({
  paper: {
    // elevation: 2,
    justifySelf: "center",
    margin: "5%",
    width: "100%",
    borderRadius: 5,
    border: "1px solid #E0E0E0",
  },
  textfield: {},
}));

export default InsuranceDetails;
