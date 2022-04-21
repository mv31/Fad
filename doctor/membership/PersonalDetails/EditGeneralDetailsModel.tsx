import { gql } from "@apollo/client";
import {
  useUpdate_Doctor_Membership_Info_General_InformationMutation,
  ViewDoctorIncludesEnum,
} from "@gogocode-package/graphql_code_generator/src/index";
import { UIMaskInput, UIModel, UIPrimaryButton, useSnackbar } from "@gogocode-package/ui-web";
import { TextField, Typography, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import { FETCH_DOCTOR_MEMBERSHIP_INFO } from "./GeneralDetails";
import { emptyCheck } from "@src/utils";
import * as GoGQL from "@gogocode-package/graphql_code_generator";
import { GET_UPDATE_STATUS } from "../GetUpdateStatus";

type Props = {
  isOpen: boolean;
  onClose?: () => void;
  selectedGeneralDetails?: GoGQL.Provider;
};

type data = {
  title: string;
};

//type Type = "Mailing" | "Practice";

interface GeneralDetails {
  mobile: string;
  degrees: string;
  tax_id: string;
  website: string;
  practice_name: string;
  practice_type: string;
}

export const UPDATE_DOCTOR_GENERAL_INFORMATION = gql`
  mutation update_doctor_membership_info_general_information($input: GeneralInformationInput!) {
    update_doctor_membership_info_general_information(input: $input) {
      provider {
        degrees
        practice_name
        practice_type
        tax_id
        website
      }
      user {
        mobile
      }
    }
  }
`;

function EditGeneralDetailsModel(props: Props) {
  const theme = useTheme();
  //const [summary, setSummary] = useState("");
  const [generalDetails, setGeneralDetails] = useState<GeneralDetails>({
    mobile: "",
    degrees: "",
    practice_name: "",
    practice_type: "",
    tax_id: "",
    website: "",
  });
  const [updateDocGeneralDataRequest, updateDocGeneralDataResponse] =
    useUpdate_Doctor_Membership_Info_General_InformationMutation(UPDATE_DOCTOR_GENERAL_INFORMATION, {
      refetchQueries: [
        {
          query: FETCH_DOCTOR_MEMBERSHIP_INFO,
          variables: {
            includes: [ViewDoctorIncludesEnum.User],
          },
        },
        {
          query: GET_UPDATE_STATUS,
          variables: {
            section: GoGQL.ViewDoctorIncludesEnum.Provider,
          },
        },
      ],
    });

  useEffect(() => {
    setGeneralDetails({
      mobile: props?.selectedGeneralDetails?.User?.mobile,
      degrees: props?.selectedGeneralDetails?.degrees,
      practice_name: props?.selectedGeneralDetails?.practice_name,
      practice_type: props?.selectedGeneralDetails?.practice_type,
      tax_id: props?.selectedGeneralDetails?.tax_id,
      website: props?.selectedGeneralDetails?.website,
    });
  }, [props]);
  const { enqueueSnackbar } = useSnackbar();
  const resetFields = () => {
    setGeneralDetails(null);
  };
  useEffect(() => {
    resetFields();
    props.onClose();
  }, [updateDocGeneralDataResponse?.data]);

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setGeneralDetails((prevSt) => ({ ...prevSt, [name]: value }));
  };

  const isValid = () => {
    const error_msg = emptyCheck([
      { name: "degrees ", value: generalDetails?.degrees },
      { name: " website ", value: generalDetails?.website },
      { name: "tax_id", value: generalDetails?.tax_id },
    ]);
    if (error_msg.length >= 5) {
      enqueueSnackbar(error_msg, { variant: "error" });
      return false;
    }
    return true;
  };

  const handleUpdateDoctor = () => {
    if (generalDetails.mobile.length === 14) {
      if (isValid()) {
        updateDocGeneralDataRequest({
          variables: {
            input: {
              provider: {
                degrees: generalDetails?.degrees,
                practice_name: generalDetails?.practice_name,
                practice_type: generalDetails?.practice_type,
                tax_id: generalDetails?.tax_id,
                website: generalDetails?.website,
              },
              user: {
                mobile: generalDetails?.mobile,
              },
            },
          },
        });
      }
    }
  };

  return (
    <UIModel
      isOpen={props.isOpen}
      disableEscapeKeyDown
      onClose={(event, reason) => {
        if (reason !== "backdropClick") {
          resetFields();
          props.onClose();
        }
      }}
      hideCancel
      action={
        <UIPrimaryButton
          onClick={handleUpdateDoctor}
          style={{ display: "flex", justifySelf: "center", margin: 10 }}
          loading={updateDocGeneralDataResponse?.loading}
        >
          Save
        </UIPrimaryButton>
      }
      maxWidth="lg"
      style={{}}
      title={"Edit General Details"}
      titleStyle={{ color: theme.palette.primary.main }}
    >
      <form onSubmit={handleUpdateDoctor}>
        <div style={{ display: "flex", flexWrap: "wrap", padding: "0 10%", columnGap: "10%" }}>
          <div style={{ flexBasis: "40%", margin: "1% 0" }}>
            <Typography>Mobile</Typography>
            <UIMaskInput
              mask="us-mobile"
              placeholder={"Mobile"}
              name="mobile"
              value={generalDetails?.mobile}
              onChange={handleChange}
              error={!/\(\d\d\d\) \d\d\d-\d\d\d\d/.test(generalDetails?.mobile)}
              style={{ marginTop: "1%" }}
            />
          </div>
          <div style={{ flexBasis: "40%", margin: "1% 0" }}>
            <Typography>Degrees</Typography>
            <TextField
              value={generalDetails?.degrees}
              name="degrees"
              onChange={handleChange}
              placeholder={"Degrees"}
              inputProps={{ maxLength: 25 }}
              style={{ marginTop: "1%" }}
            />
          </div>
          <div style={{ flexBasis: "40%", margin: "1% 0" }}>
            <Typography>Tax ID</Typography>
            <UIMaskInput
              mask="us-tax"
              placeholder={"Tax ID"}
              name="tax_id"
              value={generalDetails?.tax_id}
              onChange={handleChange}
              error={!/\d\d-\d\d\d\d\d\d\d/.test(generalDetails?.tax_id)}
              style={{ marginTop: "1%" }}
            />
          </div>
          <div style={{ flexBasis: "40%", margin: "1% 0" }}>
            <Typography>Website</Typography>
            <TextField
              name="website"
              value={generalDetails?.website}
              onChange={handleChange}
              placeholder={"Website"}
              inputProps={{ maxLength: 25 }}
              style={{ marginTop: "1%" }}
            />
          </div>
          <div style={{ flexBasis: "40%", margin: "1% 0" }}>
            <Typography>Practice Name</Typography>
            <TextField
              name="practice_name"
              value={generalDetails?.practice_name}
              onChange={handleChange}
              placeholder={"Practice Name"}
              inputProps={{ maxLength: 20 }}
              style={{ marginTop: "1%" }}
            />
          </div>
          <div style={{ flexBasis: "40%", margin: "1% 0" }}>
            <Typography>Practice Type</Typography>
            <TextField
              name="practice_type"
              value={generalDetails?.practice_type}
              onChange={handleChange}
              placeholder={"Practice Type"}
              inputProps={{ maxLength: 20 }}
              style={{ marginTop: "1%" }}
            />
          </div>
        </div>
      </form>
    </UIModel>
  );
}

export default EditGeneralDetailsModel;
