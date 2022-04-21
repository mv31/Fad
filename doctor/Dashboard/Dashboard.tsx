import React, { FC, ReactElement, useState } from "react";
import Typography from "@mui/material/Typography";
import { makeStyles, createStyles } from "@mui/styles";
import { useRouter } from "next/router";
import { CommunicationRequestQuickView } from "../CommunicationRequests/CommunicationRequestQuickView";
import CardItem from "@src/components/consumer/Dashboard/DashboardCard";
import { DashboardRoutes, DoctorRoutes } from "@src/routes/DashboardRoutes";
import QuickViewModal from "../../dashboard/QuickViewModal";
import AppointmentCard from "../Appointments/AppointmentCard";
import { doctorList, otherServices } from "@src/../../Constants";
import { MyConsumersList } from "../MyConsumers/MyConsumersList";
import { Badge, Paper, Theme, useTheme } from "@mui/material";
import { UIContainer } from "@gogocode-package/ui-web";
import { useWindowSize } from "@src/../../packages/utils/src";
import { useGet_Count_Of_Unread_EmailsQuery } from "@src/../../packages/graphql_code_generator/src";
import { GET_COUNT_OF_DRAFT_MAILS } from "@src/components/consumer/Dashboard/Dashboard";

export type DashboardItems = {
  title: string;
  src: string;
  link: string;
  component?: ReactElement;
  cardDescription?: string;
  src1: string;
  tooltipTitle: string;
  badgeCount?: number;
};

