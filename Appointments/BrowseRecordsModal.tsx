import React, { useEffect, useState } from "react";
import {
  Typography,
  TableRow,
  tableCellClasses,
  TablePagination,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableBody,
  CircularProgress,
  useTheme,
  Link,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Theme,
} from "@mui/material";
import { TablePaginationActions } from "@src/components/mailbox/MailTable";
import { DEFAULT_TABLE_LIMIT, QUICK_VIEW_LIMIT } from "@src/../../Constants";
import { StyledTableCell } from "@src/components/dashboard/StyledTableComponents";
import PagePanel from "@src/components/PagePanel";
import moment from "moment";
import * as GoGQL from "@gogocode-package/graphql_code_generator";
import { UIModel, UIPrimaryButton } from "@gogocode-package/ui-web";
import AddMedicalRecordModal from "@src/components/consumer/MedicaRecords/AddMedicalRecordModal";
import { gql } from "@apollo/client";
import MedicalRecordAttachmentModal from "@src/components/consumer/MedicaRecords/MedicalRecordAttachmentModal";
import { StyledTableRow } from "@src/components/doctor/CommunicationRequests/CommunicationRequestQuickView";
import { QuickViewStates } from "@src/DataPullState";
import { makeStyles } from "@mui/styles";
import { Add } from "@mui/icons-material";
import { GET_MEDICAL_RECORDS } from "../MedicaRecords/MedicalRecords";

export type RecordAttachment = {
  signed_url: string;
  record_url: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ids: number[]) => void;
  memberId: string;
  selection?: boolean;
};

type RecordsState = {
  records: GoGQL.MedicalRecord;
  checked: boolean;
};

// const GET_MEDICAL_RECORDS = gql`
//   query get_medical_records($input: GetMedicalRecordsInput!) {
//     get_medical_records(input: $input) {
//       rows {
//         id
//         record_name
//         record_date
//         record_type
//         hospital_name
//         PatientMember {
//           id
//           member_full_name
//           member_type
//         }
//         MedicalRecordUrls {
//           record_url
//           signed_url
//         }
//       }
//       count
//     }
//   }
// `;

