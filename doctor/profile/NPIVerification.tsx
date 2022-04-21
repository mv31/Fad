import { Paper, Typography, Grid, Table, TableCell, TableContainer, Theme, useTheme } from "@mui/material";
import { createStyles, makeStyles } from "@mui/styles";
import React, { useState } from "react";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { formatPhoneNumber, toTitleCase } from "@src/utils";
import { DoctorLocationMap } from "@src/components/DoctorLocationMap";
import { UIGrid } from "@gogocode-package/ui-web";
import _ from "lodash";

interface NPIVerificationProps {
  npi: any;
}
const NPIVerification = ({ npi }: NPIVerificationProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const practiceAddress = npi?.addresses
    ?.map((address, i) => {
      return address?.type == "Practice" ? address : null;
    })
    .filter(Boolean);

  const mailingAddress = npi?.addresses
    ?.map((address, i) => {
      return address?.type == "Mailing" ? address : null;
    })
    .filter(Boolean);

  return (
    <Grid>
      <Paper
        elevation={0}
        style={{
          border: `2px solid ${theme.palette.primary.main}`,
          padding: 0,
          margin: 10,
          width: "100%",
        }}
      >
        <UIGrid
          style={{ paddingTop: 20, paddingBottom: 20, backgroundColor: theme.palette.primary.main }}
          fullWidth
          container
        >
          <UIGrid
            md={4}
            item
            style={{
              textAlign: "center",
            }}
          >
            <img src="/doc2.png" alt="doctor icon" className={styles.doctorIcon} />
          </UIGrid>
          <UIGrid md={4} item>
            <p className={styles.doctorName}>Dr. {toTitleCase(npi?.fullName)}</p>

            <Typography className={styles.doctorDescription}>
              {npi?.specialities && npi?.specialities.join(" | ")}
            </Typography>
          </UIGrid>
        </UIGrid>
      </Paper>

      <Paper
        elevation={0}
        style={{
          border: `2px solid ${theme.palette.primary.main}`,
          padding: 0,
          margin: 10,
          width: "100%",
          marginBottom: 20,
        }}
      >
        <Typography ml={3} mt={3} mb={2} variant="h4" style={{ fontWeight: 500, color: theme.palette.primary.main }}>
          Education and Background
        </Typography>
        <TableContainer>
          {npi?.qualification && (
            <Table>
              <TableCell style={{ width: "40%" }}>
                <Typography ml={2} mt={2}>
                  {" "}
                  <FiberManualRecordIcon
                    style={{ color: theme.palette.primary.main, fontSize: 15, marginRight: 10 }}
                  />{" "}
                  Qualification
                </Typography>
              </TableCell>
              <TableCell width="5%">:</TableCell>
              <TableCell width="55%">
                <Typography mt={2}>{npi?.qualification}</Typography>
              </TableCell>
            </Table>
          )}

          {!_.isEmpty(npi?.specialities) && (
            <Table>
              <TableCell style={{ width: "40%" }}>
                {" "}
                <Typography ml={2} mt={2}>
                  {" "}
                  <FiberManualRecordIcon
                    style={{ color: theme.palette.primary.main, fontSize: 15, marginRight: 10 }}
                  />{" "}
                  Specialities
                </Typography>
              </TableCell>
              <TableCell width="5%">:</TableCell>
              <TableCell align="left" width="55%">
                <Typography mt={2}>{npi?.specialities && npi?.specialities?.join(",")}</Typography>
              </TableCell>
            </Table>
          )}

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
                <Typography mt={2}>{npi?.website}</Typography>
              </TableCell>
            </Table>
          )}

          {npi?.phone_no && (
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
                <Typography mt={2}>{formatPhoneNumber(npi?.phone_no)}</Typography>
              </TableCell>
            </Table>
          )}
        </TableContainer>
      </Paper>
      {npi?.insuranceIds && npi?.insuranceIds?.length > 0 && (
        <Paper
          elevation={0}
          style={{
            border: `2px solid ${theme.palette.primary.main}`,
            padding: 0,
            margin: 10,
            width: "100%",
          }}
        >
          <Typography ml={3} mt={3} mb={1} variant="h4" style={{ fontWeight: 500 }} color="primary">
            Insurance Accepted
          </Typography>
          <Grid mb={2} style={{ paddingLeft: 25, fontSize: 18, justifyContent: "center" }}>
            {(npi?.insuranceIds &&
              npi?.insuranceIds.map((insurance, i) => (
                <Typography mt={2} style={{ fontSize: 23 }} key={i}>
                  {insurance}
                </Typography>
              ))) ||
              "-"}
          </Grid>
        </Paper>
      )}

      {npi?.hospitalAffiliations && npi?.hospitalAffiliations?.length > 0 && (
        <Paper
          elevation={0}
          style={{
            border: `2px solid ${theme.palette.primary.main}`,
            padding: 0,
            margin: 10,
            width: "100%",
          }}
        >
          <Typography ml={3} mt={3} mb={1} variant="h4" style={{ fontWeight: 500 }} color="primary">
            Hospital Affiliations
          </Typography>
          <Grid mb={2} style={{ paddingLeft: 25, fontSize: 18, justifyContent: "center" }}>
            {(npi?.hospitalAffiliations &&
              npi?.hospitalAffiliations?.map((affliation, i) => (
                <Typography mt={2} style={{ fontSize: 18 }} key={i}>
                  {affliation?.lbn}
                </Typography>
              ))) ||
              "-"}
          </Grid>
        </Paper>
      )}
      <Paper
        elevation={0}
        style={{
          border: `2px solid ${theme.palette.primary.main}`,
          padding: 0,
          margin: 10,
          width: "100%",
        }}
      >
        <Typography ml={3} mt={3} mb={1} variant="h4" style={{ fontWeight: 500 }} color="primary">
          Doctor Location
        </Typography>
        <Grid mb={2} style={{ paddingLeft: 25, paddingRight: 25, fontSize: 18, justifyContent: "center" }}>
          <>
            {practiceAddress?.length > 0 ? (
              <div style={{ display: "flex" }}>
                <Typography fontSize={19}>
                  Practice Address:{" "}
                  {practiceAddress?.map((address, i) => (
                    <Typography mt={2} style={{ fontSize: 18 }} key={i}>
                      {`${toTitleCase(`${address.firstLineAddress}, ${address.city}`)}, ${
                        address.state
                      } - ${address.postalCode.slice(0, 5)}`}
                    </Typography>
                  ))}
                </Typography>
              </div>
            ) : (
              <div>
                <Typography>
                  Mailing Address:
                  {mailingAddress?.map((address, i) => (
                    <Typography mt={2} style={{ fontSize: 18 }} key={i}>
                      {`${toTitleCase(`${address.firstLineAddress}, ${address.city}`)}, ${
                        address.state
                      } - ${address.postalCode.slice(0, 5)}`}
                    </Typography>
                  ))}{" "}
                </Typography>
              </div>
            )}
          </>

          <DoctorLocationMap location={{ lat: npi?.practice_location?.lat, lng: npi?.practice_location?.lon }} />
        </Grid>
      </Paper>
    </Grid>
  );
};

export default NPIVerification;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    header: {
      background: theme.palette.primary.main,
      minHeight: 400,
    },
    doctorIcon: {
      height: "100%",
      width: 150,
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
      color: "#fff",
      marginBottom: 20,
    },
    doctorDescription: {
      fontSize: 18,
      width: "100%",
      color: "#fff",
    },
    tabs: {
      background: "#fff",
      padding: 2,
      borderRadius: 50,
      marginTop: 20,
      paddingLeft: 20,
      paddingRight: 20,
      width: "auto",
      alignSelf: "center",
      display: "flex",
      justifyContent: "center",
    },
    tab: {
      background: "#FFFFFF",
      borderRadius: 50,
      fontWeight: "bold",
      margin: 5,
      "&$selected": {
        backgroundColor: theme.palette.primary.main,
        color: "white",
        fontWeight: "bold",
      },
    },
    card_row: { display: "flex", columnGap: 30 },
  })
);
