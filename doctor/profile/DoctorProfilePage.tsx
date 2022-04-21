import { PersonalDetails } from "@components/doctor/profile/Tabs";
import { useAdd_Remove_Provider_To_WishlistMutation } from "@gogocode-package/graphql_code_generator";
import { DoctorRequestStatus } from "@gogocode-package/graphql_code_generator";
import * as GoGQL from "@gogocode-package/graphql_code_generator";
import { UIGrid, UIPrimaryButton, useErrorNotification, useSuccessNotification } from "@gogocode-package/ui-web";
import AddIcon from "@mui/icons-material/Add";
import { Button, Grid, Tooltip, Typography, useTheme, Avatar, Theme, Divider } from "@mui/material";
import { createStyles, makeStyles } from "@mui/styles";
import { googleMapMarkerColors } from "@src/../../Constants";
import AppointmentDetails from "@src/components/doctor/profile/appointmentdetails";
import { formattedAddress, toTitleCase } from "@src/utils";
import _ from "lodash";
import { gql } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { Favorite, FavoriteBorder } from "@mui/icons-material";
import { useRouter } from "next/router";
import { getUserType } from "@src/api/api";
import MakeRequestModal from "@src/components/consumer/CommunicationRequests/MakeRequestModal";
import { AddToFavModal } from "./AddToFavModal";

export const ADD_REMOVE_PROVIDER_FROM_WISHLIST = gql`
  mutation add_remove_provider_to_wishlist($npi: String!, $provider_id: String, $member_id: Float!) {
    add_remove_provider_to_wishlist(npi: $npi, provider_id: $provider_id, member_id: $member_id)
  }
`;

interface DoctorProfileProps {
  npi: any;
}

export enum ProviderLanuguageType {
  STAFF = "STAFF",
  SELF = "SELF",
}

