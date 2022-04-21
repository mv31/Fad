import { Paper, Typography, Autocomplete, Button, useTheme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { useEffect, useState } from "react";
import { ComponentWithLoader, UITextField, useSnackbar } from "@src/../../packages/ui/src";
import { gql } from "@apollo/client";
// import {
//   useView_Doctor_Membership_InfoQuery,
//   useUpdate_Doctor_Membership_Info_LanguagesMutation,
//   useGet_Master_DataQuery,
//   MasterType,
//   ViewDoctorIncludesEnum,
// } from "@gogocode-package/graphql_code_generator";
import * as GoGQL from "@gogocode-package/graphql_code_generator";
import { DOCTOR_MEMBERSHIP_UPDATE_SUCCESS_MSG, PENDING_STATUS_TEXT } from "@src/../../Constants";
import { GetUpdateStatus, GET_UPDATE_STATUS } from "../GetUpdateStatus";

type Type = "DOCTOR" | "STAFF";
interface Options {
  label: string;
  value: string;
}
const FETCH_KNOWN_LANGUAGES = gql`
  query view_doctor_membership_info($includes: [ViewDoctorIncludesEnum!]!) {
    view_doctor_membership_info(includes: $includes) {
      id
      ProviderLanuguages {
        language
        type
      }
    }
  }
`;
const FETCH_LANGUAGES = gql`
  query get_master_data($type: MasterType!) {
    get_master_data(type: $type) {
      label
      value
    }
  }
`;

const UPDATE_STAFF_LANGUAGES = gql`
  mutation update_doctor_membership_info_languages($input: [ProviderLanguageInput!]!) {
    update_doctor_membership_info_languages(input: $input)
  }
`;

const InsuranceDetails = () => {
  const styles = useStyles();
  const theme = useTheme();
  const knownLanguages = GoGQL.useView_Doctor_Membership_InfoQuery(FETCH_KNOWN_LANGUAGES, {
    variables: {
      includes: [GoGQL.ViewDoctorIncludesEnum.Language],
    },
    fetchPolicy: "cache-and-network",
  });
  const [staffLanguage, setStaffLanguage] = useState([]);
  const [doctorLanguage, setDoctorLanguage] = useState([]);
  const languages = GoGQL.useGet_Master_DataQuery(FETCH_LANGUAGES, {
    variables: {
      type: GoGQL.MasterType.SpokenLanguage,
    },
  });
  const [updateLanguagesRequest, updateLanguagesResponse] = GoGQL.useUpdate_Doctor_Membership_Info_LanguagesMutation(
    UPDATE_STAFF_LANGUAGES,
    {
      refetchQueries: [
        {
          query: FETCH_KNOWN_LANGUAGES,
          variables: {
            includes: [GoGQL.ViewDoctorIncludesEnum.Language],
          },
        },
        {
          query: GET_UPDATE_STATUS,
          variables: {
            section: GoGQL.ViewDoctorIncludesEnum.Language,
          },
        },
      ],
    }
  );
  const { enqueueSnackbar } = useSnackbar();
  const [staffSaveButton, setStaffSaveButton] = useState(true);
  const [selfSaveButton, setSelfSaveButton] = useState(true);
  const [doctorLanguagesOptions, setDoctorLanguagesOptions] = useState([]);
  const [staffLanguagesOptions, setStaffLanguagesOptions] = useState([]);

  const getLanguageOptions = (subArray, type: Type) => {
    var props = ["label", "value"];
    var result = languages?.data?.get_master_data
      ?.filter(function (o1) {
        return !subArray.some(function (o2) {
          return o1.label === o2.label;
        });
      })
      .map(function (o) {
        return props.reduce(function (newo, value) {
          newo[value] = o[value];
          return newo;
        }, {});
      });

    type == "DOCTOR" ? setDoctorLanguagesOptions(result) : setStaffLanguagesOptions(result);
  };

  useEffect(() => {
    getLanguageOptions(doctorLanguage, "DOCTOR");
  }, [doctorLanguage]);

  useEffect(() => {
    getLanguageOptions(staffLanguage, "STAFF");
  }, [staffLanguage]);

  useEffect(() => {
    async function setData() {
      const filtered_self_lang = knownLanguages.data.view_doctor_membership_info.ProviderLanuguages.filter(
        (item) => item?.type === "SELF"
      );
      const self_lang = filtered_self_lang.map((item) => {
        if (item?.type === "SELF") {
          return { label: item?.language, value: item?.language };
        }
      });
      setDoctorLanguage(self_lang);
      const filtered_staff_lang = knownLanguages.data.view_doctor_membership_info.ProviderLanuguages.filter(
        (item) => item?.type === "STAFF"
      );
      const staff_lang = filtered_staff_lang.map((item) => {
        if (item?.type === "STAFF") {
          return { label: item?.language, value: item?.language };
        }
      });
      setStaffLanguage(staff_lang);
    }
    if (knownLanguages?.data) {
      setData();
    }
  }, [knownLanguages?.data]);

  useEffect(() => {
    if (updateLanguagesResponse?.data?.update_doctor_membership_info_languages) {
      enqueueSnackbar(DOCTOR_MEMBERSHIP_UPDATE_SUCCESS_MSG, { variant: "success" });
    }
    if (updateLanguagesResponse?.error) {
      enqueueSnackbar(updateLanguagesResponse?.error?.message, { variant: "error" });
    }
  }, [updateLanguagesResponse?.data]);

  return (
    <>
      <div style={{ justifyContent: "center", width: "92%" }}>
        <Paper className={styles.paper}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Typography variant="h5" color={theme.palette.primary.main} style={{ margin: "1%" }}>
              Language Spoken By You
            </Typography>
            <GetUpdateStatus pendingStatusText={PENDING_STATUS_TEXT} section={GoGQL.ViewDoctorIncludesEnum.Language} />
          </div>
          <ComponentWithLoader loading={knownLanguages?.loading}>
            <Autocomplete
              disablePortal
              multiple
              filterSelectedOptions
              value={doctorLanguage}
              ListboxProps={{ style: { maxHeight: "15rem" } }}
              style={{ margin: "1%", width: "98%" }}
              id="insurance-accepted-auto-complete"
              options={doctorLanguagesOptions || []}
              onChange={(_, newValues: Options[]) => {
                setDoctorLanguage(newValues);
                setSelfSaveButton(false);
              }}
              renderInput={(params) => <UITextField {...params} size="medium" />}
            />
          </ComponentWithLoader>
          <Button
            variant="contained"
            className={styles.savebutton}
            disabled={(doctorLanguage?.length != 0 && selfSaveButton) || knownLanguages?.loading}
            onClick={() => {
              const self_lang = doctorLanguage.map((item) => ({ language: item.value, type: "SELF" }));
              const staff_lang = staffLanguage.map((item) => ({ language: item.value, type: "STAFF" }));
              updateLanguagesRequest({
                variables: {
                  input: self_lang.concat(staff_lang),
                },
              });
              setSelfSaveButton(true);
            }}
          >
            SAVE
          </Button>
          <Typography variant="h5" color={theme.palette.primary.main} style={{ margin: "1%" }}>
            Language Spoken By Your Staff
          </Typography>
          <ComponentWithLoader loading={knownLanguages?.loading}>
            <Autocomplete
              disablePortal
              multiple
              filterSelectedOptions
              value={staffLanguage}
              ListboxProps={{ style: { maxHeight: "15rem" } }}
              style={{ margin: "1%", width: "98%" }}
              id="insurance-accepted-auto-complete"
              options={staffLanguagesOptions || []}
              onChange={(_, newValues: Options[][]) => {
                setStaffLanguage(newValues);
                setStaffSaveButton(false);
              }}
              renderInput={(params) => <UITextField {...params} size="medium" />}
            />
          </ComponentWithLoader>
          <Button
            variant="contained"
            className={styles.savebutton}
            disabled={
              (doctorLanguage?.length != 0 && staffSaveButton && staffLanguage?.length != 0) || knownLanguages?.loading
            }
            onClick={() => {
              const self_lang = doctorLanguage.map((item) => ({ language: item.value, type: "SELF" }));
              const staff_lang = staffLanguage.map((item) => ({ language: item.value, type: "STAFF" }));
              updateLanguagesRequest({
                variables: {
                  input: self_lang.concat(staff_lang),
                },
              });
              setStaffSaveButton(true);
            }}
          >
            SAVE
          </Button>
        </Paper>
      </div>
    </>
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
  savebutton: {
    display: "block",
    margin: "1% auto",
  },
}));

export default InsuranceDetails;