const BrowseRecordsModal = (props: Props) => {
  const { selection = false } = props;
  const theme = useTheme();
  const styles = useStyles();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(DEFAULT_TABLE_LIMIT);
  const [attachmentsModalOpen, setAttachmentsModalOpen] = useState<boolean>(false);
  const [recordAttachmentModalOpen, setRecordAttachmentModalOpen] = useState<boolean>(false);
  const [selectedAttachmentUrls, setSelectedAttachmentUrls] = useState<GoGQL.MedicalRecordUrl[]>(null);
  const [records, setRecords] = useState<RecordsState[]>([]);
  const [disableSave, setDisableSave] = useState<boolean>(false);
  const [allSelected, setAllSelected] = useState<boolean>(false);

  const [GetMedicalRecordsRequest, GetMedicalRecordsResponse] = GoGQL.useGet_Medical_RecordsLazyQuery(
    GET_MEDICAL_RECORDS,
    { fetchPolicy: "cache-and-network" }
  );

  const setDatas = () => {
    let existingRecords = [];
    GetMedicalRecordsResponse?.data?.get_medical_records?.rows?.map((record) => {
      existingRecords.push({ records: record, checked: false });
    });
    setRecords(existingRecords);
  };

  const makeRequest = () => {
    GetMedicalRecordsRequest({
      variables: {
        input: {
          page_no: 0,
          limit: null,
          memberId: Number(props?.memberId),
        },
      },
    });
  };

  useEffect(() => {
    makeRequest();
  }, []);

  useEffect(() => {
    if (GetMedicalRecordsResponse?.data) {
      QuickViewStates.update((s) => {
        s.isShowAll = GetMedicalRecordsResponse?.data?.get_medical_records?.count > QUICK_VIEW_LIMIT;
      });
      setDatas();
    }
  }, [GetMedicalRecordsResponse?.data]);
  useEffect(() => {
    if (records.filter((record) => record.checked).map((record) => Number(record.records?.id)).length == 0) {
      setDisableSave(true);
    } else {
      setDisableSave(false);
    }
  }, [records]);
  const handleChange = (index) => {
    setRecords(records.map((record, i) => (i == index ? { ...record, checked: !record.checked } : record)));
  };
  const handleAllSelected = (e) => {
    if (e.target.checked) setRecords(records.map((record) => ({ ...record, checked: true })));
    else setRecords(records.map((record) => ({ ...record, checked: false })));
  };

  const onSave = () => {
    console.log(
      "uds",
      records.filter((record) => record.checked).map((record) => record?.records?.id)
    );
    props.onSave(records.filter((record) => record.checked).map((record) => Number(record?.records?.id)));
    props?.onClose();
  };

  return (
    <UIModel
      isOpen={props?.isOpen}
      onClose={props.onClose}
      title="Browse Medical Records"
      maxWidth="lg"
      cancelText="Close"
      action={selection && <UIPrimaryButton onClick={onSave}>Save</UIPrimaryButton>}
    >
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <UIPrimaryButton
          onClick={(e) => {
            e.stopPropagation();
            setAttachmentsModalOpen(true);
          }}
        >
          <Add />
          Add Records
        </UIPrimaryButton>
      </div>
      <TableContainer
        style={{
          marginTop: 30,
        }}
        component={Paper}
      >
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              {selection && (
                <StyledTableCell align="center" width={"10%"} style={{ color: theme.palette.primary.main }}>
                  <Checkbox
                    checked={!(records.filter((record) => !record.checked).length > 0)}
                    onChange={(e) => handleAllSelected(e)}
                  />
                </StyledTableCell>
              )}
              {/* <StyledTableCell align="center" width={"10%"} style={{ color: theme.palette.primary.main }}>
                #
              </StyledTableCell> */}
              <StyledTableCell
                style={{ minWidth: "20%", fontWeight: 600, color: theme.palette.primary.main }}
                align="center"
              >
                Title
              </StyledTableCell>
              {/* <StyledTableCell
                style={{ minWidth: "20%", fontWeight: 600, color: theme.palette.primary.main }}
                align="center"
              >
                Member
              </StyledTableCell> */}
              <StyledTableCell style={{ fontWeight: 600, color: theme.palette.primary.main }} align="center">
                Date
              </StyledTableCell>
              <StyledTableCell style={{ fontWeight: 600, color: theme.palette.primary.main }} align="center">
                Record Type
              </StyledTableCell>
              <StyledTableCell style={{ fontWeight: 600, color: theme.palette.primary.main }} align="center">
                Attachment
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {GetMedicalRecordsResponse?.data?.get_medical_records?.count == 0 && (
              <StyledTableRow>
                <StyledTableCell colSpan={7} style={{ textAlign: "center" }}>
                  {" "}
                  <Typography>No Medical Records Found</Typography>
                </StyledTableCell>
              </StyledTableRow>
            )}
            {GetMedicalRecordsResponse?.loading && (
              <div style={{ flex: 1, display: "flex", justifyContent: "center", margin: 20, marginTop: 40 }}>
                <CircularProgress color="success" />
              </div>
            )}
            {records?.map((row, i) => (
              <>
                <TableRow
                  key={row?.records?.id}
                  onClick={() => handleChange(i)}
                  className={styles.tableRow}
                  style={{ cursor: "pointer" }}
                >
                  {selection && (
                    <StyledTableCell align="center">
                      <Checkbox checked={row?.checked} onChange={() => handleChange(i)} />
                    </StyledTableCell>
                  )}
                  {/* <StyledTableCell align="center">
                    <Typography style={{ display: "inline-block" }}>{i + 1}</Typography>
                  </StyledTableCell> */}
                  <StyledTableCell align="left">
                    <Typography style={{ display: "inline-block" }}>{row?.records?.record_name}</Typography>
                  </StyledTableCell>
                  {/* <StyledTableCell align="left">
                    <Typography style={{}}>
                      {row?.records?.PatientMember?.member_full_name + `(${row?.records?.PatientMember?.member_type})`}
                    </Typography>
                  </StyledTableCell> */}
                  <StyledTableCell align="center">
                    <Typography style={{}}>
                      {row?.records?.record_date
                        ? moment(row?.records?.record_date, "YYYY-MM-DDThh:mm:ssZ").format("MMM DD, YYYY")
                        : "-"}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Typography style={{}}>{row?.records?.record_type}</Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <UIPrimaryButton
                      variant="outlined"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAttachmentUrls(row?.records?.MedicalRecordUrls);
                        setRecordAttachmentModalOpen(true);
                      }}
                    >
                      View
                    </UIPrimaryButton>
                  </StyledTableCell>
                </TableRow>
              </>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <MedicalRecordAttachmentModal
        isOpen={recordAttachmentModalOpen}
        onClose={() => setRecordAttachmentModalOpen(false)}
        attachmentUrls={selectedAttachmentUrls}
      />
      <AddMedicalRecordModal
        isOPen={attachmentsModalOpen}
        memberId={Number(props?.memberId)}
        onClose={() => {
          setAttachmentsModalOpen(false);
        }}
      />
    </UIModel>
  );
};

export default BrowseRecordsModal;

const useStyles = makeStyles((theme: Theme) => ({
  tableRow: {
    "&:hover": {
      backgroundColor: `${theme.palette.secondary} !important`,
    },
  },
}));