const Cards: FC = () => {
  const styles = useStyles();
  const theme = useTheme();
  const [quickViewModal, setQuickViewModal] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<number>(1);
  const [isUpperHover, setIsUpperHover] = useState<boolean>(false);
  const [isLowerHover, setIsLowerHover] = useState<boolean>(false);
  const classes = useStyles();
  const router = useRouter();
  const { height, width } = useWindowSize();
  const { data } = useGet_Count_Of_Unread_EmailsQuery(GET_COUNT_OF_DRAFT_MAILS, {
    pollInterval: Number(process.env.NEXT_PUBLIC_MAIL_POLL_INTERVAL || 5000),
  });

  function doctorSearch() {
    router.push({
      pathname: "/search",
      query: { type: "doctor" },
    });
  }

  function otherPractice() {
    router.push({
      pathname: "/search",
      query: { type: "other" },
    });
  }

  const items: DashboardItems[] = [
    // {
    //   title: "My Consumers",
    //   link: DoctorRoutes.My_Consumers,
    //   src: "/rafiki.svg",
    //   component: <MyConsumersList isQuickView />,
    //   cardDescription: "View consumers connected with you",
    //   src1: "/rafiki.svg",
    //   tooltipTitle: "Quickview for My Consumer's List",
    // },
    {
      title: "My Consumers",
      link: DoctorRoutes.CommunicationRequest,
      src: "/communication.svg",
      src1: "/bro.svg",
      component: <CommunicationRequestQuickView />,
      cardDescription: "Shows consumers waiting for your approval to communicate",
      tooltipTitle: "Quickview for Consumers to Whom are waiting to connect",
    },
    // { title: "Mailbox", link: DashboardRoutes.MAIL_BOX, src: "/mail box.svg" },
    {
      title: "Communication",
      link: DashboardRoutes.MAIL_BOX,
      src: "/mail box.svg",
      src1: "/mail box.svg",
      cardDescription: "Generate mails and view mails",
      tooltipTitle: "Quickview for mail view",
      badgeCount: data?.get_count_of_unread_emails,
    },
  ];

  return (
    <UIContainer>
      <div style={{ display: "flex", justifyContent: "center", gap: "2%" }}>
        <Paper
          className={classes.searchPaper}
          style={{ height: height - height * (50 / 100) - 60 }}
          elevation={0}
          onClick={doctorSearch}
          onMouseLeave={() => {
            setIsUpperHover(false);
            setIsLowerHover(false);
          }}
        >
          {" "}
          <div
            onMouseOver={() => {
              setIsUpperHover(true);
            }}
            onMouseLeave={() => {
              setIsUpperHover(false);
            }}
            className={classes.upperContent}
            style={{ backgroundColor: isUpperHover ? theme.palette.primary.main : theme.palette.secondary.main }}
          >
            <div
              style={{
                display: "flex",
                height: "100%",
                textAlign: "center",
                alignItems: "center",
                justifyContent: "space-evenly",
                width: "100%",
              }}
            >
              <div style={{ height: "90%", alignSelf: "center" }}>
                <img height={"100%"} width={"100%"} src="/DoctorCard.png" />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  textAlign: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <Typography
                  fontSize={isUpperHover ? 28 : 40}
                  color={isUpperHover ? "#fff" : "black"}
                  alignSelf={"center"}
                >
                  Doctors
                </Typography>
              </div>
              {isUpperHover && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-evenly",
                    width: "30%",
                  }}
                >
                  {doctorList.map((data, index) => {
                    return (
                      <div key={index} className={classes.wrapper}>
                        <img className={classes.icon} src={data.image} alt={data.altText} />
                        <p className={classes.description}>{data.title}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </Paper>

        <Paper
          className={classes.searchPaper}
          style={{ height: height - height * (50 / 100) - 60 }}
          elevation={0}
          onClick={otherPractice}
          onMouseLeave={() => {
            setIsUpperHover(false);
            setIsLowerHover(false);
          }}
        >
          {" "}
          <div
            onMouseOver={() => {
              setIsLowerHover(true);
            }}
            onMouseLeave={() => {
              setIsLowerHover(false);
            }}
            className={classes.upperContent}
            style={{ backgroundColor: isLowerHover ? theme.palette.primary.main : theme.palette.secondary.main }}
          >
            <div
              style={{
                display: "flex",
                height: "100%",
                textAlign: "center",
                alignItems: "center",
                justifyContent: "space-evenly",
                width: "100%",
              }}
            >
              <div style={{ height: "90%", alignSelf: "center" }}>
                <img height={"100%"} width={"100%"} src="/OtherPractitionerCard.png" />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  textAlign: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <Typography
                  alignSelf={"center"}
                  fontSize={isLowerHover ? 28 : 40}
                  color={isLowerHover ? "#fff" : "black"}
                >
                  Other Health Care Practitioners
                </Typography>
              </div>
              {isLowerHover && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-evenly",
                    width: "30%",
                  }}
                >
                  {otherServices.map((data, index) => {
                    return (
                      <div key={index} className={classes.wrapper}>
                        <img className={classes.icon} src={data.image} alt={data.altText} />
                        <p className={classes.description}>{data.title}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </Paper>
      </div>

      <div className={styles.container}>
        {items.map((item, index) => {
          return (
            <CardItem
              onclickCard={() => {
                router.push(item.link);
              }}
              key={index}
              item={item}
              quickAction={() => {
                setQuickViewModal(true);
                setSelectedItems(index);
              }}
              cardDescription={item.cardDescription}
              tooltipTitle={item.tooltipTitle}
            />
          );
        })}
        <AppointmentCard />
        {quickViewModal && (
          <QuickViewModal
            isOpen={quickViewModal}
            onClose={() => {
              setQuickViewModal(false);
            }}
            component={items[selectedItems].component}
            title={items[selectedItems].title}
            link={items[selectedItems].link}
            maxWidth={items[selectedItems]?.title == "Eligibility" ? "xl" : "lg"}
          />
        )}
      </div>
    </UIContainer>
  );
};

function Dashboard() {
  const styles = useStyles();
  return (
    <div className={styles.root}>
      <div style={{ margin: 5 }}>
        <Cards />
      </div>
    </div>
  );
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: "1%",
    },
    container: {
      display: "flex",
      width: "100%",
      rowGap: 10,
      // columnGap: 20,
      flexWrap: "wrap",

      // backgroundColor: "red",
      justifyContent: "space-between",
      marginTop: 10,
      // height: "420px",
      // alignItems: "center",
    },
    paper: {
      height: 400,
      width: 550,

      // display: "flex",
      justifyContent: "space-evenly",
      alignItems: "center",
      marginBottom: "2%",
      // borderRadius: "5%",
      // flexDirection: "column",
      // padding: "1%",
      cursor: "pointer",
      backgroundColor: theme.palette.secondary.main,
    },
    title: {
      fontWeight: "bold",
    },
    upper: {
      height: "100%",
      width: 250,
      background: theme.palette.secondary.main,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      cursor: "pointer",
      position: "relative",
      borderRadius: 40,
      borderBottomRightRadius: 0,
      borderBottomLeftRadius: 0,
    },
    upperContent: {
      // background: theme.palette.primary.main,hoverContent
      // backgroundColor: "red",
      alignSelf: "flex-start",
      width: "100%",
      height: "100%",
      transition: "all .3s",
      // borderRadius: 0,
      // borderBottomRightRadius: 20,
      // borderBottomLeftRadius: 20,
      padding: 0,
      margin: 0,
    },
    wrapper: {
      display: "flex",
      alignItems: "center",
      gap: 5,
    },
    icon: {
      height: 23,
      width: 23,
      marginLeft: 10,
    },
    description: {
      fontSize: 18,
      color: "#fff",
      alignSelf: "flex-start",
    },
    lowerContent: {
      //background: theme.palette.primary.main,
      alignSelf: "flex-start",
      width: "100%",
      height: "100%",
      transition: "all .3s",
      borderBottomRightRadius: 20,
      borderBottomLeftRadius: 20,
    },
    hoverContent: {
      background: theme.palette.primary.main,

      display: "flex",
      alignSelf: "flex-start",
      width: "100%",
      height: "100%",
      transition: "all .3s",
      // borderRadius: 30,
      // borderBottomRightRadius: 30,
      // borderBottomLeftRadius: 30,
    },
    hoverLowerContent: {
      background: theme.palette.primary.main,

      display: "flex",
      alignSelf: "flex-start",
      width: "100%",
      height: "100%",
      transition: "all .3s",
      // borderRadius: 30,
      // borderBottomRightRadius: 30,
      // borderBottomLeftRadius: 30,
    },
    wrapper2: {
      display: "flex",
      alignItems: "center",
      gap: 10,
    },
    searchPaper: {
      // height: 400,
      width: "50%",

      // display: "flex",
      justifyContent: "space-evenly",
      alignItems: "center",
      marginBottom: "2%",
      // borderRadius: "5%",
      // flexDirection: "column",
      // padding: "1%",
      cursor: "pointer",
      backgroundColor: theme.palette.secondary.main,
    },
    badge: {
      fontSize: 18,
      height: 25,
      width: 25,
      borderRadius: 50,
    },
  })
);

export default Dashboard;