const DoctorProfile = ({ npi }: DoctorProfileProps) => {
  const styles = useStyles();
  const [isProviderAlreadySignedUp, setIsProviderAlreadySignedUp] = useState(false);
  const theme = useTheme();
  const router = useRouter();
  const userType = getUserType();
  const [npiData, setNpiData] = useState({
    fullName: "",
    provider_id: "",
    specialities: null,
    subSpecialties: null,
    summary: null,
    profile_pic: null,
    qualification: null,
    school: [],
    gender: null,
    board_certification: null,
    languages_spoken: null,
    website: null,
    phone_no: null,
    insurances: [],
    hospital_affliations: [],
    addresses: [],
    rawAddresses: {
      mailing: [],
      practice: [],
    },
    searchtypes: [],
  });
  const [currentProviderId, setCurrentProviderId] = useState(null);
  const [addOrRemoveFromFav, addOrRemoveFromFavResponse] = useAdd_Remove_Provider_To_WishlistMutation(
    ADD_REMOVE_PROVIDER_FROM_WISHLIST
  );
  const [makeRequestModalOpen, setMakeRequestModalOpen] = useState<boolean>(false);
  const [addToFavModalOpen, setAddToFavModalOpen] = useState<boolean>(false);
  const [status, setStatus] = useState<GoGQL.DoctorRequestStatus | "All">("All");

  useEffect(() => {
    let npiDataFromServer = {
      fullName: "",
      specialities: null,
      subSpecialties: null,
      summary: null,
      qualification: null,
      gender: null,
      board_certification: null,
      languages_spoken: null,
      website: null,
      profile_pic: null,
      school: [],
      phone_no: null,
      insurances: [],
      hospital_affliations: [],
      addresses: [],
      rawAddresses: {
        mailing: [],
        practice: [],
      },
    };
    if (npi?.provider_data && npi?.provider_data?.id) {
      setCurrentProviderId(npi?.provider_data?.id);
      setIsProviderAlreadySignedUp(true);
      const npiProviderData = npi?.provider_data;
      const addresses = [];
      npiProviderData?.ProviderAddresses?.forEach((address) => {
        addresses.push(
          toTitleCase(address.type) +
            " Address : " +
            formattedAddress({
              firstLineAddress: address.address_line1,
              city: address.city,
              state: address.state,
              postalCode: address.postal_code,
              secondLineAddress: address.address_line2,
            })
        );
      });

      npiDataFromServer = {
        ...npiDataFromServer,
        fullName: `${npiProviderData?.User.first_name} ${npiProviderData?.User?.middle_name} ${npiProviderData?.User?.last_name}`,
        specialities: npiProviderData?.ProviderSpecialties?.map((speciality) => speciality?.Taxonomy?.specialty),
        subSpecialties: npiProviderData?.ProviderSpecialties?.map((speciality) => speciality?.Taxonomy?.sub_specialty),
        summary: npiProviderData?.summary,
        qualification: npiProviderData?.degrees,
        gender: npiProviderData?.User?.gender,
        board_certification: npiProviderData?.ProviderCertifications?.map((certification) => certification.name),
        languages_spoken: npiProviderData?.ProviderLanuguages?.map((language) => {
          if (language?.type == ProviderLanuguageType.SELF) return language.language;
        }),
        website: npiProviderData?.website,
        phone_no: npiProviderData?.User?.mobile,
        insurances: npiProviderData?.ProviderInsurances?.map((insurance) => insurance.name),
        hospital_affliations: npiProviderData?.ProviderHospitalAffliations?.map((affliation) => affliation?.hospital),
        school: npiProviderData?.ProviderSchools?.map((schools) => schools?.school),
        addresses: addresses,
        profile_pic: npiProviderData?.User?.profile_picture,
      };
    } else if (npi?.elastic_data) {
      setIsProviderAlreadySignedUp(false);
      setCurrentProviderId(null);
      const addresses = [];
      npi?.elastic_data?.addresses?.forEach((address) => {
        addresses.push(
          toTitleCase(address.type) +
            " Address : " +
            formattedAddress({
              firstLineAddress: address.firstLineAddress,
              city: address.city,
              state: address.state,
              postalCode: address.postalCode,
            })
        );
      });
      npiDataFromServer = {
        ...npiDataFromServer,
        fullName: npi?.elastic_data?.fullName,
        specialities: npi?.elastic_data?.specialities,
        subSpecialties: npi?.elastic_data?.taxonomies?.map((taxonomy) => taxonomy?.subspecialty),
        summary: null,
        qualification: npi?.elastic_data?.credential && npi?.elastic_data?.credential?.join(", "),
        gender: npi?.elastic_data?.gender,
        board_certification: npi?.elastic_data?.boardCertification,
        languages_spoken: npi?.elastic_data?.languagesSpoken,
        website: null,
        phone_no: npi?.elastic_data?.phones && npi?.elastic_data?.phones,
        insurances: npi?.elastic_data?.insuranceIds,
        hospital_affliations: npi?.elastic_data?.hospitalAffiliations,
        addresses: addresses,
        school: npi?.elastic_data?.schools,
      };
    }
    let index = 0;
    let fullAddress = npi?.elastic_data?.addresses?.map((adrObj) => ({
      ...adrObj,
      fullAddress: formattedAddress(adrObj),
    }));
    // const uniqueAddresses: any = _.uniqBy(fullAddress, "fullAddress");
    const uniqueAddresses: any = fullAddress ? [...fullAddress] : [];
    const practiceAddresses = uniqueAddresses?.filter((address) => address?.type == "Practice");
    const mailingAddresses = uniqueAddresses?.filter((address) => address?.type == "Mailing");
    setNpiData({
      ...npiData,
      ...npiDataFromServer,
      rawAddresses: {
        practice: practiceAddresses
          ?.map((address, i) => {
            index = i;
            return { marker: googleMapMarkerColors[i], address };
          })
          .filter(Boolean),
        mailing: mailingAddresses
          ?.map((address, i) => {
            return { marker: googleMapMarkerColors[i + index], address };
          })
          .filter(Boolean),
      },
      hospital_affliations: npi?.elastic_data?.hospitalAffiliations,
      provider_id: npi?.provider_data?.id,
      searchtypes: npi?.elastic_data?.searchtypes,
      school: npi?.elastic_data?.schools,
    });
  }, [npi]);

  useErrorNotification([addOrRemoveFromFavResponse?.error]);
  useSuccessNotification([addOrRemoveFromFavResponse?.data?.add_remove_provider_to_wishlist]);
  const specialities = npiData?.specialities?.filter((speciality) => speciality && speciality?.trim() != "");
  const subspecialities = npiData?.subSpecialties?.filter(
    (subspeciality) => subspeciality && subspeciality?.trim() != ""
  );

  return (
    <>
      {/* <Grid style={{ overflow: "auto", height: "90vh" }}> */}
      <Grid
        style={{
          margin: "0 auto",
          // marginTop: "3%",
          // maxHeight: "100%",
          padding: "1%",
          paddingTop: 20,
          backgroundColor: "#F0F0F5",
          height: "95vh",
          overflow: "auto",
          // paddingBottom: 20,
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            border: `2px solid ${theme.palette.primary.main}`,
            // margin: 10,
            // position: "absolute",
            width: "100%",
            // zIndex: -20,
            // minHeight: "20%",
            display: "flex",
          }}
        >
          <div
            style={{
              // background: "red",
              display: "flex",
              justifyContent: "center",
              // marginLeft: "3%",
              flex: 3,
            }}
          >
            <div
              style={{
                display: "flex",
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                padding: "1%",
                // margin: "1%",
                marginLeft: "1%",
              }}
            >
              <Avatar
                src={npiData?.profile_pic || "/doc2.png"}
                alt="doctor icon"
                className={styles.doctorIcon}
                // style={{ width: "100%", height: "100%" }}
                imgProps={{ style: { borderRadius: "50%", width: "100%", height: "100%" } }}
              />
            </div>
            <div style={{ margin: "0 20px", alignSelf: "center", flex: 8 }}>
              {npiData?.qualification ? (
                <Typography className={styles.doctorName}>
                  {npiData?.searchtypes?.includes("doctor") ? "Dr." : ""} {toTitleCase(npiData?.fullName)},&nbsp;
                  {npiData?.qualification}
                </Typography>
              ) : (
                <Typography className={styles.doctorName}>{`${
                  npiData?.searchtypes?.includes("doctor") ? "Dr." : ""
                } ${toTitleCase(npiData?.fullName)}`}</Typography>
              )}

              <Tooltip title={specialities && specialities?.join(" | ")} placement="bottom-start">
                <Typography className={styles.doctorDescription}>
                  {" "}
                  {specialities && specialities?.join(" | ")}
                </Typography>
              </Tooltip>
              <Tooltip title={subspecialities && subspecialities?.join(" | ")} placement="bottom-start">
                <Typography className={styles.doctorDescription}>
                  {" "}
                  {subspecialities && subspecialities?.join(" | ")}
                </Typography>
              </Tooltip>
              {/* <Typography className={styles.doctorDescription}>
                  {npiData?.specialities && npiData?.specialities.join(" | ")}
                </Typography> */}
              {userType && npiData?.summary && (
                <div style={{ display: "flex", margin: "10px 0px" }}>
                  <div style={{ backgroundColor: "green", width: ".5%" }} />
                  <div style={{ width: "100%" }}>
                    <Typography ml={2} mb={2} style={{ wordBreak: "break-word" }}>
                      {npiData?.summary}
                    </Typography>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginRight: "3%",
              flex: 1,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                textAlign: "center",
                marginRight: "1%",
                alignSelf: "center",
                alignItems: "center",
                alignContent: "center",
              }}
            >
              {userType === "CONSUMER" && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "right",
                  }}
                >
                  <UIPrimaryButton
                    style={{ color: "white" }}
                    onClick={() => {
                      setAddToFavModalOpen(true);
                    }}
                  >
                    {npiData?.searchtypes?.includes("doctor")
                      ? `Add / Remove From my Doctors`
                      : `Add / Remove from my Practitioners`}
                  </UIPrimaryButton>
                </div>
              )}
            </div>
          </div>
        </div>
        <PersonalDetails npi={npiData} />
      </Grid>
      {/* <UIGrid fullWidth>
          <UIGrid direction="column" item lg={12} style={{}}>
            <Grid
              style={{
                margin: "0 auto",
                marginTop: "5%",
                overflowY: "auto",
                maxHeight: "85vh",
                padding: "3%",
                paddingTop: 20,
                backgroundColor: "#F0F0F5",
              }}
            >
              <PersonalDetails npi={npiData} />
            </Grid>
          </UIGrid>
        </UIGrid> */}
      {/* {isProviderAlreadySignedUp && (
            <UIGrid md={4} style={{ marginTop: "3%" }} container computerRatio={12}>
              <AppointmentDetails providerId={npi?.provider_data?.id} />
            </UIGrid>
          )} */}
      {/* </Grid> */}
      <MakeRequestModal
        isOpen={makeRequestModalOpen}
        onClose={(isSave) => {
          if (isSave) setStatus(DoctorRequestStatus.Pending);
          setMakeRequestModalOpen(false);
        }}
        npi={npiData}
      />
      {addToFavModalOpen && (
        <AddToFavModal
          isOpen={addToFavModalOpen}
          onClose={() => setAddToFavModalOpen(false)}
          npi={router?.query?.npi?.toString()}
          isDoctor={!npiData?.searchtypes?.includes("other")}
          providerId={npiData?.provider_id}
        />
      )}
    </>
  );
};

export default DoctorProfile;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    header: {
      background: theme.palette.primary.main,
      minHeight: 400,
    },
    doctorIcon: {
      width: "100%",
      height: "100%",
      maxHeight: 150,
      // width: "auto",
      padding: "2px",
      alignSelf: "center",
      border: "2px solid green",
    },
    container: {
      display: "flex",
      gap: 30,
      alignItems: "center",
      height: 300,
      marginLeft: "20%",
    },
    doctorName: {
      fontWeight: 600,
      fontSize: 30,
      color: theme.palette.primary.main,
      marginTop: 0,
    },
    doctorDescription: {
      fontSize: 18,
      color: theme.palette.primary.main,
      marginBottom: 10,
      overflow: "hidden",
      textOverflow: "ellipsis",
      display: "-webkit-box",
      maxHeight: 52,
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
    },
    tabs: {
      background: "#fff",
      padding: 2,
      borderRadius: 50,
      marginTop: 20,
      paddingLeft: 20,
      paddingRight: 20,
      width: "auto",
    },
    tab: {
      background: "#FFFFFF",
      borderRadius: 50,
      fontWeight: "bold",
      margin: 5,
    },
    card_row: { display: "flex", columnGap: 30 },
  })
);
