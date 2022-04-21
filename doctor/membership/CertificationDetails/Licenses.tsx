import { Button, Grid, Theme, Typography } from "@mui/material";
// import {
//   useUpdate_Doctor_Membership_Info_LicensesMutation,
//   useView_Doctor_Membership_InfoQuery,
//   ViewDoctorIncludesEnum,
// } from "@gogocode-package/graphql_code_generator";
import * as GoGQL from "@gogocode-package/graphql_code_generator";
import React, { useState } from "react";
import MedicalLicenseModal from "./MedicalLicenseModal";
import { makeStyles } from "@mui/styles";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import IconButton from "@mui/material/IconButton";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import AddIcon from "@mui/icons-material/Add";
import { gql } from "@apollo/client";
import { UILoader } from "@gogocode-package/ui-web";
import { GET_UPDATE_STATUS } from "../GetUpdateStatus";
import _ from "lodash";
import ConfirmationPrompt from "@src/components/ConfirmationPrompt";

type LicenseChildProps = {
  item: any;
  onEdit: () => void;
  onDelete: () => void;
};

const LicenseChildCard = (props: LicenseChildProps) => {
  const { item, onEdit, onDelete } = props;
  const styles = useStyles();
  //const [modelOpen, setModelOpen] = useState<boolean>(false);
  return (
    <>
      <div
        style={{
          border: "1px solid #E0E0E0",
          display: "flex",
          justifyContent: "space-between",
          margin: "1%",
          borderRadius: 5,
        }}
      >
        <div style={{ margin: "1%" }}>
          <div style={{ display: "flex" }}>
            <Typography>License No : </Typography>
            <Typography ml={1} fontSize={22} color="#888">
              {item?.license_no}
            </Typography>
          </div>
          <div style={{ display: "flex", marginTop: "2%" }}>
            <Typography>Year : </Typography>
            <Typography ml={1} fontSize={22} color="#888">
              {item?.year}
            </Typography>
          </div>
          <div style={{ display: "flex" }}>
            <Typography>State : </Typography>
            <Typography ml={1} fontSize={22} color="#888">
              {item?.state}
            </Typography>
          </div>
        </div>
        <div style={{ display: "flex", marginRight: "2%" }}>
          <IconButton color="primary" className={styles.iconDiv} onClick={onEdit}>
            <EditRoundedIcon />
          </IconButton>

          <IconButton color="primary" className={styles.iconDiv} onClick={onDelete}>
            <DeleteOutlineRounded />
          </IconButton>
        </div>
      </div>
    </>
  );
};

export const UPDATE_LICENSES = gql`
  mutation update_doctor_membership_info_licenses(
    $input: ProviderLicenseInput!
    $row_id: Float
    $operation: DBOperation!
  ) {
    update_doctor_membership_info_licenses(input: $input, row_id: $row_id, operation: $operation)
  }
`;

export const FETCH_LICENSES_DETAILS = gql`
  query view_doctor_membership_info($includes: [ViewDoctorIncludesEnum!]!) {
    view_doctor_membership_info(includes: $includes) {
      ProviderLicenses {
        id
        state
        license_no
        year
      }
    }
  }
`;

export function Licenses1() {
  const responses = GoGQL.useView_Doctor_Membership_InfoQuery(FETCH_LICENSES_DETAILS, {
    variables: {
      includes: [GoGQL.ViewDoctorIncludesEnum.License],
    },
    fetchPolicy: "network-only",
  });
  const [type, setType] = useState<"Add" | "Edit">(null);
  const [currentLicense, setCurrentLicense] = useState(null);
  const [conformPromptOpen, setConformPromptOpen] = useState<boolean>(false);
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
  const onDelete = () => {
    setConformPromptOpen(false);
    updateLicensesRequest({
      variables: {
        input: _.omit(currentLicense, ["id", "__typename"]),
        row_id: Number(currentLicense?.id),
        operation: GoGQL.DbOperation.Delete,
      },
    });
  };
  return (
    <>
      {responses?.data?.view_doctor_membership_info?.ProviderLicenses?.map((item, index) => (
        <LicenseChildCard
          key={index}
          item={item}
          onEdit={() => {
            setType("Edit");
            setCurrentLicense(item);
          }}
          onDelete={() => {
            setConformPromptOpen(true);
            setCurrentLicense(item);
          }}
        />
      ))}
      {responses?.data?.view_doctor_membership_info?.ProviderLicenses?.length == 0 && (
        <Typography style={{ display: "flex", justifyContent: "center" }}>No Records found</Typography>
      )}
      {responses?.loading && (
        <Grid style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
          <UILoader loading={responses?.loading} />
        </Grid>
      )}{" "}
      <Grid mt={3} mb={3} justifyContent="center" textAlign="center">
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setType("Add");
          }}
        >
          <AddIcon />
          ADD
        </Button>
      </Grid>
      <MedicalLicenseModal
        isOpen={type == "Edit" || type == "Add"}
        onClose={() => {
          responses.refetch();
          setCurrentLicense(null);
          setType(null);
        }}
        type={type}
        licenses={responses?.data?.view_doctor_membership_info?.ProviderLicenses}
        currentLicense={currentLicense}
      />
      <ConfirmationPrompt
        action={onDelete}
        isOpen={conformPromptOpen}
        onClose={() => {
          setConformPromptOpen(false);
          setCurrentLicense(null);
        }}
        message="Are You sure to delete this License"
        title={"Conformation Prompt"}
        actionLoading={updateLicensesResponse?.loading}
      />
    </>
  );
}

const useStyles = makeStyles((theme: Theme) => ({
  iconDiv: {
    margin: "1%",
    display: "flex",
    justifyContent: "center",
    justifySelf: "center",
    alignSelf: "center",
    alignItems: "center",
    borderRadius: 50,
    width: 40,
    height: 40,
    cursor: "pointer",
    //border: `1px solid ${theme.palette.primary.main}`,
    color: theme.palette.primary.main,
  },
}));
