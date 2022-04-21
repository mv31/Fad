import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import {
  Grid,
  Paper,
  Typography,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  TableCell,
  Table,
  Divider,
  TableContainer,
  TableRow,
  TableBody,
  useTheme,
} from "@mui/material";
import { DoctorLocationMap } from "@src/components/DoctorLocationMap";
import React, { useState, useEffect } from "react";
import _ from "lodash";
import { formatPhoneNumbers, formattedAddress } from "@src/utils";
import { LocationOn } from "@mui/icons-material";
import { Address } from "@src/components/Address";
import { HospitalAffiliations } from "@gogocode-package/graphql_code_generator";
import { StyledTableCell } from "@src/components/dashboard/StyledTableComponents";

type PersonalDetailsProps = {
  npi?: any;
};
const PersonalDetails = ({ npi }: PersonalDetailsProps) => {
  const theme = useTheme();
  // const [selectedGeolocation, setSelectedGeolocation] = useState(npi?.rawAddresses?.mailing?.[0]?.address?.geoLocation);

  // const handleToggleAddress = (address) => {
  //   setSelectedGeolocation(address?.address?.geoLocation);
  // };

  // useEffect(() => {
  //   if (npi?.rawAddresses?.mailing) {
  //     setSelectedGeolocation(npi?.rawAddresses?.mailing?.address?.[0]?.geoLocation);
  //     console.log("value", selectedGeolocation);
  //   }
  // }, [npi?.rawAddresses?.mailing]);

  return (
    <Grid lg={12} style={{ backgroundColor: "red" }}>
      <Grid
        mt={3}
        container
        style={{
          marginBottom: 10,
          border: `2px solid ${theme.palette.primary.main}`,
          backgroundColor: "white",
          display: "flex",
        }}
      >
        <Grid
          // md={6}
          // lg={6}
          item
          style={{ marginBottom: 10, height: "100%", flex: 1 }}
        >
          <Paper
            elevation={0}
            style={{
              width: "100%",
              marginBottom: 20,
              // height: "100%",
              paddingLeft: 10,
              // background: "blue",
              overflow: "auto",
              // maxHeight: 500,
            }}
          >
            <Typography
              mb={2}
              ml={3}
              mt={2}
              style={{ fontWeight: 600, fontSize: 28, color: theme.palette.primary.main }}
            >
              General Details
            </Typography>
            <TableContainer>
              {npi?.gender && (
                <Table>
                  <TableCell style={{ width: "40%" }}>
                    <Typography ml={2} mt={2}>
                      {" "}
                      <FiberManualRecordIcon
                        style={{ color: theme.palette.primary.main, fontSize: 15, marginRight: 10 }}
                      />{" "}
                      Gender
                    </Typography>
                  </TableCell>
                  <TableCell width="5%">:</TableCell>
                  <TableCell align="left" width="55%">
                    <Typography mt={2}>
                      {npi?.gender && (npi?.gender == "M" ? "Male" : npi?.gender == "F" ? "Female" : "Others")}
                    </Typography>
                  </TableCell>
                </Table>
              )}

              {!_.isEmpty(npi?.board_certification) && (
                <Table>
                  <TableCell style={{ width: "40%" }}>
                    <Typography ml={2} mt={2}>
                      {" "}
                      <FiberManualRecordIcon
                        style={{ color: theme.palette.primary.main, fontSize: 15, marginRight: 10 }}
                      />{" "}
                      Board Certification
                    </Typography>
                  </TableCell>
                  <TableCell width="5%">:</TableCell>
                  <TableCell width="55%">
                    <Typography mt={2}>{npi?.board_certification && npi?.board_certification?.join(",")}</Typography>
                  </TableCell>
                </Table>
              )}

              {!_.isEmpty(npi?.board_certification) && !_.includes(npi?.languages_spoken, "English") && (
                <Table>
                  <TableCell style={{ width: "40%" }}>
                    <Typography ml={2} mt={2}>
                      {" "}
                      <FiberManualRecordIcon
                        style={{ color: theme.palette.primary.main, fontSize: 15, marginRight: 10 }}
                      />{" "}
                      Languages Spoken
                    </Typography>
                  </TableCell>
                  <TableCell width="5%">:</TableCell>
                  <TableCell align="left" width="55%">
                    <Typography mt={2}>{npi?.languages_spoken && npi?.languages_spoken.join(",")}</Typography>
                  </TableCell>
                </Table>
              )}

              {npi?.website && (
                <Table>
                  <TableCell style={{ width: "40%" }}>
                    <Typography ml={2} mt={2}>
                      {" "}
                      <FiberManualRecordIcon
                        style={{ color: theme.palette.primary.main, fontSize: 15, marginRight: 10 }}
                      />{" "}
                      Website
                    </Typography>
                  </TableCell>
                  <TableCell width="5%">:</TableCell>
                  <TableCell align="left" width="55%">
                    {/* <Link href={}> */}
                    <a target={"_blank"} href={`https://${npi?.website}`} rel="noreferrer">
                      {npi?.website}
                    </a>
                    {/* </Link> */}
                  </TableCell>
                </Table>
              )}

              {npi?.phone_no && npi?.phone_no.length > 0 && (
                <Table>
                  <TableCell style={{ width: "40%" }}>
                    <Typography ml={2} mt={2}>
                      {" "}
                      <FiberManualRecordIcon
                        style={{ color: theme.palette.primary.main, fontSize: 15, marginRight: 10 }}
                      />{" "}
                      Phone No
                    </Typography>
                  </TableCell>
                  <TableCell width="5%">:</TableCell>
                  <TableCell align="left" width="55%">
                    <Typography mt={2}>{formatPhoneNumbers(npi?.phone_no)}</Typography>
                  </TableCell>
                </Table>
              )}

              {npi?.insurances && npi?.insurances != "" && npi?.insurances.length > 0 && (
                <Table>
                  <TableCell style={{ width: "40%" }}>
                    <Typography ml={2} mt={2}>
                      {" "}
                      <FiberManualRecordIcon
                        style={{ color: theme.palette.primary.main, fontSize: 15, marginRight: 10 }}
                      />{" "}
                      Insurance Accepted
                    </Typography>
                  </TableCell>
                  <TableCell width="5%">:</TableCell>
                  <TableCell align="left" width="55%">
                    <Typography mt={2}>{npi?.insurances && npi?.insurances.join(", ")}</Typography>
                    {/* {npi?.insurances.map((insurance, i) => (
                      <Typography mt={2} key={i}>
                        {insurance + ", "}
                      </Typography>
                    ))} */}
                  </TableCell>
                </Table>
              )}

              {npi?.school != "" && npi?.school?.length > 0 && (
                <Table>
                  <TableCell style={{ width: "40%" }}>
                    <Typography ml={2} mt={2}>
                      {" "}
                      <FiberManualRecordIcon
                        style={{ color: theme.palette.primary.main, fontSize: 15, marginRight: 10 }}
                      />{" "}
                      Medical Schools
                    </Typography>
                  </TableCell>
                  <TableCell width="5%">:</TableCell>
                  <TableCell align="left" width="55%">
                    {/* {JSON.stringify(npi?.school)}
                    <Typography mt={2}>{npi?.school && npi?.school.join(", ")}</Typography> */}
                    {/* {npi?.school?.map((school, i) => (
                      <Typography key={i} mt={2}>{`${school?.name} ${
                        school?.city ? ` - ${school?.city}` : ""
                      },`}</Typography>
                    ))} */}
                    {/* Quick Fix */}
                    <Typography>{npi?.school?.map((school, i) => school?.name).join(", ")}</Typography>
                  </TableCell>
                </Table>
              )}
            </TableContainer>

            {npi?.hospital_affliations && npi?.hospital_affliations.length > 0 && (
              <>
                <Typography
                  ml={3}
                  mt={3}
                  mb={1}
                  style={{ fontWeight: 600, fontSize: 28, color: theme.palette.primary.main }}
                >
                  Hospital Affiliations
                </Typography>
                <TableContainer>
                  <Table>
                    {/* <TableRow>
                      <TableCell
                        style={{ minWidth: "50%", fontWeight: 600, color: theme.palette.primary.main, fontSize: 26 }}
                        align="left"
                      >
                        {" "}
                        Hospital{" "}
                      </TableCell>
                      
                      <TableCell
                        style={{ minWidth: "50%", fontWeight: 600, color: theme.palette.primary.main, fontSize: 26 }}
                        align="left"
                      >
                        {" "}
                        Address{" "}
                      </TableCell>
                    </TableRow> */}
                    <TableBody>
                      {npi?.hospital_affliations?.map((affliation: HospitalAffiliations, i) => (
                        <TableRow key={i}>
                          <TableCell align="left" key={i}>
                            <Typography style={{}}>
                              {/* {affliation?.address ? affliation?.lbn + " :" :  */}
                              {affliation?.lbn}
                            </Typography>
                          </TableCell>{" "}
                          {affliation?.address ? <TableCell width="5%">:</TableCell> : ""}
                          <TableCell align="left" style={{ alignContent: "center" }}>
                            <Address
                              city={affliation?.city}
                              firstLineAddress={affliation?.address}
                              postalCode={affliation?.zip_code}
                              state={affliation?.state}
                              style={{ fontSize: 20, color: "grey", marginLeft: "1%" }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}{" "}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Paper>
        </Grid>
        <Grid
          // md={6}
          //  lg={6}
          style={{ flex: 1, paddingRight: 2 }}
          item
        >
          <Paper
            elevation={0}
            style={{
              borderLeft: `2px solid ${theme.palette.primary.main}`,
              borderRadius: 0,
              width: "100%",
              height: "100%",
              overflow: "hidden",
            }}
          >
            <Typography
              mb={2}
              ml={3}
              mt={2}
              style={{ fontWeight: 600, fontSize: 28, color: theme.palette.primary.main }}
            >
              {npi?.searchtypes?.includes("doctor") ? "Doctor Location" : "Office Location"}
            </Typography>
            <Grid mb={2} style={{ paddingLeft: 25, paddingRight: 25, fontSize: 18, justifyContent: "center" }}>
              {npi?.rawAddresses?.practice?.length > 0 ? (
                <>
                  {npi?.rawAddresses?.practice?.map((address, idx) => (
                    <div key={idx} style={{ display: "flex", columnGap: "2%", alignItems: "center" }}>
                      <LocationOn htmlColor={address?.marker?.color} />
                      <Typography>
                        {formattedAddress({
                          firstLineAddress: address?.address?.firstLineAddress,
                          city: address?.address?.city,
                          state: address?.address?.state,
                          postalCode: address?.address?.postalCode,
                          secondLineAddress: address?.address?.secondLineAddress,
                        })}
                      </Typography>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {npi?.rawAddresses?.mailing?.map((address, idx) => (
                    <div key={idx} style={{ display: "flex", columnGap: "2%", alignItems: "center" }}>
                      <LocationOn htmlColor={address?.marker?.color} />
                      <Typography>
                        {formattedAddress({
                          firstLineAddress: address?.address?.firstLineAddress,
                          city: address?.address?.city,
                          state: address?.address?.state,
                          postalCode: address?.address?.postalCode,
                          secondLineAddress: address?.address?.secondLineAddress,
                        })}
                      </Typography>
                    </div>
                  ))}
                </>
              )}
              <div style={{ marginTop: "2%" }}>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Typography
                    style={{
                      fontSize: 20,
                      fontStyle: "italic",
                      color: "grey",
                    }}
                  >
                    Please click on a marker to view and navigate using Google Maps{" "}
                  </Typography>
                </div>
                <DoctorLocationMap locations={npi?.rawAddresses} />
              </div>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default PersonalDetails;
